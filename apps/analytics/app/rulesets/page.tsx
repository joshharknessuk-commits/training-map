import { DashboardCard } from '@/components/DashboardCard';

export default function RulesetsPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-slate-100">Ruleset Impact Analysis</h1>
          <p className="text-lg text-slate-400">
            How different rulesets affect finishing rates and fighting styles
          </p>
        </div>

        <DashboardCard title="Ruleset Comparison" description="ADCC vs IBJJF vs EBI finishing rates">
          <div className="flex h-64 items-center justify-center">
            <p className="text-lg text-slate-400">
              Add multi-organization data to compare rulesets
            </p>
          </div>
        </DashboardCard>
      </div>
    </main>
  );
}
