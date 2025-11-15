import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NetworkShell } from '../components/network-shell';

export const metadata: Metadata = {
  title: 'GrappleMap Network',
  description: 'Premium membership and QR-enabled open-mat access.',
};

export default function NetworkLayout({ children }: { children: ReactNode }) {
  return <NetworkShell>{children}</NetworkShell>;
}
