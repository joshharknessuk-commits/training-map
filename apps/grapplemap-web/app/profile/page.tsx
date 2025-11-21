'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface UserProfile {
  displayName?: string;
  bio?: string;
  beltRank?: string;
  stripes?: number;
  weightKg?: number;
  yearsTraining?: number;
  instagramHandle?: string;
  trainingGoals?: string[];
  isPublic?: boolean;
  city?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setFormData(data.profile);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) : value,
    });
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-white">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-glow">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
                Profile
              </p>
              <h1 className="text-2xl font-semibold text-white mt-2">My Profile</h1>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition font-medium"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName || ''}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Belt Rank</label>
                  <select
                    name="beltRank"
                    value={formData.beltRank || ''}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  >
                    <option value="" className="bg-slate-900">Select belt</option>
                    <option value="white" className="bg-slate-900">White</option>
                    <option value="blue" className="bg-slate-900">Blue</option>
                    <option value="purple" className="bg-slate-900">Purple</option>
                    <option value="brown" className="bg-slate-900">Brown</option>
                    <option value="black" className="bg-slate-900">Black</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Stripes</label>
                  <input
                    type="number"
                    name="stripes"
                    min="0"
                    max="4"
                    value={formData.stripes || 0}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    name="weightKg"
                    value={formData.weightKg || ''}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Years Training</label>
                  <input
                    type="number"
                    name="yearsTraining"
                    value={formData.yearsTraining || ''}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Instagram Handle</label>
                <input
                  type="text"
                  name="instagramHandle"
                  value={formData.instagramHandle || ''}
                  onChange={handleChange}
                  placeholder="@username"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic !== false}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/50"
                />
                <label className="ml-2 block text-sm text-slate-300">
                  Make profile public
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-white/20 rounded-full text-slate-300 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:opacity-50 transition font-medium"
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <h3 className="text-lg font-semibold text-white">
                  {profile?.displayName || 'No name set'}
                </h3>
                <p className="text-slate-400">{session?.user?.email}</p>
              </div>

              {profile?.bio && (
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 mb-2">Bio</h4>
                  <p className="text-slate-300">{profile.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {profile?.beltRank && (
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 mb-2">Belt Rank</h4>
                    <p className="text-white capitalize">
                      {profile.beltRank}{' '}
                      {profile.stripes ? `(${profile.stripes} stripes)` : ''}
                    </p>
                  </div>
                )}

                {profile?.yearsTraining !== undefined && (
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 mb-2">Experience</h4>
                    <p className="text-white">{profile.yearsTraining} years</p>
                  </div>
                )}

                {profile?.weightKg && (
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 mb-2">Weight</h4>
                    <p className="text-white">{profile.weightKg} kg</p>
                  </div>
                )}

                {profile?.city && (
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 mb-2">Location</h4>
                    <p className="text-white">{profile.city}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
