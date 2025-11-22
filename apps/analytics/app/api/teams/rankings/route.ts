import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { matches, athletes, teams } from '@grapplemap/db';
import { sql, eq, or } from 'drizzle-orm';

export async function GET() {
  try {
    // Get team performance stats
    const results = await db
      .select({
        teamId: teams.id,
        teamName: teams.name,
        country: teams.country,
        totalMatches: sql<number>`count(*)::int`,
        wins: sql<number>`count(*) FILTER (WHERE ${matches.winnerId} = ${athletes.id})::int`,
        submissions: sql<number>`count(*) FILTER (WHERE ${matches.winnerId} = ${athletes.id} AND ${matches.result} = 'submission')::int`,
        athleteCount: sql<number>`count(DISTINCT ${athletes.id})::int`,
      })
      .from(teams)
      .leftJoin(athletes, eq(athletes.currentTeamId, teams.id))
      .leftJoin(
        matches,
        or(
          eq(matches.athlete1Id, athletes.id),
          eq(matches.athlete2Id, athletes.id)
        )
      )
      .groupBy(teams.id, teams.name, teams.country)
      .orderBy(sql`count(*) FILTER (WHERE ${matches.winnerId} = ${athletes.id}) DESC`)
      .limit(50);

    const teamStats = results.map((row) => ({
      ...row,
      winRate: row.totalMatches > 0 ? (row.wins / row.totalMatches) * 100 : 0,
      submissionRate: row.wins > 0 ? (row.submissions / row.wins) * 100 : 0,
      avgWinsPerAthlete: row.athleteCount > 0 ? row.wins / row.athleteCount : 0,
    }));

    return NextResponse.json({
      teams: teamStats,
    });
  } catch (error) {
    console.error('Error fetching team rankings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team rankings' },
      { status: 500 }
    );
  }
}
