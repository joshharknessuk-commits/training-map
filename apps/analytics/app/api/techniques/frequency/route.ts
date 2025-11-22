import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { matches, tournaments } from '@grapplemap/db';
import { sql, eq, isNotNull, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const gi = searchParams.get('gi'); // 'gi', 'nogi', or 'all'

    // Build WHERE clause
    let whereClause = and(
      isNotNull(matches.submissionType),
      eq(matches.result, 'submission')
    );

    // Query submission frequency by type
    const results = await db
      .select({
        submissionType: matches.submissionType,
        submissionCategory: matches.submissionCategory,
        count: sql<number>`count(*)::int`,
        year: tournaments.year,
      })
      .from(matches)
      .innerJoin(tournaments, eq(matches.tournamentId, tournaments.id))
      .where(whereClause)
      .groupBy(matches.submissionType, matches.submissionCategory, tournaments.year)
      .orderBy(sql`count(*) DESC`);

    // Group by year for charting
    const byYear: Record<number, Record<string, number>> = {};
    const totals: Record<string, number> = {};

    results.forEach((row) => {
      if (!row.submissionType) return;

      const yearKey = row.year;
      if (!byYear[yearKey]) {
        byYear[yearKey] = {};
      }

      byYear[yearKey][row.submissionType] = row.count;
      totals[row.submissionType] = (totals[row.submissionType] || 0) + row.count;
    });

    // Convert to array format for charts
    const chartData = Object.entries(byYear).map(([year, submissions]) => ({
      year: parseInt(year),
      ...submissions,
    }));

    // Top submissions overall
    const topSubmissions = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      chartData,
      topSubmissions,
      totalSubmissions: results.reduce((sum, r) => sum + r.count, 0),
    });
  } catch (error) {
    console.error('Error fetching technique frequency:', error);
    return NextResponse.json(
      { error: 'Failed to fetch technique frequency' },
      { status: 500 }
    );
  }
}
