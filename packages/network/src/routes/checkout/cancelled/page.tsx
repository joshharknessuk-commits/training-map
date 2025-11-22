import Link from 'next/link';

export default function CheckoutCancelledPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8 text-center">
      <div className="rounded-3xl border-2 border-neutral-200 bg-neutral-50/60 p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <span className="text-3xl text-neutral-700">×</span>
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-neutral-900">Checkout Cancelled</h1>

        <p className="mt-3 text-neutral-800">
          No worries - your payment was not processed. You can try again whenever you&apos;re ready.
        </p>

        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border-2 border-neutral-200 bg-white/60 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">Need help?</p>
            <p className="mt-2 text-sm text-neutral-800">
              If you ran into issues during checkout or have questions about our membership options,
              we&apos;re here to help.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/network#membership"
            className="inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-brand-400"
          >
            View Membership Options
          </Link>
          <Link
            href="/network"
            className="inline-flex items-center justify-center rounded-full bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200"
          >
            Back to Network
          </Link>
        </div>
      </div>

      <p className="text-xs text-neutral-700">
        Questions? Contact us at{' '}
        <a href="mailto:support@grapplemap.uk" className="text-brand-600 hover:text-brand-700">
          support@grapplemap.uk
        </a>
      </p>
    </div>
  );
}
