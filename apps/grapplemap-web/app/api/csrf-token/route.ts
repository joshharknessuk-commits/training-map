import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken, getCsrfToken, setCsrfCookie } from '@/lib/csrf';

/**
 * GET /api/csrf-token
 *
 * Provides CSRF token to client applications.
 * If no token exists in cookies, generates a new one.
 *
 * Client should:
 * 1. Call this endpoint on app initialization
 * 2. Store the token
 * 3. Include it in X-CSRF-Token header for all POST/PUT/DELETE/PATCH requests
 *
 * @example
 * // Client-side usage
 * const response = await fetch('/api/csrf-token');
 * const { token } = await response.json();
 *
 * // Then use in requests:
 * fetch('/api/profile', {
 *   method: 'PUT',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'X-CSRF-Token': token,
 *   },
 *   body: JSON.stringify(data),
 * });
 */
export async function GET(request: NextRequest) {
  // Check if token already exists
  let token = getCsrfToken(request);

  // Generate new token if needed
  if (!token) {
    token = generateCsrfToken();
  }

  const response = NextResponse.json({ token });

  // Set cookie with the token
  setCsrfCookie(response, token);

  return response;
}
