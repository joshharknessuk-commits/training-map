import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@grapplemap/db';
import { bookings, classes, activityFeed } from '@grapplemap/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, session.user.id))
      .$dynamic();

    if (status) {
      query = query.where(
        and(eq(bookings.userId, session.user.id), eq(bookings.bookingStatus, status as any))
      );
    }

    const result = await query;

    return NextResponse.json({ bookings: result });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { classId, bookingDate, userNotes } = body;

    if (!classId || !bookingDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if class exists and has capacity
    const [classData] = await db.select().from(classes).where(eq(classes.id, classId)).limit(1);

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (classData.currentBookings >= classData.capacity) {
      return NextResponse.json({ error: 'Class is full' }, { status: 400 });
    }

    // Check if user already has a booking for this class on this date
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.userId, session.user.id),
          eq(bookings.classId, classId),
          eq(bookings.bookingDate, new Date(bookingDate))
        )
      )
      .limit(1);

    if (existingBooking.length > 0) {
      return NextResponse.json({ error: 'You already have a booking for this class' }, { status: 400 });
    }

    // Create booking
    const [newBooking] = await db
      .insert(bookings)
      .values({
        userId: session.user.id,
        classId,
        bookingDate: new Date(bookingDate),
        bookingStatus: 'confirmed',
        paymentStatus: classData.isFreeForMembers ? 'free' : 'pending',
        amountPaid: classData.isFreeForMembers ? 0 : classData.pricePerSession,
        userNotes,
      })
      .returning();

    // Update class booking count
    await db
      .update(classes)
      .set({
        currentBookings: classData.currentBookings + 1,
      })
      .where(eq(classes.id, classId));

    // Create activity feed entry
    await db.insert(activityFeed).values({
      userId: session.user.id,
      activityType: 'booking_created',
      gymId: classData.gymId,
      classId,
      bookingId: newBooking.id,
      title: 'Booked a class',
      description: `Booked ${classData.name} at ${classData.startTime}`,
      isPublic: 1,
    });

    return NextResponse.json({ booking: newBooking }, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    // Get booking
    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.userId, session.user.id)))
      .limit(1);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Update booking status
    await db
      .update(bookings)
      .set({
        bookingStatus: 'cancelled',
      })
      .where(eq(bookings.id, bookingId));

    // Decrease class booking count
    const [classData] = await db
      .select()
      .from(classes)
      .where(eq(classes.id, booking.classId))
      .limit(1);

    if (classData) {
      await db
        .update(classes)
        .set({
          currentBookings: Math.max(0, classData.currentBookings - 1),
        })
        .where(eq(classes.id, booking.classId));
    }

    return NextResponse.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
