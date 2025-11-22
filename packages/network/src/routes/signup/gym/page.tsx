'use client';

import { useState } from 'react';
import Link from 'next/link';
import { membershipTiers } from '../../../lib/membership-tiers';

const academyTier = membershipTiers.find((t) => t.id === 'academy');

export default function GymSignupPage() {
  const [formData, setFormData] = useState({
    gymName: '',
    contactName: '',
    email: '',
    phone: '',
    location: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gym/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg space-y-8 text-center">
        <div className="rounded-3xl border border-brand-300 bg-emerald-950/30 p-8">
          <p className="text-4xl">✓</p>
          <h1 className="mt-4 text-2xl font-semibold text-neutral-900">Inquiry Received</h1>
          <p className="mt-2 text-neutral-700">
            Thanks for your interest in the Academy Plan! Our team will be in touch within 1-2 business days.
          </p>
          <Link
            href="/network"
            className="mt-6 inline-flex items-center rounded-full bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200"
          >
            Back to Network
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">For Gyms</p>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-900">Join as a Partner Gym</h1>
        <p className="mt-2 text-neutral-700">
          Get automated payouts, QR verification, and access to the Network member base.
        </p>
      </div>

      {academyTier && (
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50/60 p-6">
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-semibold text-neutral-900">{academyTier.name}</span>
            <div className="text-right">
              <span className="text-3xl font-bold text-neutral-900">£{academyTier.price}</span>
              <span className="text-sm text-neutral-600">/month</span>
            </div>
          </div>
          <ul className="mt-4 grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
            {academyTier.perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2">
                <span className="text-brand-500">✔</span>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="gymName" className="block text-sm font-medium text-slate-200">
              Gym Name *
            </label>
            <input
              type="text"
              id="gymName"
              name="gymName"
              value={formData.gymName}
              onChange={handleChange}
              required
              placeholder="Your Gym Name"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white/60 px-4 py-3 text-neutral-900 placeholder:text-neutral-500 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
            />
          </div>
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-slate-200">
              Contact Name *
            </label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              required
              placeholder="Your Name"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white/60 px-4 py-3 text-neutral-900 placeholder:text-neutral-500 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-200">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="gym@example.com"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white/60 px-4 py-3 text-neutral-900 placeholder:text-neutral-500 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-200">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+44 7XXX XXXXXX"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white/60 px-4 py-3 text-neutral-900 placeholder:text-neutral-500 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate-200">
            Location / Area *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="e.g., East London, Shoreditch"
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white/60 px-4 py-3 text-neutral-900 placeholder:text-neutral-500 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-slate-200">
            Tell us about your gym
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            placeholder="How many members do you have? What open mats do you run? Any questions?"
            className="mt-2 w-full resize-none rounded-xl border border-neutral-200 bg-white/60 px-4 py-3 text-neutral-900 placeholder:text-neutral-500 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
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
          className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Inquiry'}
        </button>

        <p className="text-center text-xs text-neutral-600">
          We&apos;ll get back to you within 1-2 business days.
        </p>
      </form>

      <div className="text-center">
        <Link href="/network#academy" className="text-sm text-brand-500 hover:text-brand-600">
          ← Back to Network
        </Link>
      </div>
    </div>
  );
}
