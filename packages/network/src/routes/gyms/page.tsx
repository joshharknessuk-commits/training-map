import { MembershipTierCard } from '../../components/membership-tier-card';
import { membershipTiers } from '../../lib/membership-tiers';
import { GYM_BENEFITS } from '../page';

const academyTier = membershipTiers.find((tier) => tier.id === 'academy');

export const metadata = {
  title: 'Join as Gym – GrappleMap Network',
};

const GYM_USE_CASES = [
  'Keep your membership billing. Network only handles drop-ins.',
  'Send staff a live roster so they know exactly who walked in.',
  'Run special open mats and let the network handle payouts.',
];

const ONBOARDING_STEPS = [
  'Verify your academy and upload payout details.',
  'Add staff tablets/phones to scan the rotating QR.',
  'Go live—visitors scan, we log, and Stripe handles the rest.',
];

export default function GymsPage() {
  return (
    <div className="space-y-10 rounded-3xl border-2 border-neutral-200 bg-[#05070b] p-10 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
      <section className="space-y-3 text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.5em] text-brand-700">For gyms</p>
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">More visitors. No admin.</h1>
        <p className="text-sm text-neutral-800">
          Payouts that run themselves, verified check-ins, and shared intelligence to keep your mats safe.
        </p>
        <p className="text-xs text-neutral-600">Built to strengthen grappling communities—not replace them.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Operational wins</h2>
        <ul className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
          {GYM_BENEFITS.map((benefit) => (
            <li key={benefit} className="rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3">
              {benefit}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Automatic payouts</h2>
        <p className="text-sm text-neutral-800">
          Every verified check-in lands in your ledger. Stripe Connect settles weekly—no spreadsheets or chasing
          payments.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Verified check-ins</h2>
        <p className="text-sm text-neutral-800">
          Staff scans the member QR. We validate membership tier, log attendance, and prevent screenshot abuse.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Shared intelligence</h2>
        <p className="text-sm text-neutral-800">
          Access network-wide ban lists and visitor history so your community stays safe while welcoming travelers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Visitor → member conversion</h2>
        <p className="text-sm text-neutral-800">
          QR visitors can opt into your newsletter or intro offer after each session. We notify you when someone returns
          frequently so you can invite them to join permanently.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Use cases</h2>
        <ul className="space-y-1 text-sm text-neutral-800">
          {GYM_USE_CASES.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </section>

      {academyTier ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Pricing</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border-2 border-neutral-200 bg-neutral-50 px-5 py-4 text-sm text-neutral-800">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-700">Academy plan</p>
              <p className="mt-2">
                Covers all automated payouts, analytics, shared intelligence, and onboarding for your staff tablets.
              </p>
              <p className="mt-3 text-brand-700">Stay independent, but connect to the network of drop-ins.</p>
            </div>
            <MembershipTierCard tier={academyTier} featured />
          </div>
        </section>
      ) : null}

      <section className="space-y-3 rounded-3xl border-2 border-neutral-200 bg-neutral-50 px-6 py-5 text-slate-900">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">How the tablet works</h2>
        <p className="text-sm">
          Staff opens the scanner, points at the member QR, and sees “Verified ✓” plus tier info. No extra CRM, no
          training. Each scan updates your payout ledger.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Onboarding steps</h2>
        <ul className="space-y-2 text-sm text-slate-200">
          {ONBOARDING_STEPS.map((step, index) => (
            <li key={step} className="rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3">
              <span className="font-semibold text-neutral-900">Step {index + 1}.</span> {step}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-3xl border-2 border-neutral-200 bg-neutral-50 px-6 py-5 text-slate-900">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Safety + community first</h2>
        <p className="text-sm">
          Your culture stays the same. We simply ensure the visitors are verified, payouts run, and your community remains
          in control.
        </p>
      </section>

      <p className="text-sm text-neutral-700">
        Ready to connect your academy? Email{' '}
        <a href="mailto:support@grapplemap.uk" className="underline">
          support@grapplemap.uk
        </a>{' '}
        or tap “Talk to sales”. We onboard most gyms in under a week.
      </p>
    </div>
  );
}
