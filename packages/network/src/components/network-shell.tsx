import type { ReactNode } from 'react';
import Link from 'next/link';
import { ContactButton } from '@ui/contact-button';

interface NetworkShellProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export function NetworkShell({
  title = 'GrappleMap Network',
  subtitle = 'One pass. Every open mat. Automated payouts for gyms.',
  children,
}: NetworkShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-900/40 via-slate-950 to-slate-950" />
      <div className="relative">
        <header className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 pb-10 pt-12 text-center sm:px-10">
          <div className="flex flex-wrap items-center justify-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-white/70">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 transition hover:-translate-y-0.5 hover:border-white/40 hover:text-white"
            >
              ← Public Map
            </Link>
            <Link
              href="/network"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-white/90 transition hover:-translate-y-0.5 hover:border-emerald-300/70 hover:bg-emerald-400/20"
            >
              Network HQ
            </Link>
            <Link
              href="/network/checkin"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 transition hover:-translate-y-0.5 hover:border-white/40 hover:text-white"
            >
              Check-in Tool →
            </Link>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Network</p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
          <p className="text-sm text-slate-300 sm:text-base">{subtitle}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <ContactButton />
            <Link
              href="/network/dashboard"
              className="inline-flex min-w-[220px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Launch dashboard
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-6 pb-24 sm:px-10">{children}</main>
      </div>
    </div>
  );
}
