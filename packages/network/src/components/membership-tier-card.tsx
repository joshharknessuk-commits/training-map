import Link from 'next/link';
import { cn } from '@utils/index';
import type { TierDefinition } from '../lib/membership-tiers';

interface MembershipTierCardProps {
  tier: TierDefinition;
  featured?: boolean;
  variant?: 'member' | 'gym';
}

export function MembershipTierCard({ tier, featured = false, variant = 'member' }: MembershipTierCardProps) {
  const cardClasses = cn(
    'flex flex-col rounded-3xl border bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-emerald-950/30 p-7 shadow-[0_25px_60px_rgba(2,6,23,0.65)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-emerald-400/40',
    featured ? 'border-emerald-400/60' : 'border-white/10',
  );

  const isGymTier = tier.id === 'academy';
  const signupUrl = isGymTier
    ? '/network/signup/gym'
    : `/network/checkout?tier=${tier.id}`;

  const buttonLabel = isGymTier ? 'Contact Sales' : 'Sign Up';

  return (
    <div className={cardClasses}>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">Tier</p>
        <h3 className="text-3xl font-semibold text-white">{tier.name}</h3>
        <p className="text-base text-slate-300">{tier.description}</p>
      </div>
      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-4xl font-bold text-white">£{tier.price}</span>
        <span className="text-sm text-slate-400">per month</span>
      </div>
      <ul className="mt-6 space-y-2 text-sm text-slate-200">
        {tier.perks.map((perk) => (
          <li key={perk} className="flex items-center gap-2">
            <span aria-hidden="true">✔</span>
            <span>{perk}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Link
          href={signupUrl}
          className={cn(
            'inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition',
            featured
              ? 'bg-emerald-500 text-white hover:bg-emerald-400'
              : 'bg-white/10 text-white hover:bg-white/20',
          )}
        >
          {buttonLabel}
        </Link>
      </div>
    </div>
  );
}
