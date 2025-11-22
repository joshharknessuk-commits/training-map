import { DashboardCard } from '@/components/DashboardCard';

export default function CountriesPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-slate-100">National Trends</h1>
          <p className="text-lg text-slate-400">
            Country-level performance and regional meta differences
          </p>
        </div>

        <DashboardCard title="Geographic Performance" description="Medal counts and technique preferences by country">
          <div className="flex h-64 items-center justify-center">
            <p className="text-lg text-slate-400">
              Geographic visualization requires athlete nationality data
            </p>
          </div>
        </DashboardCard>
      </div>
    </main>
  );
}
