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
      className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center px-4"
      style={{
        backgroundImage:
          'radial-gradient(circle at top, rgba(16,185,129,0.08), transparent 55%), linear-gradient(to bottom, #020b08, #030712 60%, #010409)',
        backgroundColor: '#010307',
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-semibold uppercase tracking-[0.2em] text-emerald-200">
              GrappleMap
            </h1>
            <p className="text-sm text-slate-400 tracking-wider mt-1">Network</p>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/85 p-8 backdrop-blur shadow-2xl shadow-black/50">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-emerald-400"
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

            <h2 className="text-2xl font-semibold text-white mb-2">
              Signed Out
            </h2>

            <p className="text-slate-400 mb-6">
              You have been successfully signed out.
            </p>

            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="block w-full rounded-lg bg-gradient-to-r from-emerald-500 via-emerald-600 to-sky-500 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-emerald-900/40 transition hover:scale-[1.01] hover:shadow-emerald-900/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Sign In Again
              </Link>

              <Link
                href="/"
                className="block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-slate-300 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400/60 focus:ring-offset-2 focus:ring-offset-slate-950"
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
