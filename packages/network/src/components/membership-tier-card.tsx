import { cn } from '@utils/index';
import type { TierDefinition } from '../lib/membership-tiers';
import { ContactButton } from '@ui/contact-button';

interface MembershipTierCardProps {
  tier: TierDefinition;
  featured?: boolean;
}

export function MembershipTierCard({ tier, featured = false }: MembershipTierCardProps) {
  const cardClasses = cn(
    'flex flex-col rounded-3xl border bg-slate-950/70 p-6 shadow-glow backdrop-blur transition-transform duration-200 hover:-translate-y-1',
    featured ? 'border-emerald-400/60' : 'border-white/10',
  );

  return (
    <div className={cardClasses}>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">Tier</p>
        <h3 className="text-2xl font-semibold text-white">{tier.name}</h3>
        <p className="text-sm text-slate-300">{tier.description}</p>
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
        <ContactButton className="w-full" buttonClassName="w-full justify-center" />
      </div>
    </div>
  );
}
