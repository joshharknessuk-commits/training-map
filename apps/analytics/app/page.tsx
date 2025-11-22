'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const dashboards = [
  {
    title: 'Technique Frequency',
    description: 'Submissions, passes, sweeps, and takedowns by year and division',
    href: '/techniques',
    icon: '🥋',
  },
  {
    title: 'Meta Trends',
    description: 'Techniques rising and falling in popularity over time',
    href: '/meta',
    icon: '📊',
  },
  {
    title: 'Athlete Performance',
    description: 'Win rates, submission percentages, and scoring patterns',
    href: '/athletes',
    icon: '🏆',
  },
  {
    title: 'Team Analytics',
    description: 'Team rankings, style profiles, and geographic clusters',
    href: '/teams',
    icon: '🥊',
  },
  {
    title: 'Match Flow Visualizer',
    description: 'Timeline of scoring sequences and technique chains',
    href: '/flow',
    icon: '🔄',
  },
  {
    title: 'Weight Class Analysis',
    description: 'Submissions and match duration by weight class',
    href: '/weight-classes',
    icon: '⚖️',
  },
  {
    title: 'National Trends',
    description: 'Country-level performance and regional meta differences',
    href: '/countries',
    icon: '🌍',
  },
  {
    title: 'Ruleset Impact',
    description: 'How different rulesets affect finishing rates and styles',
    href: '/rulesets',
    icon: '📋',
  },
];

interface Stats {
  matches: number;
  athletes: number;
  tournaments: number;
  techniques: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({ matches: 0, athletes: 0, tournaments: 0, techniques: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    }

    fetchStats();
  }, []);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              GrappleMap Insights
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-400">
            Comprehensive analytics platform for BJJ tournament data. Analyze techniques, athletes,
            teams, and meta trends across ADCC, IBJJF, AJP, Polaris, EBI, and more.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dashboards.map((dashboard) => (
            <Link
              key={dashboard.href}
              href={dashboard.href}
              className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-emerald-500/50 hover:bg-slate-900"
            >
              <div className="mb-3 text-4xl">{dashboard.icon}</div>
              <h2 className="mb-2 text-xl font-semibold text-slate-100 group-hover:text-emerald-400">
                {dashboard.title}
              </h2>
              <p className="text-sm text-slate-400">{dashboard.description}</p>

              {/* Hover effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-3xl font-bold text-emerald-400">{stats.matches.toLocaleString()}</div>
            <div className="text-sm text-slate-400">Total Matches</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-3xl font-bold text-teal-400">{stats.athletes.toLocaleString()}</div>
            <div className="text-sm text-slate-400">Athletes Tracked</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-3xl font-bold text-cyan-400">{stats.tournaments.toLocaleString()}</div>
            <div className="text-sm text-slate-400">Tournaments</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-3xl font-bold text-blue-400">{stats.techniques.toLocaleString()}</div>
            <div className="text-sm text-slate-400">Techniques Cataloged</div>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-12 rounded-xl border border-slate-800 bg-slate-900/50 p-8">
          <h2 className="mb-4 text-2xl font-bold text-slate-100">Getting Started</h2>
          <div className="space-y-4 text-slate-400">
            <p>
              <strong className="text-emerald-400">Step 1:</strong> Import tournament data using the
              analytics pipelines package
            </p>
            <p>
              <strong className="text-emerald-400">Step 2:</strong> Explore the dashboards to analyze
              techniques, athletes, and meta trends
            </p>
            <p>
              <strong className="text-emerald-400">Step 3:</strong> Use the API endpoints to build
              custom analytics views
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
