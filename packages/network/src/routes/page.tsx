import Link from 'next/link';
import { NetworkStatCard } from '../components/network-stat-card';
import { NetworkFeatureCard } from '../components/network-feature-card';
import { MembershipTierCard } from '../components/membership-tier-card';
import { highlights } from '../lib/highlights';
import { membershipTiers } from '../lib/membership-tiers';
import { getNetworkOverview } from '../server/membership';

export const dynamic = 'force-dynamic';

export default async function NetworkLandingPage() {
  const overview = await getNetworkOverview();

  return (
    <div className="space-y-12">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NetworkStatCard label="Active members" value={overview.activeMembers.toString()} />
        <NetworkStatCard label="Partner gyms" value={overview.partnerGyms.toString()} />
        <NetworkStatCard
          label="Open mats this week"
          value={overview.openMatsThisWeek.toString()}
        />
        <NetworkStatCard
          label="Queued payouts"
          value={overview.payoutsInQueue.toString()}
          helper="Automatic per check-in"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {highlights.map((feature) => (
          <NetworkFeatureCard key={feature.title} feature={feature} />
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Membership
          </p>
          <h2 className="text-2xl font-semibold text-white">Choose a Network tier</h2>
          <p className="text-sm text-slate-300">
            Plans cover consumer membership and gym payouts. Upgrade at any time, no new domain
            needed.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {membershipTiers.map((tier, index) => (
            <MembershipTierCard key={tier.id} tier={tier} featured={index === 1} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-emerald-900/40 to-slate-950 p-8 shadow-glow">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
              Operations
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">Unified check-in tooling</h3>
            <p className="mt-2 text-sm text-slate-200">
              QR sessions rotate hourly. Every verified entry increases the hosting gym&apos;s pool.
              Partner admins can always fall back to manual verification without leaving the site.
            </p>
            <div className="mt-4 inline-flex rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100">
              One domain, both products
            </div>
          </div>
          <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-5">
            <p className="text-sm font-semibold text-white">Try it now</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Visit /network/checkin on any device.</li>
              <li>• Share QR access with staff or embed it in the gym dashboard.</li>
              <li>• Monitor payouts inside /network/dashboard.</li>
            </ul>
            <Link
              href="/network/checkin"
              className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Open the check-in tool
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
