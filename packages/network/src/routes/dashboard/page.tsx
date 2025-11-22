import Link from 'next/link';
import { getMemberDashboard } from '../../server/membership';
import { formatCurrency, formatDateLabel, formatTimeRange } from '@utils/index';

export const metadata = {
  title: 'GrappleMap Network — Dashboard',
  description: 'Membership, payouts, and real-time open mat visibility.',
};

export default async function NetworkDashboardPage() {
  const dashboard = await getMemberDashboard();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-emerald-500/30 bg-brand-500/10 p-6 text-neutral-900 shadow-glow">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
              Member
            </p>
            <h2 className="text-2xl font-semibold">{dashboard.user.name}</h2>
            <p className="text-sm text-emerald-100">
              Tier: {dashboard.user.tier} · Status: {dashboard.user.status}
            </p>
          </div>
          <div className="text-sm text-emerald-100 sm:text-right">
            Active until {formatDateLabel(dashboard.user.activeUntil)}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link
            href="/network/checkin"
            className="inline-flex items-center rounded-full border border-white/30 px-4 py-1.5 font-semibold"
          >
            Launch check-in tool
          </Link>
          <Link
            href="/network"
            className="inline-flex items-center rounded-full border border-neutral-300 px-4 py-1.5 font-semibold text-neutral-900/80"
          >
            Visit landing page
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border-2 border-neutral-200 bg-white/70 p-5 shadow-glow">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
            Upcoming open mats
          </p>
          <ul className="mt-4 space-y-4">
            {dashboard.upcomingOpenMats.map((mat) => (
              <li key={mat.id} className="rounded-2xl border border-white/5 bg-neutral-50 p-4">
                <div className="flex items-center justify-between text-xs text-neutral-700">
                  <span>{formatDateLabel(mat.startsAt)}</span>
                  <span>{formatTimeRange(mat.startsAt, mat.endsAt)}</span>
                </div>
                <p className="mt-2 text-base font-semibold text-neutral-900">{mat.title}</p>
                <p className="text-sm text-neutral-800">{mat.gymName}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border-2 border-neutral-200 bg-white/70 p-5 shadow-glow">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
            Recent check-ins
          </p>
          <ul className="mt-4 space-y-4">
            {dashboard.recentCheckIns.map((entry) => (
              <li key={entry.id} className="rounded-2xl border border-white/5 bg-neutral-50 p-4">
                <div className="flex items-center justify-between text-xs text-neutral-700">
                  <span>{formatDateLabel(entry.occurredAt)}</span>
                  <span>{entry.status.toUpperCase()}</span>
                </div>
                <p className="mt-2 text-base font-semibold text-neutral-900">{entry.gymName}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-3xl border-2 border-neutral-200 bg-white/70 p-5 shadow-glow">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
          Gym payouts
        </p>
        <div className="mt-4 divide-y divide-white/5">
          {dashboard.payouts.map((payout) => (
            <div
              key={payout.id}
              className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-base font-semibold text-neutral-900">{payout.gymName}</p>
                <p className="text-sm text-neutral-800">
                  Scheduled {formatDateLabel(payout.scheduledFor)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-neutral-900">
                  {formatCurrency(payout.amountCents)}
                </p>
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-700">{payout.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
