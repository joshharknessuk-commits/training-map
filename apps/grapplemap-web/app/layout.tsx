import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { Providers } from './providers';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'GrappleMap Network - BJJ London',
  description:
    'Connect with BJJ gyms and grapplers across Greater London. Find classes, book training sessions, and grow your network.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>
          <Navigation />
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
