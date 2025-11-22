import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { matches, tournaments } from '@grapplemap/db';
import { sql, eq, isNotNull } from 'drizzle-orm';

export async function GET() {
  try {
    // Get submission trends by year
    const submissionTrends = await db
      .select({
        year: tournaments.year,
        submissionType: matches.submissionType,
        count: sql<number>`count(*)::int`,
      })
      .from(matches)
      .innerJoin(tournaments, eq(matches.tournamentId, tournaments.id))
      .where(isNotNull(matches.submissionType))
      .groupBy(tournaments.year, matches.submissionType)
      .orderBy(tournaments.year, sql`count(*) DESC`);

    // Get finish rate by year (submission vs points)
    const finishRates = await db
      .select({
        year: tournaments.year,
        totalMatches: sql<number>`count(*)::int`,
        submissions: sql<number>`count(*) FILTER (WHERE ${matches.result} = 'submission')::int`,
        decisions: sql<number>`count(*) FILTER (WHERE ${matches.result} IN ('points', 'decision', 'advantage'))::int`,
      })
      .from(matches)
      .innerJoin(tournaments, eq(matches.tournamentId, tournaments.id))
      .groupBy(tournaments.year)
      .orderBy(tournaments.year);

    const finishRateData = finishRates.map((row) => ({
      year: row.year,
      totalMatches: row.totalMatches,
      submissionRate: row.totalMatches > 0 ? (row.submissions / row.totalMatches) * 100 : 0,
      decisionRate: row.totalMatches > 0 ? (row.decisions / row.totalMatches) * 100 : 0,
    }));

    // Calculate trends (rising/falling techniques)
    const trendsByTechnique = new Map<string, { years: number[]; counts: number[] }>();

    submissionTrends.forEach((row) => {
      if (!row.submissionType) return;

      if (!trendsByTechnique.has(row.submissionType)) {
        trendsByTechnique.set(row.submissionType, { years: [], counts: [] });
      }

      const trend = trendsByTechnique.get(row.submissionType)!;
      trend.years.push(row.year);
      trend.counts.push(row.count);
    });

    // Calculate growth rate for each technique
    const risingTechniques: Array<{ name: string; growthRate: number }> = [];
    const fallingTechniques: Array<{ name: string; growthRate: number }> = [];

    trendsByTechnique.forEach((trend, name) => {
      if (trend.years.length < 2) return;

      // Simple linear growth calculation
      const firstYear = trend.counts[0];
      const lastYear = trend.counts[trend.counts.length - 1];
      const growthRate = ((lastYear - firstYear) / firstYear) * 100;

      if (growthRate > 20) {
        risingTechniques.push({ name, growthRate });
      } else if (growthRate < -20) {
        fallingTechniques.push({ name, growthRate });
      }
    });

    risingTechniques.sort((a, b) => b.growthRate - a.growthRate);
    fallingTechniques.sort((a, b) => a.growthRate - b.growthRate);

    return NextResponse.json({
      finishRates: finishRateData,
      risingTechniques: risingTechniques.slice(0, 10),
      fallingTechniques: fallingTechniques.slice(0, 10),
      submissionTrends,
    });
  } catch (error) {
    console.error('Error fetching meta trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meta trends' },
      { status: 500 }
    );
  }
}
