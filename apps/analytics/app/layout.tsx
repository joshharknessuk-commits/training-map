import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'GrappleMap Insights - BJJ Tournament Analytics',
  description:
    'Deep analytics for BJJ tournaments including ADCC, IBJJF, AJP, Polaris, EBI, and more. Track techniques, athletes, teams, and meta trends.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
