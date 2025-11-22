import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { matches, athletes } from '@grapplemap/db';
import { sql, eq, or } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get('athleteId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get athlete performance stats
    const results = await db
      .select({
        athleteId: athletes.id,
        athleteName: athletes.name,
        nationality: athletes.nationality,
        totalMatches: sql<number>`count(*)::int`,
        wins: sql<number>`count(*) FILTER (WHERE ${matches.winnerId} = ${athletes.id})::int`,
        submissions: sql<number>`count(*) FILTER (WHERE ${matches.winnerId} = ${athletes.id} AND ${matches.result} = 'submission')::int`,
        avgMatchDuration: sql<number>`avg(${matches.durationSeconds})::int`,
      })
      .from(athletes)
      .leftJoin(
        matches,
        or(
          eq(matches.athlete1Id, athletes.id),
          eq(matches.athlete2Id, athletes.id)
        )
      )
      .groupBy(athletes.id, athletes.name, athletes.nationality)
      .orderBy(sql`count(*) FILTER (WHERE ${matches.winnerId} = ${athletes.id}) DESC`)
      .limit(limit);

    // Calculate win rate and submission percentage
    const athleteStats = results.map((row) => ({
      ...row,
      winRate: row.totalMatches > 0 ? (row.wins / row.totalMatches) * 100 : 0,
      submissionRate: row.wins > 0 ? (row.submissions / row.wins) * 100 : 0,
    }));

    return NextResponse.json({
      athletes: athleteStats,
    });
  } catch (error) {
    console.error('Error fetching athlete performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch athlete performance' },
      { status: 500 }
    );
  }
}
