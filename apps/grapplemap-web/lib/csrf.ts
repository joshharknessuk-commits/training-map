import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * CSRF Protection using Double Submit Cookie pattern
 *
 * This implementation uses a double-submit cookie approach where:
 * 1. A random token is generated and stored in a cookie
 * 2. The same token must be sent in a custom header (X-CSRF-Token)
 * 3. Both must match for the request to be valid
 *
 * This protects against CSRF attacks because:
 * - Cookies are automatically sent by the browser
 * - But custom headers cannot be set by cross-origin requests
 * - So an attacker cannot forge a valid request
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure random CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Validate CSRF token from request
 * Returns true if token is valid, false otherwise
 */
export function validateCsrfToken(request: NextRequest): boolean {
  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  // Both must exist and match
  if (!cookieToken || !headerToken) {
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  );
}

/**
 * Middleware to check CSRF token on state-changing requests
 * Call this at the start of POST/PUT/DELETE/PATCH handlers
 *
 * @example
 * export async function POST(request: NextRequest) {
 *   const csrfError = checkCsrf(request);
 *   if (csrfError) return csrfError;
 *
 *   // ... rest of handler
 * }
 */
export function checkCsrf(request: NextRequest): NextResponse | null {
  const method = request.method;

  // Only check state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return null;
  }

  // Skip CSRF check for Stripe webhooks (they use signature verification)
  if (request.nextUrl.pathname.includes('/api/webhooks/stripe')) {
    return null;
  }

  // Validate token
  if (!validateCsrfToken(request)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Set CSRF token cookie in response
 * Call this when creating a new session or when token is missing
 */
export function setCsrfCookie(response: NextResponse, token?: string): void {
  const csrfToken = token || generateCsrfToken();

  response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Get CSRF token from request cookies
 * Use this to provide the token to client-side code
 */
export function getCsrfToken(request: NextRequest): string | undefined {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value;
}
