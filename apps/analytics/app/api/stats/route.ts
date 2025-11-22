import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { matches, athletes, tournaments, techniques } from '@grapplemap/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const [matchCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(matches);

    const [athleteCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(athletes);

    const [tournamentCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tournaments);

    const [techniqueCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(techniques);

    return NextResponse.json({
      matches: matchCount.count,
      athletes: athleteCount.count,
      tournaments: tournamentCount.count,
      techniques: techniqueCount.count,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
