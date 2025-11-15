interface NetworkStatCardProps {
  label: string;
  value: string;
  helper?: string;
}

export function NetworkStatCard({ label, value, helper }: NetworkStatCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur transition-transform duration-200 hover:-translate-y-1 hover:border-white/20">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {helper ? <p className="mt-2 text-sm text-slate-300">{helper}</p> : null}
    </div>
  );
}
