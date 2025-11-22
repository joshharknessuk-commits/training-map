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
        : 'text-neutral-600';

  return (
    <div className="rounded-3xl border-2 border-neutral-200 bg-white p-7 shadow-card transition duration-200 hover:-translate-y-1 hover:border-brand-400 hover:shadow-elevated">
      <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.45em] text-brand-700">
        <span className="flex items-center gap-2">
          {icon ? <span aria-hidden="true" className="text-base text-brand-700">{icon}</span> : null}
          {label}
        </span>
        <span className="text-[0.5rem] tracking-[0.6em] text-neutral-600">{meta ?? 'Live'}</span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-5xl font-light tracking-tight text-neutral-900">{value}</p>
      </div>
      {helper ? <p className="mt-2 text-sm font-medium text-neutral-800">{helper}</p> : null}
      {definition ? <p className="mt-2 text-xs text-neutral-800">{definition}</p> : null}
      {trend ? (
        <p className={`mt-3 text-xs font-semibold tracking-[0.2em] ${trendColor}`}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
        </p>
      ) : null}
    </div>
  );
}
