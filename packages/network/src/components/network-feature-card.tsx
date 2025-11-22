import type { Highlight } from '../lib/highlights';

interface NetworkFeatureCardProps {
  feature: Highlight;
}

export function NetworkFeatureCard({ feature }: NetworkFeatureCardProps) {
  return (
    <div className="rounded-3xl border-2 border-neutral-200 bg-white p-6 shadow-card transition duration-200 hover:-translate-y-1 hover:border-brand-400 hover:shadow-elevated">
      {feature.badge ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-400 bg-brand-50 px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.4em] text-brand-800">
          <span className="h-2 w-2 rounded-full bg-accent-600 shadow-[0_0_8px_rgba(20,184,166,0.5)]" aria-hidden="true" />
          {feature.badge}
        </span>
      ) : null}
      <h3 className="mt-4 text-xl font-semibold text-neutral-900">{feature.title}</h3>
      <p className="mt-2 text-base font-medium text-neutral-800">{feature.description}</p>
    </div>
  );
}
