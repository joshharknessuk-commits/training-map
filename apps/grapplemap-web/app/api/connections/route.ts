import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@grapplemap/db';
import { userConnections, users, userProfiles } from '@grapplemap/db/schema';
import { eq, or, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'following', 'followers', or 'all'

    let query;

    if (type === 'following') {
      query = db
        .select()
        .from(userConnections)
        .where(
          and(
            eq(userConnections.followerId, session.user.id),
            eq(userConnections.status, 'accepted')
          )
        );
    } else if (type === 'followers') {
      query = db
        .select()
        .from(userConnections)
        .where(
          and(
            eq(userConnections.followingId, session.user.id),
            eq(userConnections.status, 'accepted')
          )
        );
    } else {
      query = db
        .select()
        .from(userConnections)
        .where(
          or(
            eq(userConnections.followerId, session.user.id),
            eq(userConnections.followingId, session.user.id)
          )
        );
    }

    const connections = await query;

    return NextResponse.json({ connections });
  } catch (error) {
    console.error('Get connections error:', error);
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
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json({ error: 'Following user ID required' }, { status: 400 });
    }

    if (followingId === session.user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if connection already exists
    const existingConnection = await db
      .select()
      .from(userConnections)
      .where(
        and(
          eq(userConnections.followerId, session.user.id),
          eq(userConnections.followingId, followingId)
        )
      )
      .limit(1);

    if (existingConnection.length > 0) {
      return NextResponse.json({ error: 'Connection already exists' }, { status: 400 });
    }

    const [newConnection] = await db
      .insert(userConnections)
      .values({
        followerId: session.user.id,
        followingId,
        status: 'accepted', // Auto-accept for now
      })
      .returning();

    return NextResponse.json({ connection: newConnection }, { status: 201 });
  } catch (error) {
    console.error('Create connection error:', error);
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
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    await db
      .delete(userConnections)
      .where(
        and(
          eq(userConnections.followerId, session.user.id),
          eq(userConnections.followingId, userId)
        )
      );

    return NextResponse.json({ message: 'Connection removed successfully' });
  } catch (error) {
    console.error('Delete connection error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
