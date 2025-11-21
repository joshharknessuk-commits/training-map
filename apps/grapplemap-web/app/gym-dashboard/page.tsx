'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Class {
  id: string;
  name: string;
  classType: string;
  dayOfWeek?: string;
  startTime: string;
  endTime: string;
  capacity: number;
  currentBookings: number;
  pricePerSession: number;
  isActive: number;
}

export default function GymDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructorName: '',
    classType: 'gi',
    dayOfWeek: 'monday',
    startTime: '',
    endTime: '',
    capacity: 20,
    pricePerSession: 15,
    isFreeForMembers: false,
    isRecurring: true,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchClasses();
    }
  }, [status, router]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Note: In production, you'd need to associate this with a specific gym
      // For now, we'll need to get the gymId from the user's gym admin relationship
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          gymId: 'placeholder-gym-id', // TODO: Get actual gym ID from user's gym admin relationship
        }),
      });

      if (response.ok) {
        alert('Class created successfully!');
        setShowAddForm(false);
        fetchClasses();
        // Reset form
        setFormData({
          name: '',
          description: '',
          instructorName: '',
          classType: 'gi',
          dayOfWeek: 'monday',
          startTime: '',
          endTime: '',
          capacity: 20,
          pricePerSession: 15,
          isFreeForMembers: false,
          isRecurring: true,
        });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create class');
      }
    } catch (error) {
      console.error('Failed to create class:', error);
      alert('Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  if (loading && classes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
              Management
            </p>
            <h1 className="text-3xl font-semibold text-white mt-2">Gym Dashboard</h1>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition font-medium"
          >
            {showAddForm ? 'Cancel' : 'Add Class'}
          </button>
        </div>

        {showAddForm && (
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 mb-8 shadow-glow">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 mb-4">
              Add New Class
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Class Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Instructor</label>
                  <input
                    type="text"
                    value={formData.instructorName}
                    onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Class Type</label>
                  <select
                    value={formData.classType}
                    onChange={(e) => setFormData({ ...formData, classType: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  >
                    <option value="gi" className="bg-slate-900">Gi</option>
                    <option value="nogi" className="bg-slate-900">No-Gi</option>
                    <option value="open_mat" className="bg-slate-900">Open Mat</option>
                    <option value="fundamentals" className="bg-slate-900">Fundamentals</option>
                    <option value="advanced" className="bg-slate-900">Advanced</option>
                    <option value="all_levels" className="bg-slate-900">All Levels</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Day of Week</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  >
                    <option value="monday" className="bg-slate-900">Monday</option>
                    <option value="tuesday" className="bg-slate-900">Tuesday</option>
                    <option value="wednesday" className="bg-slate-900">Wednesday</option>
                    <option value="thursday" className="bg-slate-900">Thursday</option>
                    <option value="friday" className="bg-slate-900">Friday</option>
                    <option value="saturday" className="bg-slate-900">Saturday</option>
                    <option value="sunday" className="bg-slate-900">Sunday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Capacity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Price per Session (£)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pricePerSession}
                  onChange={(e) => setFormData({ ...formData, pricePerSession: parseFloat(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFreeForMembers}
                  onChange={(e) => setFormData({ ...formData, isFreeForMembers: e.target.checked })}
                  className="h-4 w-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/50"
                />
                <label className="ml-2 block text-sm text-slate-300">
                  Free for network members
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:opacity-50 transition font-medium"
              >
                {loading ? 'Creating...' : 'Create Class'}
              </button>
            </form>
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-slate-950/70 shadow-glow overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
              Your Classes
            </p>
          </div>

          {classes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-400">No classes yet. Add your first class to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Day & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {classes.map((cls) => (
                    <tr key={cls.id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{cls.name}</div>
                        <div className="text-sm text-slate-400 capitalize">{cls.classType.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white capitalize">{cls.dayOfWeek}</div>
                        <div className="text-sm text-slate-400">{cls.startTime} - {cls.endTime}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {cls.currentBookings} / {cls.capacity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        £{cls.pricePerSession.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cls.isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {cls.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
