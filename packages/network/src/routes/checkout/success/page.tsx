import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8 text-center">
      <div className="rounded-3xl border border-brand-300 bg-emerald-950/30 p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/20">
          <span className="text-3xl text-brand-500">✓</span>
        </div>

        <h1 className="mt-6 text-3xl font-semibold text-neutral-900">Welcome to the Network!</h1>

        <p className="mt-3 text-neutral-700">
          Your membership is now active. You have full access to partner gyms across London.
        </p>

        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">Next steps</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              <li className="flex items-start gap-2">
                <span className="text-brand-500">1.</span>
                <span>Check your email for a confirmation and welcome message</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500">2.</span>
                <span>Set up your member profile in the dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500">3.</span>
                <span>Get your QR code ready for check-ins at partner gyms</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/network/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-brand-400"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/discover"
            className="inline-flex items-center justify-center rounded-full bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200"
          >
            Browse Open Mats
          </Link>
        </div>
      </div>

      <p className="text-xs text-neutral-600">
        Questions? Contact us at{' '}
        <a href="mailto:support@grapplemap.uk" className="text-brand-500 hover:text-brand-600">
          support@grapplemap.uk
        </a>
      </p>
    </div>
  );
}
