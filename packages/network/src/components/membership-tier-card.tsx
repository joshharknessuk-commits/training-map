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
    'flex flex-col rounded-3xl border bg-gradient-to-b from-white via-neutral-50 to-brand-50/40 p-7 shadow-card backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-brand-400 hover:shadow-elevated',
    featured ? 'border-brand-400 ring-2 ring-brand-200' : 'border-neutral-200',
  );

  const isGymTier = tier.id === 'academy';
  const isFreeTier = tier.isFree || tier.price === 0;

  const signupUrl = isGymTier
    ? '/network/signup/gym'
    : isFreeTier
    ? '/auth/signup'
    : `/network/checkout?tier=${tier.id}`;

  const buttonLabel = isGymTier ? 'Contact Sales' : isFreeTier ? 'Sign Up Free' : 'Sign Up';

  return (
    <div className={cardClasses}>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-600">Tier</p>
        <h3 className="text-3xl font-semibold text-neutral-900">{tier.name}</h3>
        <p className="text-base text-neutral-700">{tier.description}</p>
      </div>
      <div className="mt-6 flex items-baseline gap-2">
        {isFreeTier ? (
          <span className="text-4xl font-bold text-accent-600">Free</span>
        ) : (
          <>
            <span className="text-4xl font-bold text-neutral-900">£{tier.price}</span>
            <span className="text-sm text-neutral-600">per month</span>
          </>
        )}
      </div>
      <ul className="mt-6 space-y-2 text-sm text-neutral-800">
        {tier.perks.map((perk) => (
          <li key={perk} className="flex items-center gap-2">
            <span aria-hidden="true" className="text-accent-500">✔</span>
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
              ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white shadow-glow hover:from-brand-600 hover:to-accent-600'
              : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
          )}
        >
          {buttonLabel}
        </Link>
      </div>
    </div>
  );
}
