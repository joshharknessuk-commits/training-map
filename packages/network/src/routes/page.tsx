import Link from 'next/link';
import { NetworkStatCard } from '../components/network-stat-card';
import { MembershipTierCard } from '../components/membership-tier-card';
import { membershipTiers } from '../lib/membership-tiers';
import { getNetworkOverview } from '../server/membership';

export const dynamic = 'force-dynamic';

const HOW_IT_WORKS = [
  {
    title: 'Members scan',
    description: 'Dynamic QR codes refresh hourly and confirm Network status instantly.',
  },
  {
    title: 'Gyms verify',
    description: 'Partner gyms see live rosters, capacity, and guest history.',
  },
  {
    title: 'Payouts run',
    description: 'Verified rolls convert to weekly payouts without spreadsheets.',
  },
];

const MEMBER_BENEFITS = [
  'Unlimited open mats. One pass.',
  'Priority guest list for hot sessions.',
  'Reminder texts so you never miss.',
];

export const GYM_BENEFITS = [
  'QR check-ins with instant verification.',
  'Stripe payouts—no spreadsheets.',
  'Shared ban lists and intelligence.',
];

const memberTiers = membershipTiers.filter((tier) => tier.id !== 'academy');
const academyTier = membershipTiers.find((tier) => tier.id === 'academy');

export default async function NetworkLandingPage() {
  const overview = await getNetworkOverview();

  return (
    <div className="space-y-24">
      <section className="space-y-4 fade-in-up bg-[#0c1116] px-6 py-10 rounded-3xl border border-white/5">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
          Network Metrics
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">London coverage at a glance</h2>
        <p className="text-sm text-neutral-800">Live data keeps members and gyms synced.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 fade-in-up">
        <NetworkStatCard
          label="Active members"
          value={overview.activeMembers.toString()}
          helper="Updated hourly"
          meta="Active this month"
          trend={{ value: '↑12% vs last week', direction: 'up' }}
          icon={<span className="text-brand-600">◎</span>}
          definition="Paying members who checked in at least once in the last 30 days."
        />
        <NetworkStatCard
          label="Partner gyms"
          value={overview.partnerGyms.toString()}
          helper="London-wide"
          meta="Verified partners"
          icon={<span className="text-brand-600">◇</span>}
          trend={{ value: '↑3 gyms', direction: 'up' }}
          definition="Gyms with signed payout agreements and verified QR scanners."
        />
        <NetworkStatCard
          label="Open mats this week"
          value={overview.openMatsThisWeek.toString()}
          helper="Updated daily"
          meta="Citywide sessions"
          icon={<span className="text-brand-600">○</span>}
          trend={{ value: '↑5 new mats', direction: 'up' }}
          definition="Sessions surfaced in the public map for the current week."
        />
        <NetworkStatCard
          label="Queued payouts"
          value={overview.payoutsInQueue.toString()}
          helper="Automatic per check-in"
          meta="Clears Fridays"
          icon={<span className="text-brand-600">£</span>}
          trend={{ value: '↓2 pending', direction: 'down' }}
          definition="Verified check-ins awaiting automated Stripe disbursement."
        />
      </section>

      <section className="fade-in-up rounded-3xl border-2 border-neutral-200 bg-[#0f0d12]/90 px-6 py-10 text-left shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-700">Network philosophy</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">We don&apos;t replace gyms. We connect them.</h2>
        <p className="mt-4 text-sm text-neutral-800">
          London&apos;s scene is huge, but fragmented. This network keeps identities intact while giving members freedom.
        </p>
        <ul className="mt-5 space-y-2 text-sm text-neutral-900">
          <li>✔ Members train freely without awkward drop-ins</li>
          <li>✔ Gyms receive automatic payouts and verified visitors</li>
          <li>✔ Communities stay strong while people explore</li>
        </ul>
        <p className="mt-6 text-sm text-brand-700">
          One membership. A citywide ecosystem. Communities connected through shared mats.
        </p>
      </section>

      <section className="fade-in-up rounded-3xl border-2 border-neutral-200 bg-[#0f151b] p-10 shadow-[0_20px_60px_rgba(15,23,42,0.55)] backdrop-blur transition duration-300 hover:bg-white/80">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
            How it works
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">End-to-end flow</h2>
          <p className="text-sm text-neutral-800">Scan → verify → payout. Nothing else to wire up.</p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {HOW_IT_WORKS.map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border-2 border-neutral-200 bg-neutral-50/60 p-4 transition duration-200 hover:-translate-y-1 hover:border-neutral-300"
            >
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-brand-700">
                {step.title}
              </p>
              <p className="mt-2 text-sm text-neutral-900">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="membership" className="space-y-6 fade-in-up rounded-3xl border border-white/5 bg-[#0c1116] px-6 py-10">
        <div className="flex flex-col gap-3 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
            Membership
          </p>
          <h2 className="text-2xl font-semibold text-neutral-900">Choose a Network tier</h2>
          <p className="text-sm text-neutral-800">Member tiers ship ready-to-train access and perks.</p>
          <div className="rounded-2xl border-2 border-neutral-200 bg-neutral-50/60 p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-brand-700">Member benefits</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-900">
              {MEMBER_BENEFITS.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-neutral-700">For gyms, see the Academy plan below.</p>
          </div>
        </div>
        <div className="grid gap-7 md:grid-cols-3">
          {memberTiers.map((tier, index) => (
            <MembershipTierCard key={tier.id} tier={tier} featured={index === 1} />
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-300 bg-neutral-50/60 p-5 text-sm text-neutral-900">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
              Pricing
            </p>
            <p className="mt-1 text-sm text-neutral-800">Transparent pricing. Upgrade or pause anytime.</p>
          </div>
          <Link
            href="/network#membership"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-900 transition hover:bg-brand-500/10"
          >
            See pricing →
          </Link>
        </div>
      </section>

      {academyTier ? (
        <section id="academy" className="fade-in-up grid gap-6 rounded-3xl border-2 border-neutral-200 bg-[#0f151b] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:grid-cols-2">
          <div className="space-y-3 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
              For gyms
            </p>
            <h2 className="text-2xl font-semibold text-neutral-900">Academy plan</h2>
            <p className="text-sm text-neutral-800">Built for gyms that need payouts, not spreadsheets.</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-900">
              {GYM_BENEFITS.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
            <Link
              href="/network#membership"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-900 transition hover:bg-brand-500/10"
            >
              Talk to sales →
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <MembershipTierCard tier={academyTier} featured />
          </div>
        </section>
      ) : null}

      <section className="fade-in-up rounded-3xl border-2 border-neutral-200 bg-[#0c1116]/90 p-8 shadow-[0_25px_70px_rgba(0,0,0,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">Auto payouts</p>
        <h2 className="mt-2 text-2xl font-semibold text-neutral-900">Member → QR → Verification → Payout</h2>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          {[
            { title: 'Member checks in', detail: 'Rotating QR proves membership.' },
            { title: 'QR verified', detail: 'Network validates tier + attendance.' },
            { title: 'Gym ledger updates', detail: 'Session logged for payout.' },
            { title: 'Payout runs', detail: 'Stripe automations release funds.' },
          ].map((node, index) => (
            <div key={node.title} className="flex items-center gap-3 text-left">
              <div className="rounded-2xl border border-neutral-300 bg-neutral-50/60 px-4 py-3">
                <p className="text-sm font-semibold text-neutral-900">{node.title}</p>
                <p className="text-xs text-neutral-700">{node.detail}</p>
              </div>
              {index < 3 ? <span className="text-brand-600 text-xl" aria-hidden="true">→</span> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="fade-in-up rounded-3xl border-2 border-neutral-200 bg-gradient-to-br from-[#0c141b] via-emerald-900/30 to-slate-950 p-10 shadow-[0_25px_80px_rgba(6,78,59,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">QR verification</p>
        <h2 className="mt-3 text-2xl font-semibold text-neutral-900">How rotating QR keeps the network honest</h2>
        <p className="mt-2 text-sm text-neutral-900">Rotating QR → verified entry → auto payout. Simple.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border-2 border-neutral-200 bg-neutral-50/70 p-3 text-left text-neutral-900">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.5em] text-brand-700">Step 1</p>
            <p className="mt-1 text-sm font-semibold">Member shows rotating QR</p>
            <p className="mt-1 text-xs text-neutral-800">
              Code refreshes hourly to prevent sharing or screenshots.
            </p>
          </div>
          <div className="rounded-xl border-2 border-neutral-200 bg-neutral-50/70 p-3 text-left text-neutral-900">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.5em] text-brand-700">Step 2</p>
            <p className="mt-1 text-sm font-semibold">Gym scans + verifies</p>
            <p className="mt-1 text-xs text-neutral-800">
              Staff tablet confirms membership tier and logs attendance instantly.
            </p>
          </div>
          <div className="rounded-xl border-2 border-neutral-200 bg-neutral-50/70 p-3 text-left text-neutral-900">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.5em] text-brand-700">Step 3</p>
            <p className="mt-1 text-sm font-semibold">Payout auto-triggers</p>
            <p className="mt-1 text-xs text-neutral-800">
              Each verified session adds to the gym&apos;s revenue share with audit history.
            </p>
          </div>
        </div>
      </section>

      <section className="fade-in-up rounded-3xl border-2 border-neutral-200 bg-white/70 p-8 shadow-[0_25px_70px_rgba(0,0,0,0.5)]">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-neutral-300 bg-neutral-50/70 p-5 text-left text-neutral-900 shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
            <p className="text-xs uppercase tracking-[0.45em] text-brand-700">Staff tablet</p>
            <div className="mt-3 rounded-xl border-2 border-neutral-200 bg-white/60 p-4">
              <div className="flex items-center justify-between text-sm">
                <span>Check-in</span>
                <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs text-brand-700">Verified ✓</span>
              </div>
              <p className="mt-2 text-2xl font-semibold">J. Carvalho</p>
              <p className="text-xs text-neutral-700">Network Pro · expires in 27 days</p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-900">
                <li>• Swipe down to mark guest list.</li>
                <li>• Tap payout history for this gym.</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 rounded-[2rem] border border-neutral-300 bg-neutral-50/70 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
            <p className="text-xs uppercase tracking-[0.45em] text-brand-700">Rotating QR</p>
            <div className="flex h-48 w-48 items-center justify-center rounded-3xl border border-emerald-300/40 bg-white/80 p-6">
              <div className="h-full w-full rounded-2xl bg-[radial-gradient(circle,#34d399_20%,transparent_21%)] bg-[length:16px_16px] opacity-80" style={{ animation: 'slowSpin 12s linear infinite' }} />
            </div>
            <p className="text-xs text-neutral-700">Regenerates every 60 minutes. Device-bound.</p>
          </div>
        </div>
      </section>

      <section className="fade-in-up rounded-3xl border-2 border-neutral-200 bg-[#0f151b] p-8 shadow-[0_20px_70px_rgba(0,0,0,0.5)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">Try it now</p>
        <h2 className="mt-2 text-2xl font-semibold text-neutral-900">Launch the check-in tool</h2>
        <ul className="mt-4 space-y-2 text-sm text-neutral-800">
          <li>• Visit /network/checkin on any device.</li>
          <li>• Share QR access with staff or embed it in the gym dashboard.</li>
          <li>• Monitor payouts inside /network/dashboard.</li>
        </ul>
        <Link
          href="/network/checkin"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-neutral-100 px-5 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200"
        >
          Open the check-in tool
        </Link>
      </section>

      <section className="fade-in-up rounded-3xl border-2 border-neutral-200 bg-[#0c1116]/90 p-8 shadow-[0_25px_70px_rgba(0,0,0,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
          Coming soon
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-neutral-900">Roadmap highlights</h2>
        <p className="mt-1 text-sm text-neutral-800">Quick hits from what’s shipping next.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {['Gym-facing analytics', 'Smart retention metrics', 'Automated guest passes', 'Stripe payouts beta'].map(
            (item) => (
              <div key={item} className="rounded-2xl border-2 border-neutral-200 bg-neutral-50/60 p-4 text-neutral-900">
                <p className="text-sm font-semibold">{item}</p>
                <p className="text-xs text-neutral-800">Shipping soon</p>
              </div>
            ),
          )}
        </div>
      </section>

      <footer className="rounded-3xl border-2 border-neutral-200 bg-white/60 p-6 text-center text-sm text-neutral-800">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
          GrappleMap Network
        </p>
        <p className="mt-2 text-base text-neutral-900">A single domain powering maps + access + payouts.</p>
        <p className="mt-1 text-xs text-neutral-700">Built on GrappleMap.uk. All rights reserved.</p>
      </footer>
    </div>
  );
}
