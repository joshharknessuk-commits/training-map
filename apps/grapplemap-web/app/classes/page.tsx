'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Class {
  id: string;
  gymId: string;
  name: string;
  description?: string;
  instructorName?: string;
  classType: string;
  dayOfWeek?: string;
  startTime: string;
  endTime: string;
  capacity: number;
  currentBookings: number;
  pricePerSession: number;
  isFreeForMembers: number;
}

export default function ClassesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingClass, setBookingClass] = useState<string | null>(null);

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

  const handleBookClass = async (classId: string) => {
    setBookingClass(classId);

    try {
      // Get the next occurrence of the class (simplified - using today's date)
      const bookingDate = new Date().toISOString();

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          bookingDate,
        }),
      });

      if (response.ok) {
        alert('Class booked successfully!');
        fetchClasses(); // Refresh to update booking counts
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to book class');
      }
    } catch (error) {
      console.error('Failed to book class:', error);
      alert('Failed to book class');
    } finally {
      setBookingClass(null);
    }
  };

  const groupedClasses = classes.reduce(
    (acc, cls) => {
      const day = cls.dayOfWeek || 'One-time';
      if (!acc[day]) acc[day] = [];
      acc[day].push(cls);
      return acc;
    },
    {} as Record<string, Class[]>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-neutral-900">Loading classes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
            Classes
          </p>
          <h1 className="text-3xl font-semibold text-neutral-900 mt-2">Browse Classes</h1>
          <p className="mt-2 text-neutral-800">Find and book BJJ classes across London</p>
        </div>

        {Object.keys(groupedClasses).length === 0 ? (
          <div className="rounded-3xl border-2 border-neutral-200 bg-white/70 p-8 text-center shadow-glow">
            <p className="text-neutral-700">No classes available at the moment.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedClasses).map(([day, dayClasses]) => (
              <div key={day}>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4 capitalize">{day}</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {dayClasses.map((cls) => (
                    <div key={cls.id} className="rounded-3xl border-2 border-neutral-200 bg-white/70 p-6 shadow-glow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-900">{cls.name}</h3>
                          <p className="text-sm text-neutral-700 capitalize">{cls.classType.replace(/_/g, ' ')}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            cls.currentBookings >= cls.capacity
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : cls.currentBookings >= cls.capacity * 0.8
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-brand-500/20 text-brand-600 border border-emerald-500/30'
                          }`}
                        >
                          {cls.capacity - cls.currentBookings} spots left
                        </span>
                      </div>

                      {cls.description && (
                        <p className="text-sm text-neutral-700 mb-4">{cls.description}</p>
                      )}

                      <div className="space-y-2 mb-4">
                        {cls.instructorName && (
                          <p className="text-sm text-neutral-800">
                            <span className="text-neutral-600">Instructor:</span> {cls.instructorName}
                          </p>
                        )}
                        <p className="text-sm text-neutral-800">
                          <span className="text-neutral-600">Time:</span> {cls.startTime} - {cls.endTime}
                        </p>
                        <p className="text-sm text-neutral-800">
                          <span className="text-neutral-600">Price:</span>{' '}
                          {cls.isFreeForMembers
                            ? 'Free for members'
                            : `£${cls.pricePerSession.toFixed(2)}`}
                        </p>
                      </div>

                      <button
                        onClick={() => handleBookClass(cls.id)}
                        disabled={
                          cls.currentBookings >= cls.capacity || bookingClass === cls.id
                        }
                        className="w-full px-4 py-2 bg-brand-500 text-neutral-900 rounded-full hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                      >
                        {bookingClass === cls.id
                          ? 'Booking...'
                          : cls.currentBookings >= cls.capacity
                            ? 'Full'
                            : 'Book Class'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/bookings"
            className="text-brand-600 hover:text-brand-600 font-medium"
          >
            View My Bookings →
          </Link>
        </div>
      </div>
    </div>
  );
}
