'use client';

import { useEffect, useState } from 'react';
import { DashboardCard } from '@/components/DashboardCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899'];

interface TechniqueData {
  chartData: Array<Record<string, number | string>>;
  topSubmissions: Array<{ name: string; count: number }>;
  totalSubmissions: number;
}

export default function TechniquesPage() {
  const [data, setData] = useState<TechniqueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/techniques/frequency');
        if (!response.ok) throw new Error('Failed to fetch data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-12 text-center text-red-400">Error: {error}</div>;
  if (!data) return <div className="p-12 text-center text-slate-400">No data available</div>;

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-slate-100">Technique Frequency Analysis</h1>
          <p className="text-lg text-slate-400">
            Submissions, passes, sweeps, and takedowns across tournaments
          </p>
        </div>

        <div className="mb-6 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-3xl font-bold text-emerald-400">{data.totalSubmissions}</div>
            <div className="text-sm text-slate-400">Total Submissions</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-3xl font-bold text-teal-400">{data.topSubmissions.length}</div>
            <div className="text-sm text-slate-400">Unique Techniques</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-3xl font-bold text-cyan-400">
              {data.topSubmissions[0]?.name || 'N/A'}
            </div>
            <div className="text-sm text-slate-400">Most Common</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardCard
            title="Top Submissions"
            description="Most frequently used submission techniques"
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.topSubmissions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </DashboardCard>

          <DashboardCard
            title="Submission Distribution"
            description="Breakdown of submission types"
          >
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data.topSubmissions.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.topSubmissions.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </DashboardCard>

          {data.chartData.length > 0 && (
            <DashboardCard
              title="Submissions Over Time"
              description="Technique frequency by year"
              className="lg:col-span-2"
            >
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  {data.topSubmissions.slice(0, 5).map((sub, index) => (
                    <Line
                      key={sub.name}
                      type="monotone"
                      dataKey={sub.name}
                      stroke={COLORS[index]}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </DashboardCard>
          )}
        </div>
      </div>
    </main>
  );
}
