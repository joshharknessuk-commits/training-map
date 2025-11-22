import { NextRequest, NextResponse } from 'next/server';
import { withAuthOnly, withApiProtection } from '@/lib/api-middleware';
import { db, bookings, classes, activityFeed } from '@grapplemap/db';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { error, userId } = await withAuthOnly(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .$dynamic();

    if (status) {
      query = query.where(
        and(eq(bookings.userId, userId), eq(bookings.bookingStatus, status as any))
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
    const { error, userId } = await withApiProtection(request);
    if (error) return error;

    const body = await request.json();
    const { classId, bookingDate, userNotes } = body;

    if (!classId || !bookingDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use transaction to prevent race condition when booking classes
    // This ensures atomic read-modify-write of currentBookings
    const result = await db.transaction(async (tx) => {
      // Check if class exists and has capacity
      // Use SELECT FOR UPDATE to lock the row until transaction completes
      const [classData] = await tx
        .select()
        .from(classes)
        .where(eq(classes.id, classId))
        .for('update')
        .limit(1);

      if (!classData) {
        throw new Error('Class not found');
      }

      if (classData.currentBookings >= classData.capacity) {
        throw new Error('Class is full');
      }

      // Check if user already has a booking for this class on this date
      const existingBooking = await tx
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.userId, userId),
            eq(bookings.classId, classId),
            eq(bookings.bookingDate, new Date(bookingDate))
          )
        )
        .limit(1);

      if (existingBooking.length > 0) {
        throw new Error('You already have a booking for this class');
      }

      // Create booking
      const [newBooking] = await tx
        .insert(bookings)
        .values({
          userId,
          classId,
          bookingDate: new Date(bookingDate),
          bookingStatus: 'confirmed',
          paymentStatus: classData.isFreeForMembers ? 'free' : 'pending',
          amountPaid: classData.isFreeForMembers ? 0 : classData.pricePerSession,
          userNotes,
        })
        .returning();

      // Atomically increment class booking count
      // This is now safe because we hold a lock on the class row
      await tx
        .update(classes)
        .set({
          currentBookings: sql`${classes.currentBookings} + 1`,
        })
        .where(eq(classes.id, classId));

      // Create activity feed entry
      await tx.insert(activityFeed).values({
        userId,
        activityType: 'booking_created',
        gymId: classData.gymId,
        classId,
        bookingId: newBooking.id,
        title: 'Booked a class',
        description: `Booked ${classData.name} at ${classData.startTime}`,
        isPublic: 1,
      });

      return newBooking;
    });

    return NextResponse.json({ booking: result }, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);

    // Handle business logic errors from transaction
    if (error instanceof Error) {
      if (error.message === 'Class not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === 'Class is full' || error.message === 'You already have a booking for this class') {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { error, userId } = await withApiProtection(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    // Use transaction to prevent race condition when cancelling
    await db.transaction(async (tx) => {
      // Get booking
      const [booking] = await tx
        .select()
        .from(bookings)
        .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
        .limit(1);

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Update booking status
      await tx
        .update(bookings)
        .set({
          bookingStatus: 'cancelled',
        })
        .where(eq(bookings.id, bookingId));

      // Atomically decrement class booking count
      await tx
        .update(classes)
        .set({
          currentBookings: sql`GREATEST(0, ${classes.currentBookings} - 1)`,
        })
        .where(eq(classes.id, booking.classId));
    });

    return NextResponse.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);

    // Handle business logic errors from transaction
    if (error instanceof Error && error.message === 'Booking not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
