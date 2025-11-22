#!/usr/bin/env node
import 'dotenv/config';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { db } from '@grapplemap/db';
import {
  athletes,
  teams,
  tournaments,
  rulesets,
  weightClasses,
  matches,
  techniques,
  techniqueCategories,
  athleteTeamHistory,
} from '@grapplemap/db/schema';
import { normalizeName, normalizeCountryCode, getSubmissionCategory } from '../utils/normalize';
import { eq, and } from 'drizzle-orm';

/**
 * ADCC CSV Ingestion Pipeline
 *
 * Expected CSV format (from BJJ Heroes scraper):
 * match_id,winner_id,winner_name,loser_id,loser_name,win_type,submission,
 * winner_points,loser_points,adv_pen,weight_class,sex,stage,year
 */

interface ADCCMatchRow {
  match_id: string;
  winner_id: string;
  winner_name: string;
  loser_id: string;
  loser_name: string;
  win_type: string;
  submission: string;
  winner_points: string;
  loser_points: string;
  adv_pen: string;
  weight_class: string;
  sex: string;
  stage: string;
  year: string;
}

async function getOrCreateAthlete(
  athleteId: string,
  name: string,
  teamName?: string
): Promise<string> {
  if (!name || name === 'N/A') {
    throw new Error('Invalid athlete name');
  }

  const normalizedName = normalizeName(name);

  // Try to find existing athlete
  const existing = await db
    .select()
    .from(athletes)
    .where(eq(athletes.normalizedName, normalizedName))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  // Create new athlete
  let teamId: string | undefined;
  if (teamName && teamName !== 'N/A') {
    teamId = await getOrCreateTeam(teamName);
  }

  const [newAthlete] = await db
    .insert(athletes)
    .values({
      name,
      normalizedName,
      currentTeamId: teamId,
    })
    .returning();

  return newAthlete.id;
}

async function getOrCreateTeam(name: string): Promise<string> {
  const normalizedName = normalizeName(name);

  const existing = await db
    .select()
    .from(teams)
    .where(eq(teams.normalizedName, normalizedName))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [newTeam] = await db
    .insert(teams)
    .values({
      name,
      normalizedName,
    })
    .returning();

  return newTeam.id;
}

async function getOrCreateRuleset(organization: string): Promise<string> {
  const existing = await db
    .select()
    .from(rulesets)
    .where(eq(rulesets.organization, organization))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  // Create ADCC ruleset
  const [newRuleset] = await db
    .insert(rulesets)
    .values({
      name: organization,
      organization,
      description: `${organization} submission wrestling rules`,
      pointsForTakedown: 2,
      pointsForSweep: 2,
      pointsForPass: 3,
      pointsForMount: 2,
      pointsForBack: 3,
      hasOvertimeRules: 1,
      overtimeRulesDescription: 'No points for first half, points only in second half',
      matchDurationMinutes: 10,
      submissionOnly: 0,
      gi: 0,
    })
    .returning();

  return newRuleset.id;
}

async function getOrCreateTournament(year: number, organization: string): Promise<string> {
  const rulesetId = await getOrCreateRuleset(organization);

  const existing = await db
    .select()
    .from(tournaments)
    .where(and(eq(tournaments.year, year), eq(tournaments.organization, organization)))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [newTournament] = await db
    .insert(tournaments)
    .values({
      name: `${organization} ${year}`,
      organization,
      year,
      rulesetId,
      edition: 'World Championships',
    })
    .returning();

  return newTournament.id;
}

async function getOrCreateWeightClass(
  tournamentId: string,
  weightClassName: string,
  gender: string
): Promise<string> {
  const existing = await db
    .select()
    .from(weightClasses)
    .where(
      and(eq(weightClasses.tournamentId, tournamentId), eq(weightClasses.name, weightClassName))
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  // Parse weight class (e.g., "-77KG", "+99KG", "60KG")
  const maxWeight = weightClassName.includes('+')
    ? null
    : parseInt(weightClassName.replace(/[^0-9]/g, ''));

  const [newWeightClass] = await db
    .insert(weightClasses)
    .values({
      tournamentId,
      name: weightClassName,
      maxWeightKg: maxWeight || undefined,
      gender: gender === 'F' ? 'female' : 'male',
      division: 'adult',
    })
    .returning();

  return newWeightClass.id;
}

async function ingestADCCCSV(filePath: string) {
  console.log(`📁 Reading CSV file: ${filePath}`);

  const fileContent = readFileSync(filePath, 'utf-8');
  const records: ADCCMatchRow[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ';',
  });

  console.log(`📊 Found ${records.length} match records`);

  let processed = 0;
  let errors = 0;

  for (const record of records) {
    try {
      // Skip invalid records
      if (
        !record.year ||
        record.year === '-1' ||
        !record.winner_name ||
        record.winner_name === 'N/A'
      ) {
        continue;
      }

      const year = parseInt(record.year);
      const organization = 'ADCC';

      // Get or create entities
      const tournamentId = await getOrCreateTournament(year, organization);
      const weightClassId = await getOrCreateWeightClass(
        tournamentId,
        record.weight_class,
        record.sex
      );

      const athlete1Id = await getOrCreateAthlete(record.winner_id, record.winner_name);
      const athlete2Id = await getOrCreateAthlete(record.loser_id, record.loser_name);

      // Determine result type
      let result: string;
      let submissionType: string | null = null;
      let submissionCategory: string | null = null;

      if (record.win_type === 'SUBMISSION' && record.submission !== 'N/A') {
        result = 'submission';
        submissionType = record.submission;
        submissionCategory = getSubmissionCategory(record.submission);
      } else if (record.win_type === 'POINTS') {
        result = 'points';
      } else if (record.win_type === 'DECISION') {
        result = 'decision';
      } else if (record.win_type === 'DESQUALIFICATION') {
        result = 'dq';
      } else {
        result = 'decision';
      }

      // Insert match
      await db.insert(matches).values({
        tournamentId,
        weightClassId,
        athlete1Id,
        athlete2Id,
        winnerId: athlete1Id,
        result,
        submissionType,
        submissionCategory,
        athlete1FinalScore: parseInt(record.winner_points) || 0,
        athlete2FinalScore: parseInt(record.loser_points) || 0,
        athlete1Advantages: record.adv_pen === 'ADV' ? 1 : 0,
        athlete2Advantages: 0,
        round: record.stage || undefined,
      });

      processed++;

      if (processed % 100 === 0) {
        console.log(`✓ Processed ${processed} matches...`);
      }
    } catch (error) {
      errors++;
      console.error(`❌ Error processing record:`, error);
    }
  }

  console.log(`\n✅ Ingestion complete!`);
  console.log(`   Processed: ${processed}`);
  console.log(`   Errors: ${errors}`);
}

// CLI entry point
const args = process.argv.slice(2);
const filePath = args[0];

if (!filePath) {
  console.error('Usage: pnpm ingest:csv <path-to-csv>');
  console.error('Example: pnpm ingest:csv ./data/adcc_historical_data.csv');
  process.exit(1);
}

ingestADCCCSV(filePath)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
