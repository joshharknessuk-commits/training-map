'use client';

import { useEffect, useState } from 'react';
import { DashboardCard } from '@/components/DashboardCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1'];

interface MetaTrendsData {
  finishRates: Array<{ year: number; totalMatches: number; submissionRate: number; decisionRate: number }>;
  risingTechniques: Array<{ name: string; growthRate: number }>;
  fallingTechniques: Array<{ name: string; growthRate: number }>;
}

export default function MetaTrendsPage() {
  const [data, setData] = useState<MetaTrendsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/meta/trends');
        if (!response.ok) throw new Error('Failed to fetch data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="p-12 text-center text-slate-400">No data available</div>;

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-slate-100">Meta Trends Analysis</h1>
          <p className="text-lg text-slate-400">
            Track how the BJJ meta evolves across tournaments and years
          </p>
        </div>

        <div className="grid gap-6">
          <DashboardCard
            title="Finish Rates Over Time"
            description="Submission vs decision rates by year"
          >
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.finishRates}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="submissionRate" stroke="#10b981" strokeWidth={3} name="Submission %" />
                <Line type="monotone" dataKey="decisionRate" stroke="#3b82f6" strokeWidth={3} name="Decision %" />
              </LineChart>
            </ResponsiveContainer>
          </DashboardCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardCard
              title="Rising Techniques"
              description="Techniques increasing in popularity"
            >
              {data.risingTechniques.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={data.risingTechniques} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" width={120} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Bar dataKey="growthRate" fill="#10b981" name="Growth %" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400">No significant rising trends detected yet</p>
              )}
            </DashboardCard>

            <DashboardCard
              title="Falling Techniques"
              description="Techniques decreasing in popularity"
            >
              {data.fallingTechniques.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={data.fallingTechniques} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" width={120} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Bar dataKey="growthRate" fill="#ef4444" name="Decline %" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400">No significant declining trends detected yet</p>
              )}
            </DashboardCard>
          </div>
        </div>
      </div>
    </main>
  );
}
