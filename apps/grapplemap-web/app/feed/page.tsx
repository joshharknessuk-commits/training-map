'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Activity {
  id: string;
  userId: string;
  activityType: string;
  title: string;
  description?: string;
  createdAt: string;
}

export default function FeedPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState<'all' | 'connections' | 'my'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchActivities();
    }
  }, [status, feedType, router]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/activity-feed?type=${feedType}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-GB');
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading feed...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Activity Feed</h1>

          <div className="flex space-x-4">
            <button
              onClick={() => setFeedType('all')}
              className={`px-4 py-2 rounded-md ${
                feedType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              All Activity
            </button>
            <button
              onClick={() => setFeedType('connections')}
              className={`px-4 py-2 rounded-md ${
                feedType === 'connections'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Connections
            </button>
            <button
              onClick={() => setFeedType('my')}
              className={`px-4 py-2 rounded-md ${
                feedType === 'my'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              My Activity
            </button>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">
              {feedType === 'connections'
                ? "No activity from your connections yet. Start connecting with other grapplers!"
                : 'No activity to show yet. Start training and booking classes!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {activity.activityType.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                    {activity.description && (
                      <p className="text-gray-600 mt-1">{activity.description}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">{formatDate(activity.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
