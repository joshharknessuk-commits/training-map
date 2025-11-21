'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Gym {
  id: string;
  name: string;
  borough?: string;
  lat: number;
  lon: number;
}

interface QuickStats {
  totalClasses: number;
  upcomingBookings: number;
  connections: number;
}

export default function DiscoverPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [stats, setStats] = useState<QuickStats>({ totalClasses: 0, upcomingBookings: 0, connections: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      // Fetch gyms
      const gymsResponse = await fetch('/api/gyms');
      if (gymsResponse.ok) {
        const gymsData = await gymsResponse.json();
        setGyms(gymsData.gyms || []);
      }

      // Fetch user stats
      const [classesRes, bookingsRes, connectionsRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/bookings?status=confirmed'),
        fetch('/api/connections?type=following'),
      ]);

      const classes = classesRes.ok ? (await classesRes.json()).classes : [];
      const bookings = bookingsRes.ok ? (await bookingsRes.json()).bookings : [];
      const connections = connectionsRes.ok ? (await connectionsRes.json()).connections : [];

      setStats({
        totalClasses: classes.length,
        upcomingBookings: bookings.filter((b: any) => new Date(b.bookingDate) > new Date()).length,
        connections: connections.length,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold text-white mt-2">Discover GrappleMap Network</h1>
          <p className="mt-2 text-slate-300">
            Connect with gyms and grapplers across London
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-glow">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Available Classes</p>
            <p className="text-3xl font-semibold text-white mt-2">{stats.totalClasses}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-glow">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Upcoming Bookings</p>
            <p className="text-3xl font-semibold text-white mt-2">{stats.upcomingBookings}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-glow">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Connections</p>
            <p className="text-3xl font-semibold text-white mt-2">{stats.connections}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/classes"
            className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 hover:bg-emerald-500/20 transition"
          >
            <h3 className="text-lg font-semibold text-white">Browse Classes</h3>
            <p className="text-sm mt-2 text-emerald-100">Find and book BJJ classes</p>
          </Link>
          <Link
            href="/profile"
            className="rounded-3xl border border-sky-500/30 bg-sky-500/10 p-6 hover:bg-sky-500/20 transition"
          >
            <h3 className="text-lg font-semibold text-white">My Profile</h3>
            <p className="text-sm mt-2 text-sky-100">Update your info and preferences</p>
          </Link>
          <Link
            href="/feed"
            className="rounded-3xl border border-violet-500/30 bg-violet-500/10 p-6 hover:bg-violet-500/20 transition"
          >
            <h3 className="text-lg font-semibold text-white">Activity Feed</h3>
            <p className="text-sm mt-2 text-violet-100">See who&apos;s training</p>
          </Link>
          <Link
            href="/bookings"
            className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 hover:bg-amber-500/20 transition"
          >
            <h3 className="text-lg font-semibold text-white">My Bookings</h3>
            <p className="text-sm mt-2 text-amber-100">View your upcoming classes</p>
          </Link>
        </div>

        {/* Nearby Gyms */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-glow">
          <div className="flex justify-between items-center mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Gyms in London</p>
            <Link href="/" className="text-emerald-400 hover:text-emerald-300 font-medium text-sm">
              View Map →
            </Link>
          </div>

          {gyms.length === 0 ? (
            <p className="text-slate-400">No gyms available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gyms.slice(0, 6).map((gym) => (
                <div key={gym.id} className="rounded-2xl border border-white/5 bg-white/5 p-4 hover:border-emerald-500/30 transition">
                  <h3 className="font-semibold text-white">{gym.name}</h3>
                  {gym.borough && (
                    <p className="text-sm text-slate-400 mt-1">{gym.borough}</p>
                  )}
                  <Link
                    href={`/gyms/${gym.id}`}
                    className="text-emerald-400 hover:text-emerald-300 text-sm mt-2 inline-block"
                  >
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
