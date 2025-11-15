interface NetworkStatCardProps {
  label: string;
  value: string;
  helper?: string;
  meta?: string;
  definition?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  icon?: React.ReactNode;
}

export function NetworkStatCard({
  label,
  value,
  helper,
  meta,
  trend,
  icon,
  definition,
}: NetworkStatCardProps) {
  const trendColor =
    trend?.direction === 'up'
      ? 'text-emerald-300'
      : trend?.direction === 'down'
        ? 'text-rose-300'
        : 'text-slate-400';

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/10 p-7 shadow-[0_25px_60px_rgba(2,6,23,0.65)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-white/30 hover:bg-gradient-to-tl">
      <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.45em] text-emerald-200">
        <span className="flex items-center gap-2">
          {icon ? <span aria-hidden="true" className="text-base text-emerald-300">{icon}</span> : null}
          {label}
        </span>
        <span className="text-[0.5rem] tracking-[0.6em] text-white/40">{meta ?? 'Live'}</span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-5xl font-light tracking-tight text-white">{value}</p>
      </div>
      {helper ? <p className="mt-2 text-sm text-slate-300">{helper}</p> : null}
      {definition ? <p className="mt-2 text-xs text-slate-400">{definition}</p> : null}
      {trend ? (
        <p className={`mt-3 text-xs font-semibold tracking-[0.2em] ${trendColor}`}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
        </p>
      ) : null}
    </div>
  );
}
