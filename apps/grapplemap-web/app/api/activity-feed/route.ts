import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, activityFeed, userConnections, users, userProfiles } from '@grapplemap/db';
import { eq, or, and, inArray, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const feedType = searchParams.get('type'); // 'my', 'connections', or 'all'
    const limit = parseInt(searchParams.get('limit') || '50');

    let query;

    if (feedType === 'my') {
      // Only user's own activities
      query = db
        .select()
        .from(activityFeed)
        .where(eq(activityFeed.userId, session.user.id))
        .orderBy(desc(activityFeed.createdAt))
        .limit(limit);
    } else if (feedType === 'connections') {
      // Get user's connections
      const connections = await db
        .select()
        .from(userConnections)
        .where(
          and(
            eq(userConnections.followerId, session.user.id),
            eq(userConnections.status, 'accepted')
          )
        );

      const followingIds = connections.map((c) => c.followingId);

      if (followingIds.length === 0) {
        return NextResponse.json({ activities: [] });
      }

      // Get activities from followed users
      query = db
        .select()
        .from(activityFeed)
        .where(and(inArray(activityFeed.userId, followingIds), eq(activityFeed.isPublic, 1)))
        .orderBy(desc(activityFeed.createdAt))
        .limit(limit);
    } else {
      // All public activities
      query = db
        .select()
        .from(activityFeed)
        .where(eq(activityFeed.isPublic, 1))
        .orderBy(desc(activityFeed.createdAt))
        .limit(limit);
    }

    const activities = await query;

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Get activity feed error:', error);
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
    const { activityType, gymId, classId, bookingId, title, description, isPublic, metadata } =
      body;

    if (!activityType || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [newActivity] = await db
      .insert(activityFeed)
      .values({
        userId: session.user.id,
        activityType,
        gymId,
        classId,
        bookingId,
        title,
        description,
        metadata,
        isPublic: isPublic ? 1 : 0,
      })
      .returning();

    return NextResponse.json({ activity: newActivity }, { status: 201 });
  } catch (error) {
    console.error('Create activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
