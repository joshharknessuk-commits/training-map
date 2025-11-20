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
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Discover GrappleMap Network</h1>
          <p className="mt-2 text-lg text-gray-600">
            Connect with gyms and grapplers across London
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Available Classes</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalClasses}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Your Upcoming Bookings</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcomingBookings}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Connections</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.connections}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/classes"
            className="bg-blue-600 text-white rounded-lg shadow p-6 hover:bg-blue-700 transition"
          >
            <h3 className="text-lg font-semibold">Browse Classes</h3>
            <p className="text-sm mt-2 opacity-90">Find and book BJJ classes</p>
          </Link>
          <Link
            href="/profile"
            className="bg-purple-600 text-white rounded-lg shadow p-6 hover:bg-purple-700 transition"
          >
            <h3 className="text-lg font-semibold">My Profile</h3>
            <p className="text-sm mt-2 opacity-90">Update your info and preferences</p>
          </Link>
          <Link
            href="/feed"
            className="bg-green-600 text-white rounded-lg shadow p-6 hover:bg-green-700 transition"
          >
            <h3 className="text-lg font-semibold">Activity Feed</h3>
            <p className="text-sm mt-2 opacity-90">See who's training</p>
          </Link>
          <Link
            href="/bookings"
            className="bg-orange-600 text-white rounded-lg shadow p-6 hover:bg-orange-700 transition"
          >
            <h3 className="text-lg font-semibold">My Bookings</h3>
            <p className="text-sm mt-2 opacity-90">View your upcoming classes</p>
          </Link>
        </div>

        {/* Nearby Gyms */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Gyms in London</h2>
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              View Map →
            </Link>
          </div>

          {gyms.length === 0 ? (
            <p className="text-gray-600">No gyms available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gyms.slice(0, 6).map((gym) => (
                <div key={gym.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition">
                  <h3 className="font-semibold text-gray-900">{gym.name}</h3>
                  {gym.borough && (
                    <p className="text-sm text-gray-600 mt-1">{gym.borough}</p>
                  )}
                  <Link
                    href={`/gyms/${gym.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
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
