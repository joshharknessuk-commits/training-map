import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { Providers } from './providers';
import AppHeaderWrapper from '@/components/AppHeaderWrapper';

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
          <AppHeaderWrapper />
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
