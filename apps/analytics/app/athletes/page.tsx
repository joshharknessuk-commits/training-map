'use client';

import { useEffect, useState } from 'react';
import { DashboardCard } from '@/components/DashboardCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AthleteStats {
  athleteId: string;
  athleteName: string;
  nationality: string | null;
  totalMatches: number;
  wins: number;
  submissions: number;
  avgMatchDuration: number;
  winRate: number;
  submissionRate: number;
}

export default function AthletesPage() {
  const [athletes, setAthletes] = useState<AthleteStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/athletes/performance');
        if (!response.ok) throw new Error('Failed to fetch data');
        const result = await response.json();
        setAthletes(result.athletes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-slate-100">Athlete Performance</h1>
          <p className="text-lg text-slate-400">Win rates, submissions, and performance metrics</p>
        </div>

        <DashboardCard title="Top Athletes" description="Ranked by total wins">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-700 text-slate-400">
                <tr>
                  <th className="pb-3 pr-4">Rank</th>
                  <th className="pb-3 pr-4">Athlete</th>
                  <th className="pb-3 pr-4">Nationality</th>
                  <th className="pb-3 pr-4">Matches</th>
                  <th className="pb-3 pr-4">Wins</th>
                  <th className="pb-3 pr-4">Win Rate</th>
                  <th className="pb-3 pr-4">Submissions</th>
                  <th className="pb-3">Sub %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {athletes.slice(0, 50).map((athlete, index) => (
                  <tr key={athlete.athleteId} className="hover:bg-slate-800/30">
                    <td className="py-3 pr-4 text-slate-400">{index + 1}</td>
                    <td className="py-3 pr-4 font-medium text-slate-100">{athlete.athleteName}</td>
                    <td className="py-3 pr-4 text-slate-400">{athlete.nationality || '-'}</td>
                    <td className="py-3 pr-4 text-slate-300">{athlete.totalMatches}</td>
                    <td className="py-3 pr-4 text-emerald-400">{athlete.wins}</td>
                    <td className="py-3 pr-4">
                      <span className="text-teal-400">{athlete.winRate.toFixed(1)}%</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-300">{athlete.submissions}</td>
                    <td className="py-3">
                      <span className="text-cyan-400">{athlete.submissionRate.toFixed(1)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      </div>
    </main>
  );
}
