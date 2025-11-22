import type { ReactNode } from 'react';
import Link from 'next/link';
import { ContactButton } from '@ui/contact-button';

interface NetworkShellProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  primaryCtaHref?: string;
  primaryCtaLabel?: string;
  showDashboardCta?: boolean;
}

export function NetworkShell({
  title = 'Train anywhere. Stay connected.',
  subtitle = 'Open mats across London. One membership.',
  children,
  primaryCtaHref = '/network#membership',
  primaryCtaLabel = 'Join the Network',
  showDashboardCta = false,
}: NetworkShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-neutral-900">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-50/50 via-white to-neutral-50" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-transparent via-transparent to-neutral-100/40" />
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22none%22 stroke=%22rgba(15,23,42,0.04)%22 stroke-width=%221%22/%3E%3C/svg%3E')",
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(14,165,233,0.08), transparent 55%)', animation: 'pulse 6s ease-in-out infinite' }} />
      <div className="relative">
        {/* Hero Section */}
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-16 pt-24 text-center sm:px-10">
          <h1 className="text-6xl font-semibold tracking-tight text-neutral-900 sm:text-7xl">{title}</h1>
          <p className="text-xl font-light text-neutral-800">{subtitle}</p>
          <p className="text-sm font-light text-neutral-700">
            Built to strengthen grappling communities, not centralise them.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
            <p className="text-sm text-neutral-800">
              <span className="font-semibold text-neutral-900">For members:</span> Train anywhere without drop-in hassles.
            </p>
            <p className="text-sm text-neutral-800">
              <span className="font-semibold text-neutral-900">For gyms:</span> Automated payouts, verified attendance.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/network/members"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-gradient-to-r from-brand-500 via-brand-600 to-accent-500 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-glow transition duration-200 hover:scale-[1.03]"
            >
              Join as member
            </Link>
            <Link
              href="/network/gyms"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-neutral-300 bg-neutral-50 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-neutral-800 transition duration-200 hover:bg-neutral-100 hover:text-neutral-900"
            >
              Join as gym
            </Link>
            <ContactButton
              className="!flex-row !items-center !gap-2"
              buttonClassName="justify-center rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-800 transition duration-200 hover:border-neutral-400"
            />
          </div>
        </div>
        <main className="mx-auto w-full max-w-6xl px-6 pb-24 sm:px-10">{children}</main>
      </div>
    </div>
  );
}
