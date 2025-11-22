import { DashboardCard } from '@/components/DashboardCard';

export default function MatchFlowPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-slate-100">Match Flow Visualizer</h1>
          <p className="text-lg text-slate-400">Timeline of scoring sequences and technique chains</p>
        </div>

        <DashboardCard title="Coming Soon" description="Match timeline visualization and Sankey diagrams">
          <div className="flex h-64 items-center justify-center">
            <p className="text-lg text-slate-400">
              This feature requires detailed match event data.
              <br />
              Add match events to enable flow visualization.
            </p>
          </div>
        </DashboardCard>
      </div>
    </main>
  );
}
