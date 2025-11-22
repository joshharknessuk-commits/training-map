import type { ReactNode } from 'react';
import Link from 'next/link';
import { GrappleMapWordmark } from '@ui/grapple-map-wordmark';
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
        <header className="sticky top-0 z-[1010] border-b border-neutral-200 bg-white/90 backdrop-blur">
          <div className="flex w-full flex-wrap items-center justify-between gap-4 px-2 py-4 sm:px-4">
            <Link
              href="/network"
              aria-label="Return to network home"
              className="inline-flex items-center rounded-r-full bg-transparent pl-1 pr-2 text-left transition hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              <GrappleMapWordmark
                logoWrapperClassName="ml-[0.05em] h-28 w-28 shrink-0 sm:h-20 sm:w-20"
                textClassName="flex items-center text-2xl font-semibold uppercase tracking-[0.2em] text-brand-600"
              />
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-neutral-600 sm:justify-end">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-1 transition hover:-translate-y-0.5 hover:border-neutral-400 hover:text-neutral-900"
              >
                <span aria-hidden="true">🗺</span>
                Public Map
              </Link>
              <Link
                href="/network"
                className="inline-flex items-center gap-2 rounded-full border border-brand-400 bg-brand-50 px-3 py-1 text-brand-700 transition hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-100"
              >
                <span aria-hidden="true">⚡</span>
                Network HQ
              </Link>
              <Link
                href="/network/checkin"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-1 transition hover:-translate-y-0.5 hover:border-neutral-400 hover:text-neutral-900"
              >
                <span aria-hidden="true">📱</span>
                Check-in Tool
              </Link>
            </div>
          </div>
        </header>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-16 pt-24 text-center sm:px-10">
          <h1 className="text-6xl font-semibold tracking-tight text-neutral-900 sm:text-7xl">{title}</h1>
          <p className="text-xl font-light text-neutral-700">{subtitle}</p>
          <p className="text-sm font-light text-neutral-600">
            Built to strengthen grappling communities, not centralise them.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
            <p className="text-sm text-neutral-700">
              <span className="font-semibold text-neutral-900">For members:</span> Train anywhere without drop-in hassles.
            </p>
            <p className="text-sm text-neutral-700">
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
              className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-neutral-300 bg-neutral-50 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-neutral-700 transition duration-200 hover:bg-neutral-100 hover:text-neutral-900"
            >
              Join as gym
            </Link>
            <ContactButton
              className="!flex-row !items-center !gap-2"
              buttonClassName="justify-center rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-700 transition duration-200 hover:border-neutral-400"
            />
          </div>
        </div>
        <main className="mx-auto w-full max-w-6xl px-6 pb-24 sm:px-10">{children}</main>
      </div>
    </div>
  );
}
