import type { Highlight } from '../lib/highlights';

interface NetworkFeatureCardProps {
  feature: Highlight;
}

export function NetworkFeatureCard({ feature }: NetworkFeatureCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/70 via-slate-950/50 to-emerald-900/20 p-6 shadow-[0_25px_60px_rgba(2,6,23,0.65)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-emerald-200/30 hover:bg-gradient-to-tl">
      {feature.badge ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.4em] text-emerald-100">
          <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.7)]" aria-hidden="true" />
          {feature.badge}
        </span>
      ) : null}
      <h3 className="mt-4 text-xl font-semibold text-white">{feature.title}</h3>
      <p className="mt-2 text-base text-slate-300">{feature.description}</p>
    </div>
  );
}
