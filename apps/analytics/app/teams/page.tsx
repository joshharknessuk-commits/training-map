'use client';

import { useEffect, useState } from 'react';
import { DashboardCard } from '@/components/DashboardCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface TeamStats {
  teamId: string;
  teamName: string;
  country: string | null;
  totalMatches: number;
  wins: number;
  submissions: number;
  athleteCount: number;
  winRate: number;
  submissionRate: number;
  avgWinsPerAthlete: number;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/teams/rankings');
        if (!response.ok) throw new Error('Failed to fetch data');
        const result = await response.json();
        setTeams(result.teams);
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
          <h1 className="mb-2 text-4xl font-bold text-slate-100">Team Analytics</h1>
          <p className="text-lg text-slate-400">Rankings and performance by team affiliation</p>
        </div>

        <DashboardCard title="Team Rankings" description="Ranked by total wins">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-700 text-slate-400">
                <tr>
                  <th className="pb-3 pr-4">Rank</th>
                  <th className="pb-3 pr-4">Team</th>
                  <th className="pb-3 pr-4">Country</th>
                  <th className="pb-3 pr-4">Athletes</th>
                  <th className="pb-3 pr-4">Wins</th>
                  <th className="pb-3 pr-4">Win Rate</th>
                  <th className="pb-3 pr-4">Subs</th>
                  <th className="pb-3">Avg Wins/Athlete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {teams.slice(0, 50).map((team, index) => (
                  <tr key={team.teamId} className="hover:bg-slate-800/30">
                    <td className="py-3 pr-4 text-slate-400">{index + 1}</td>
                    <td className="py-3 pr-4 font-medium text-slate-100">{team.teamName}</td>
                    <td className="py-3 pr-4 text-slate-400">{team.country || '-'}</td>
                    <td className="py-3 pr-4 text-slate-300">{team.athleteCount}</td>
                    <td className="py-3 pr-4 text-emerald-400">{team.wins}</td>
                    <td className="py-3 pr-4">
                      <span className="text-teal-400">{team.winRate.toFixed(1)}%</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-300">{team.submissions}</td>
                    <td className="py-3">
                      <span className="text-cyan-400">{team.avgWinsPerAthlete.toFixed(1)}</span>
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
