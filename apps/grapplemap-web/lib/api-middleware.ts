import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkCsrf } from '@/lib/csrf';
import { checkRateLimit, RateLimits, type RateLimitConfig } from '@/lib/rate-limit';

/**
 * Result type for API protection middleware
 * Uses discriminated union for proper type narrowing
 */
export type ApiProtectionResult =
  | { error: NextResponse; userId: null }
  | { error: null; userId: string };

/**
 * Standard API middleware for protected routes
 *
 * This provides a deep module that encapsulates:
 * - Rate limiting (DoS protection)
 * - Authentication checking
 * - CSRF protection
 * - Standard error responses
 *
 * Following Ousterhout's principles:
 * - Deep module: Complex functionality (rate limit + auth + CSRF) with simple interface
 * - Information hiding: Caller doesn't need to know about security details
 * - Reduces duplication: Single source of truth for API security
 *
 * @example
 * import { withApiProtection } from '@/lib/api-middleware';
 *
 * export async function POST(request: NextRequest) {
 *   const { error, userId } = await withApiProtection(request);
 *   if (error) return error;
 *
 *   // Your handler logic here, userId is guaranteed to exist
 *   const body = await request.json();
 *   // ...
 * }
 */
export async function withApiProtection(
  request: NextRequest,
  rateLimitConfig: RateLimitConfig = RateLimits.MUTATION
): Promise<ApiProtectionResult> {
  // Check rate limit first (cheapest check, prevents DoS)
  const rateLimitError = checkRateLimit(request, rateLimitConfig);
  if (rateLimitError) {
    return { error: rateLimitError, userId: null };
  }

  // Check CSRF token for state-changing requests
  const csrfError = checkCsrf(request);
  if (csrfError) {
    return { error: csrfError, userId: null };
  }

  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      userId: null,
    };
  }

  return { error: null, userId: session.user.id };
}

/**
 * Protection for routes that need authentication but not CSRF
 * (e.g., GET requests)
 *
 * Includes rate limiting to prevent abuse of read endpoints.
 */
export async function withAuthOnly(
  request: NextRequest,
  rateLimitConfig: RateLimitConfig = RateLimits.READ
): Promise<ApiProtectionResult> {
  // Check rate limit
  const rateLimitError = checkRateLimit(request, rateLimitConfig);
  if (rateLimitError) {
    return { error: rateLimitError, userId: null };
  }

  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      userId: null,
    };
  }

  return { error: null, userId: session.user.id };
}
