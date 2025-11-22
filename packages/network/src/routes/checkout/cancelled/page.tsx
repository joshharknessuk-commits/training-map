import Link from 'next/link';

export default function CheckoutCancelledPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8 text-center">
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
          <span className="text-3xl text-slate-400">×</span>
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-white">Checkout Cancelled</h1>

        <p className="mt-3 text-slate-300">
          No worries - your payment was not processed. You can try again whenever you&apos;re ready.
        </p>

        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Need help?</p>
            <p className="mt-2 text-sm text-slate-300">
              If you ran into issues during checkout or have questions about our membership options,
              we&apos;re here to help.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/network#membership"
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
          >
            View Membership Options
          </Link>
          <Link
            href="/network"
            className="inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Back to Network
          </Link>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Questions? Contact us at{' '}
        <a href="mailto:support@grapplemap.uk" className="text-emerald-300 hover:text-emerald-200">
          support@grapplemap.uk
        </a>
      </p>
    </div>
  );
}
