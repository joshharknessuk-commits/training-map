import { eq, lt, sql } from 'drizzle-orm';
import { getDrizzleDb } from './drizzle';
import { rateLimits } from './schema';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests?: number;
  resetTime?: Date;
}

/**
 * Database-backed rate limiting that works across serverless function instances
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const db = getDrizzleDb();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.windowMs);

  try {
    // Clean up expired entries periodically (1% chance)
    if (Math.random() < 0.01) {
      await db.delete(rateLimits).where(lt(rateLimits.expiresAt, now));
    }

    // Try to get existing rate limit entry
    const existing = await db.query.rateLimits.findFirst({
      where: eq(rateLimits.key, key),
    });

    if (!existing) {
      // First request - create new entry
      await db.insert(rateLimits).values({
        key,
        count: 1,
        firstRequest: now,
        expiresAt,
      });

      return {
        allowed: true,
        remainingRequests: config.maxRequests - 1,
        resetTime: expiresAt,
      };
    }

    // Check if window has expired
    if (existing.expiresAt <= now) {
      // Window expired, reset the counter
      await db
        .update(rateLimits)
        .set({
          count: 1,
          firstRequest: now,
          expiresAt,
        })
        .where(eq(rateLimits.key, key));

      return {
        allowed: true,
        remainingRequests: config.maxRequests - 1,
        resetTime: expiresAt,
      };
    }

    // Check if limit exceeded
    if (existing.count >= config.maxRequests) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: existing.expiresAt,
      };
    }

    // Increment counter
    await db
      .update(rateLimits)
      .set({
        count: sql`${rateLimits.count} + 1`,
      })
      .where(eq(rateLimits.key, key));

    return {
      allowed: true,
      remainingRequests: config.maxRequests - existing.count - 1,
      resetTime: existing.expiresAt,
    };
  } catch (error) {
    // On database error, allow the request (fail open)
    // but log the error for monitoring
    console.error('Rate limit check failed:', error);
    return { allowed: true };
  }
}
