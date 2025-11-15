import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'BJJ London Map',
  description:
    'Interactive map of Brazilian Jiu-Jitsu gyms across Greater London with coverage rings.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
