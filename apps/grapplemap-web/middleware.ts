export { auth as middleware } from '@/lib/auth';

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
