import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate Limiter using Sliding Window algorithm
 *
 * Prevents DoS attacks by limiting requests per IP address or user ID.
 * Uses in-memory storage with automatic cleanup to prevent memory leaks.
 *
 * Following Ousterhout's principles:
 * - Deep module: Complex rate limiting logic with simple interface
 * - Information hiding: Routes don't need to know implementation details
 * - Self-cleaning: Automatically removes expired entries
 */

interface RateLimitEntry {
  timestamps: number[];
  lastCleanup: number;
}

// In-memory store: Map<identifier, RateLimitEntry>
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup interval: Remove old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastGlobalCleanup = Date.now();

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Optional custom identifier (defaults to IP address) */
  identifier?: string;
}

/**
 * Default rate limits for different endpoint types
 */
export const RateLimits = {
  // Strict limits for authentication
  AUTH: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 min

  // Moderate limits for mutations
  MUTATION: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 per minute

  // Generous limits for reads
  READ: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute

  // Very strict for sensitive operations
  SENSITIVE: { maxRequests: 3, windowMs: 60 * 1000 }, // 3 per minute
} as const;

/**
 * Get identifier for rate limiting (IP address or custom)
 */
function getIdentifier(request: NextRequest, customIdentifier?: string): string {
  if (customIdentifier) return customIdentifier;

  // Try to get real IP from various headers (for proxies/CDNs)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to direct IP
  return request.ip || 'unknown';
}

/**
 * Clean up old entries from rate limit store
 */
function cleanupOldEntries(windowMs: number): void {
  const now = Date.now();
  const cutoff = now - windowMs;

  // Global cleanup: Remove completely expired entries
  if (now - lastGlobalCleanup > CLEANUP_INTERVAL) {
    for (const [key, entry] of rateLimitStore.entries()) {
      // Remove if no recent requests
      if (entry.timestamps.length === 0 || entry.timestamps[entry.timestamps.length - 1] < cutoff) {
        rateLimitStore.delete(key);
      }
    }
    lastGlobalCleanup = now;
  }
}

/**
 * Check if request should be rate limited
 *
 * @param request - NextRequest object
 * @param config - Rate limit configuration
 * @returns NextResponse if rate limited, null if allowed
 *
 * @example
 * const rateLimitResponse = checkRateLimit(request, RateLimits.MUTATION);
 * if (rateLimitResponse) return rateLimitResponse;
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): NextResponse | null {
  const { maxRequests, windowMs, identifier: customIdentifier } = config;
  const identifier = getIdentifier(request, customIdentifier);
  const now = Date.now();
  const cutoff = now - windowMs;

  // Get or create entry
  let entry = rateLimitStore.get(identifier);
  if (!entry) {
    entry = { timestamps: [], lastCleanup: now };
    rateLimitStore.set(identifier, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(ts => ts > cutoff);

  // Check if limit exceeded
  if (entry.timestamps.length >= maxRequests) {
    const oldestTimestamp = entry.timestamps[0];
    const resetTime = oldestTimestamp + windowMs;
    const retryAfter = Math.ceil((resetTime - now) / 1000);

    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetTime.toString(),
        },
      }
    );
  }

  // Add current timestamp
  entry.timestamps.push(now);

  // Periodic cleanup
  cleanupOldEntries(windowMs);

  return null;
}

/**
 * Get rate limit status for an identifier
 * Useful for displaying limits to users
 */
export function getRateLimitStatus(
  request: NextRequest,
  config: RateLimitConfig
): {
  limit: number;
  remaining: number;
  reset: number;
} {
  const { maxRequests, windowMs, identifier: customIdentifier } = config;
  const identifier = getIdentifier(request, customIdentifier);
  const now = Date.now();
  const cutoff = now - windowMs;

  const entry = rateLimitStore.get(identifier);
  if (!entry) {
    return {
      limit: maxRequests,
      remaining: maxRequests,
      reset: now + windowMs,
    };
  }

  const recentRequests = entry.timestamps.filter(ts => ts > cutoff);
  const remaining = Math.max(0, maxRequests - recentRequests.length);
  const reset = recentRequests[0] ? recentRequests[0] + windowMs : now + windowMs;

  return {
    limit: maxRequests,
    remaining,
    reset,
  };
}

/**
 * Reset rate limit for a specific identifier
 * Useful for testing or manual intervention
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Clear all rate limit data
 * Useful for testing
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
  lastGlobalCleanup = Date.now();
}
