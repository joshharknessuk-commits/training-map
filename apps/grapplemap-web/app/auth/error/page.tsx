'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'OAuthSignin':
        return 'Error in constructing an authorization URL.';
      case 'OAuthCallback':
        return 'Error in handling the response from an OAuth provider.';
      case 'OAuthCreateAccount':
        return 'Could not create OAuth provider user in the database.';
      case 'EmailCreateAccount':
        return 'Could not create email provider user in the database.';
      case 'Callback':
        return 'Error in the OAuth callback handler route.';
      case 'OAuthAccountNotLinked':
        return 'Email on the account is already linked, but not with this OAuth account.';
      case 'EmailSignin':
        return 'Sending the email with the verification token failed.';
      case 'CredentialsSignin':
        return 'The credentials you provided are incorrect.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      default:
        return 'An error occurred during authentication.';
    }
  };

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
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-rose-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-2">
              Authentication Error
            </h2>

            <p className="text-slate-400 mb-6">
              {getErrorMessage(error)}
            </p>

            {error && (
              <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-3 mb-6">
                <p className="text-xs text-slate-500 font-mono">
                  Error code: {error}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="block w-full rounded-lg bg-gradient-to-r from-emerald-500 via-emerald-600 to-sky-500 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-emerald-900/40 transition hover:scale-[1.01] hover:shadow-emerald-900/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Try Again
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
