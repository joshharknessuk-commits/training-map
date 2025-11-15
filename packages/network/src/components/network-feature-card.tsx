import type { Highlight } from '../lib/highlights';

interface NetworkFeatureCardProps {
  feature: Highlight;
}

export function NetworkFeatureCard({ feature }: NetworkFeatureCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-glow backdrop-blur transition-transform duration-200 hover:-translate-y-1 hover:border-white/20">
      {feature.badge ? (
        <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
          {feature.badge}
        </span>
      ) : null}
      <h3 className="mt-3 text-lg font-semibold text-white">{feature.title}</h3>
      <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
    </div>
  );
}
