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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-900/30 via-slate-950 to-[#02140f]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40" />
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22none%22 stroke=%22rgba(255,255,255,0.04)%22 stroke-width=%221%22/%3E%3C/svg%3E')",
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(34,197,94,0.15), transparent 55%)', animation: 'pulse 6s ease-in-out infinite' }} />
      <div className="relative">
        <header className="sticky top-0 z-[1010] border-b border-white/10 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-3 px-6 py-4 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-white/70 sm:px-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 transition hover:-translate-y-0.5 hover:border-white/40 hover:text-white"
            >
              <span aria-hidden="true">🗺</span>
              Public Map
            </Link>
            <Link
              href="/network"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/60 bg-emerald-400/15 px-3 py-1 text-white transition hover:-translate-y-0.5 hover:border-emerald-300/70 hover:bg-emerald-400/20"
            >
              <span aria-hidden="true">⚡</span>
              Network HQ
            </Link>
            <Link
              href="/network/checkin"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 transition hover:-translate-y-0.5 hover:border-white/40 hover:text-white"
            >
              <span aria-hidden="true">📱</span>
              Check-in Tool
            </Link>
          </div>
        </header>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-16 pt-24 text-center sm:px-10">
          <h1 className="text-6xl font-semibold tracking-tight text-white sm:text-7xl">{title}</h1>
          <p className="text-xl font-light text-slate-300">{subtitle}</p>
          <p className="text-sm font-light text-slate-400">
            Built to strengthen grappling communities, not centralise them.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
            <p className="text-sm text-emerald-100/90">
              <span className="font-semibold text-white">For members:</span> Train anywhere without drop-in hassles.
            </p>
            <p className="text-sm text-emerald-100/90">
              <span className="font-semibold text-white">For gyms:</span> Automated payouts, verified attendance.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/network/members"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-sky-500 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-[0_20px_50px_rgba(15,118,110,0.7)_] transition duration-200 hover:scale-[1.03]"
            >
              Join as member
            </Link>
            <Link
              href="/network/gyms"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/80 transition duration-200 hover:bg-white/10 hover:text-white"
            >
              Join as gym
            </Link>
            <ContactButton
              className="!flex-row !items-center !gap-2"
              buttonClassName="justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:border-white/30"
            />
          </div>
        </div>
        <main className="mx-auto w-full max-w-6xl px-6 pb-24 sm:px-10">{children}</main>
      </div>
    </div>
  );
}
