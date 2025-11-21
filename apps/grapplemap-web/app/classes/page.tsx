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
        <div className="text-lg">Loading classes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Classes</h1>
          <p className="mt-2 text-gray-600">Find and book BJJ classes across London</p>
        </div>

        {Object.keys(groupedClasses).length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No classes available at the moment.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedClasses).map(([day, dayClasses]) => (
              <div key={day}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 capitalize">{day}</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {dayClasses.map((cls) => (
                    <div key={cls.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{cls.classType.replace(/_/g, ' ')}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            cls.currentBookings >= cls.capacity
                              ? 'bg-red-100 text-red-800'
                              : cls.currentBookings >= cls.capacity * 0.8
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {cls.capacity - cls.currentBookings} spots left
                        </span>
                      </div>

                      {cls.description && (
                        <p className="text-sm text-gray-600 mb-4">{cls.description}</p>
                      )}

                      <div className="space-y-2 mb-4">
                        {cls.instructorName && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Instructor:</span> {cls.instructorName}
                          </p>
                        )}
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Time:</span> {cls.startTime} - {cls.endTime}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Price:</span>{' '}
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
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View My Bookings →
          </Link>
        </div>
      </div>
    </div>
  );
}
