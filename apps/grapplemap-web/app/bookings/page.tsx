'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  classId: string;
  bookingDate: string;
  bookingStatus: string;
  paymentStatus: string;
  amountPaid: number;
}

export default function BookingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status, router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Booking cancelled successfully');
        fetchBookings();
      } else {
        alert('Failed to cancel booking');
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading bookings...</div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    (b) => b.bookingStatus === 'confirmed' && new Date(b.bookingDate) > new Date()
  );

  const pastBookings = bookings.filter(
    (b) =>
      b.bookingStatus === 'completed' ||
      b.bookingStatus === 'no_show' ||
      (b.bookingStatus === 'confirmed' && new Date(b.bookingDate) <= new Date())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upcoming</h2>
            {upcomingBookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                No upcoming bookings
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {new Date(booking.bookingDate).toLocaleDateString('en-GB', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Payment: {booking.paymentStatus}
                        </p>
                        {booking.amountPaid > 0 && (
                          <p className="text-sm text-gray-600">
                            Amount: £{booking.amountPaid.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Past Bookings</h2>
            {pastBookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                No past bookings
              </div>
            ) : (
              <div className="space-y-4">
                {pastBookings.slice(0, 10).map((booking) => (
                  <div key={booking.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {new Date(booking.bookingDate).toLocaleDateString('en-GB', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 capitalize">
                          Status: {booking.bookingStatus.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
