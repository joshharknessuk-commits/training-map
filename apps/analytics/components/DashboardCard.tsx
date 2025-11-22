import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function DashboardCard({ title, description, children, className = '' }: DashboardCardProps) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/50 p-6 ${className}`}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}
