'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function SignOutPage() {
  useEffect(() => {
    signOut({ redirect: false });
  }, []);

  return (
    <div
      className="min-h-screen w-full bg-white text-neutral-900 flex items-center justify-center px-4"
      style={{
        backgroundImage:
          'radial-gradient(circle at top, rgba(16,185,129,0.08), transparent 55%), linear-gradient(to bottom, #020b08, #030712 60%, #010409)',
        backgroundColor: '#010307',
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-semibold uppercase tracking-[0.2em] text-brand-700">
              GrappleMap
            </h1>
            <p className="text-sm text-neutral-700 tracking-wider mt-1">Network</p>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800/70 bg-neutral-50/85 p-8 backdrop-blur shadow-2xl shadow-black/50">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-brand-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-brand-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              Signed Out
            </h2>

            <p className="text-neutral-700 mb-6">
              You have been successfully signed out.
            </p>

            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="block w-full rounded-lg bg-gradient-to-r from-emerald-500 via-emerald-600 to-sky-500 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-neutral-900 shadow-lg shadow-emerald-900/40 transition hover:scale-[1.01] hover:shadow-emerald-900/60 focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Sign In Again
              </Link>

              <Link
                href="/"
                className="block w-full rounded-lg border border-slate-700 bg-neutral-100/50 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-neutral-800 transition hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-slate-400/60 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
