import { NextRequest, NextResponse } from 'next/server';
import { db, classes, gyms } from '@grapplemap/db';
import { eq, and, gte, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gymId = searchParams.get('gymId');
    const dayOfWeek = searchParams.get('dayOfWeek');
    const classType = searchParams.get('classType');
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    let query = db.select().from(classes).$dynamic();

    const conditions = [];

    if (gymId) {
      conditions.push(eq(classes.gymId, gymId));
    }

    if (dayOfWeek) {
      conditions.push(eq(classes.dayOfWeek, dayOfWeek as any));
    }

    if (classType) {
      conditions.push(eq(classes.classType, classType as any));
    }

    if (activeOnly) {
      conditions.push(eq(classes.isActive, 1));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;

    return NextResponse.json({ classes: result });
  } catch (error) {
    console.error('Get classes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      gymId,
      name,
      description,
      instructorName,
      classType,
      dayOfWeek,
      startTime,
      endTime,
      specificDate,
      capacity,
      pricePerSession,
      isFreeForMembers,
      isRecurring,
      minBeltRank,
    } = body;

    // Validate required fields
    if (!gymId || !name || !classType || !startTime || !endTime || !capacity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [newClass] = await db
      .insert(classes)
      .values({
        gymId,
        name,
        description,
        instructorName,
        classType,
        dayOfWeek,
        startTime,
        endTime,
        specificDate,
        capacity,
        pricePerSession: pricePerSession || 0,
        isFreeForMembers: isFreeForMembers ? 1 : 0,
        isRecurring: isRecurring ? 1 : 0,
        minBeltRank,
        status: 'scheduled',
        isActive: 1,
      })
      .returning();

    return NextResponse.json({ class: newClass }, { status: 201 });
  } catch (error) {
    console.error('Create class error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
