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
      ? 'text-accent-600'
      : trend?.direction === 'down'
        ? 'text-error-DEFAULT'
        : 'text-neutral-500';

  return (
    <div className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-50 via-white to-brand-50/30 p-7 shadow-card backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-brand-300 hover:bg-gradient-to-tl hover:shadow-elevated">
      <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.45em] text-brand-600">
        <span className="flex items-center gap-2">
          {icon ? <span aria-hidden="true" className="text-base text-brand-500">{icon}</span> : null}
          {label}
        </span>
        <span className="text-[0.5rem] tracking-[0.6em] text-neutral-400">{meta ?? 'Live'}</span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-5xl font-light tracking-tight text-neutral-900">{value}</p>
      </div>
      {helper ? <p className="mt-2 text-sm text-neutral-700">{helper}</p> : null}
      {definition ? <p className="mt-2 text-xs text-neutral-600">{definition}</p> : null}
      {trend ? (
        <p className={`mt-3 text-xs font-semibold tracking-[0.2em] ${trendColor}`}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
        </p>
      ) : null}
    </div>
  );
}
