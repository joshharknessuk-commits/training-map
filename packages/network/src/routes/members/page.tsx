import { MembershipTierCard } from '../../components/membership-tier-card';
import { membershipTiers } from '../../lib/membership-tiers';

const memberTiers = membershipTiers.filter((tier) => tier.id !== 'academy');

export const metadata = {
  title: 'Join as Member – GrappleMap Network',
};

const MEMBER_USE_CASES = [
  'Try different gyms without “are you a member?” conversations.',
  'Drop into open mats when work or travel shifts your schedule.',
  'Train with friends around London while still repping your home academy.',
];

const MEMBER_FAQ = [
  {
    question: 'Is every session truly unlimited?',
    answer: 'Yes. Once you’re active you can attend any partner open mat as often as you like.',
  },
  {
    question: 'Can someone screenshot my QR?',
    answer: 'No. Codes rotate hourly and are device-bound. Staff sees if a code is stale.',
  },
  {
    question: 'How do drop-ins work now?',
    answer: 'You flash the QR, they greet you, and we send the gym your payout. No cash, no awkwardness.',
  },
];

export default function MembersPage() {
  return (
    <div className="space-y-10 rounded-3xl border-2 border-neutral-200 bg-[#05070b] p-10 shadow-[0_25px_70px_rgba(0,0,0,0.5)]">
      <div className="space-y-3 text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.5em] text-brand-700">Members</p>
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">One pass. Train everywhere.</h1>
        <p className="text-sm text-neutral-800">
          London’s open mats become one big schedule. Scan your rotating QR and you’re on the mat.
        </p>
        <p className="text-xs text-neutral-700">Built to strengthen grappling communities—not centralise them.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Why members love it</h2>
        <ul className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
          {['No awkward drop-ins or cash chats', 'Priority guest list for high-demand nights', 'One pass covers every partner gym', 'SMS reminders so you never miss mats'].map(
            (benefit) => (
              <li key={benefit} className="rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3">
                {benefit}
              </li>
            ),
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Use cases</h2>
        <ul className="space-y-1 text-sm text-neutral-800">
          {MEMBER_USE_CASES.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Pricing tiers</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {memberTiers.map((tier, index) => (
            <MembershipTierCard key={tier.id} tier={tier} featured={index === 1} />
          ))}
        </div>
        <p className="text-sm text-brand-700">
          £29/month is less than two drop-ins. Freeze anytime. Your home gym stays your home gym—you just get access.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">How the QR works</h2>
        <div className="grid gap-3 sm:grid-cols-3 text-sm text-slate-200">
          {[
            { title: 'Show QR', detail: 'Code rotates hourly and lives on your device.' },
            { title: 'Staff scans', detail: 'Network verifies you’re active + logs attendance.' },
            { title: 'Gym paid', detail: 'Verified check-ins drop into their payout ledger.' },
          ].map((step) => (
            <div key={step.title} className="rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-brand-700">{step.title}</p>
              <p className="mt-2">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-3xl border-2 border-neutral-200 bg-neutral-50 px-6 py-5 text-slate-900">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Your city is one big gym now</h2>
        <p className="text-sm">
          Bounce between academies, meet training partners across boroughs, and bring that experience back to your own
          community. The QR removes friction; the mats stay local.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">FAQ</h2>
        <div className="space-y-2 text-sm text-slate-200">
          {MEMBER_FAQ.map((item) => (
            <details key={item.question} className="rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3">
              <summary className="cursor-pointer text-neutral-900">{item.question}</summary>
              <p className="mt-2 text-neutral-800">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
