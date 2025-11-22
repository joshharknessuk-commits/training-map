import { DashboardCard } from '@/components/DashboardCard';

export default function WeightClassesPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-slate-100">Weight Class Analytics</h1>
          <p className="text-lg text-slate-400">
            Submissions and match duration distribution by weight class
          </p>
        </div>

        <DashboardCard title="Weight Class Data" description="Analysis by division">
          <div className="flex h-64 items-center justify-center">
            <p className="text-lg text-slate-400">
              Add more match data to enable weight class analysis
            </p>
          </div>
        </DashboardCard>
      </div>
    </main>
  );
}
