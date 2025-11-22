import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkCsrf } from '@/lib/csrf';

/**
 * Standard API middleware for protected routes
 *
 * This provides a deep module that encapsulates:
 * - Authentication checking
 * - CSRF protection
 * - Standard error responses
 *
 * Following Ousterhout's principles:
 * - Deep module: Complex functionality (auth + CSRF) with simple interface
 * - Information hiding: Caller doesn't need to know about CSRF/auth details
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
  request: NextRequest
): Promise<{ error: NextResponse | null; userId: string | null }> {
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
 * Optional: Protection for routes that need authentication but not CSRF
 * (e.g., GET requests)
 */
export async function withAuthOnly(
  request: NextRequest
): Promise<{ error: NextResponse | null; userId: string | null }> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      userId: null,
    };
  }

  return { error: null, userId: session.user.id };
}
