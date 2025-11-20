import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware that checks for authentication
// Using a lightweight approach to avoid Edge Runtime issues with database imports
export function middleware(request: NextRequest) {
  // For now, let pages handle their own authentication via useSession
  // This prevents Edge Runtime issues with database connections
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/classes/:path*',
    '/bookings/:path*',
    '/feed/:path*',
    '/discover/:path*',
    '/gym-dashboard/:path*',
  ],
};
