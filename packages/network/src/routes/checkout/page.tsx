'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { membershipTiers, type MembershipTier } from '../../lib/membership-tiers';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const tierParam = searchParams.get('tier') as MembershipTier | null;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tier = membershipTiers.find((t) => t.id === tierParam);

  if (!tier || tier.id === 'academy') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-semibold text-white">Invalid tier selected</h1>
        <p className="mt-2 text-slate-300">Please select a valid membership tier.</p>
        <Link
          href="/network#membership"
          className="mt-6 inline-flex items-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
        >
          View membership options
        </Link>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tier.id, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Checkout</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Join {tier.name}</h1>
        <p className="mt-2 text-slate-300">{tier.description}</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-semibold text-white">{tier.name}</span>
          <div className="text-right">
            <span className="text-3xl font-bold text-white">£{tier.price}</span>
            <span className="text-sm text-slate-400">/month</span>
          </div>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-200">
          {tier.perks.map((perk) => (
            <li key={perk} className="flex items-center gap-2">
              <span className="text-emerald-400">✔</span>
              <span>{perk}</span>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleCheckout} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-200">
            Email address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Continue to payment - £${tier.price}/mo`}
        </button>

        <p className="text-center text-xs text-slate-400">
          Secure payment powered by Stripe. Cancel anytime.
        </p>
      </form>

      <div className="text-center">
        <Link href="/network#membership" className="text-sm text-emerald-300 hover:text-emerald-200">
          ← Back to membership options
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-slate-300">Loading...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
