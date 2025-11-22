#!/usr/bin/env node
import 'dotenv/config';
import { db, athletes, teams, tournaments, rulesets, weightClasses, matches, techniques, techniqueCategories } from '@grapplemap/db';
import { normalizeName, getSubmissionCategory } from '../utils/normalize';

/**
 * Seed sample tournament data for testing and demonstration
 */
async function seedSampleData() {
  console.log('🌱 Seeding sample tournament data...');

  try {
    // Create rulesets
    console.log('Creating rulesets...');
    const [adccRuleset] = await db
      .insert(rulesets)
      .values({
        name: 'ADCC',
        organization: 'ADCC',
        description: 'Abu Dhabi Combat Club submission wrestling rules',
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

    const [ibjjfRuleset] = await db
      .insert(rulesets)
      .values({
        name: 'IBJJF',
        organization: 'IBJJF',
        description: 'International Brazilian Jiu-Jitsu Federation rules',
        pointsForTakedown: 2,
        pointsForSweep: 2,
        pointsForPass: 3,
        pointsForMount: 4,
        pointsForBack: 4,
        hasOvertimeRules: 0,
        matchDurationMinutes: 10,
        submissionOnly: 0,
        gi: 1,
      })
      .returning();

    console.log(`✓ Created ${2} rulesets`);

    // Create teams
    console.log('Creating teams...');
    const teamsData = [
      { name: 'Atos Jiu-Jitsu', country: 'USA', city: 'San Diego' },
      { name: 'Alliance', country: 'Brazil', city: 'São Paulo' },
      { name: 'Checkmat', country: 'Brazil', city: 'Rio de Janeiro' },
      { name: 'Gracie Barra', country: 'Brazil', city: 'Rio de Janeiro' },
      { name: 'New Wave Jiu-Jitsu', country: 'USA', city: 'Austin' },
    ];

    const insertedTeams = await db
      .insert(teams)
      .values(
        teamsData.map((team) => ({
          name: team.name,
          normalizedName: normalizeName(team.name),
          country: team.country,
          city: team.city,
        }))
      )
      .returning();

    console.log(`✓ Created ${insertedTeams.length} teams`);

    // Create athletes
    console.log('Creating athletes...');
    const athletesData = [
      { name: 'Gordon Ryan', nationality: 'USA', countryCode: 'US', teamId: insertedTeams[4].id },
      { name: 'Marcus Almeida', nationality: 'Brazil', countryCode: 'BR', teamId: insertedTeams[0].id },
      { name: 'Felipe Pena', nationality: 'Brazil', countryCode: 'BR', teamId: insertedTeams[3].id },
      { name: 'Nicholas Meregali', nationality: 'Brazil', countryCode: 'BR', teamId: insertedTeams[1].id },
      { name: 'Tainan Dalpra', nationality: 'Brazil', countryCode: 'BR', teamId: insertedTeams[0].id },
    ];

    const insertedAthletes = await db
      .insert(athletes)
      .values(
        athletesData.map((athlete) => ({
          name: athlete.name,
          normalizedName: normalizeName(athlete.name),
          nationality: athlete.nationality,
          countryCode: athlete.countryCode,
          currentTeamId: athlete.teamId,
        }))
      )
      .returning();

    console.log(`✓ Created ${insertedAthletes.length} athletes`);

    // Create tournaments
    console.log('Creating tournaments...');
    const [adcc2022] = await db
      .insert(tournaments)
      .values({
        name: 'ADCC 2022',
        organization: 'ADCC',
        year: 2022,
        location: 'Las Vegas, Nevada',
        country: 'USA',
        countryCode: 'US',
        rulesetId: adccRuleset.id,
        edition: 'World Championships',
      })
      .returning();

    const [worlds2023] = await db
      .insert(tournaments)
      .values({
        name: 'IBJJF Worlds 2023',
        organization: 'IBJJF',
        year: 2023,
        location: 'Long Beach, California',
        country: 'USA',
        countryCode: 'US',
        rulesetId: ibjjfRuleset.id,
        edition: 'World Championships',
      })
      .returning();

    console.log(`✓ Created 2 tournaments`);

    // Create weight classes
    console.log('Creating weight classes...');
    const [adcc99kg] = await db
      .insert(weightClasses)
      .values({
        tournamentId: adcc2022.id,
        name: '-99kg',
        maxWeightKg: 99,
        gender: 'male',
        division: 'adult',
      })
      .returning();

    const [ibjjfHeavy] = await db
      .insert(weightClasses)
      .values({
        tournamentId: worlds2023.id,
        name: 'Heavy',
        minWeightKg: 94,
        maxWeightKg: 100,
        gender: 'male',
        division: 'adult',
        beltLevel: 'black',
      })
      .returning();

    console.log(`✓ Created 2 weight classes`);

    // Create technique categories
    console.log('Creating technique categories...');
    const [submissionCat] = await db
      .insert(techniqueCategories)
      .values({
        name: 'Submission',
        description: 'Submission techniques',
      })
      .returning();

    // Create techniques
    console.log('Creating techniques...');
    const techniquesData = [
      { name: 'Rear Naked Choke', category: 'Submission', tags: ['choke', 'back'] },
      { name: 'Heel Hook', category: 'Submission', tags: ['leg_lock', 'lower_body'] },
      { name: 'Arm Bar', category: 'Submission', tags: ['arm_lock', 'upper_body'] },
    ];

    const insertedTechniques = await db
      .insert(techniques)
      .values(
        techniquesData.map((tech) => ({
          name: tech.name,
          normalizedName: normalizeName(tech.name),
          categoryId: submissionCat.id,
          tags: tech.tags,
        }))
      )
      .returning();

    console.log(`✓ Created ${insertedTechniques.length} techniques`);

    // Create sample matches
    console.log('Creating sample matches...');
    const matchesData = [
      {
        tournamentId: adcc2022.id,
        weightClassId: adcc99kg.id,
        athlete1Id: insertedAthletes[0].id,
        athlete2Id: insertedAthletes[1].id,
        winnerId: insertedAthletes[0].id,
        result: 'submission',
        submissionType: 'Rear Naked Choke',
        submissionCategory: 'choke',
        athlete1FinalScore: 0,
        athlete2FinalScore: 0,
        durationSeconds: 420,
        round: 'F',
      },
      {
        tournamentId: worlds2023.id,
        weightClassId: ibjjfHeavy.id,
        athlete1Id: insertedAthletes[2].id,
        athlete2Id: insertedAthletes[3].id,
        winnerId: insertedAthletes[2].id,
        result: 'points',
        athlete1FinalScore: 7,
        athlete2FinalScore: 2,
        durationSeconds: 600,
        round: 'F',
      },
    ];

    const insertedMatches = await db.insert(matches).values(matchesData).returning();

    console.log(`✓ Created ${insertedMatches.length} matches`);

    console.log('\n✅ Sample data seeded successfully!');
    console.log('\nSummary:');
    console.log(`  - 2 rulesets`);
    console.log(`  - ${insertedTeams.length} teams`);
    console.log(`  - ${insertedAthletes.length} athletes`);
    console.log(`  - 2 tournaments`);
    console.log(`  - 2 weight classes`);
    console.log(`  - ${insertedTechniques.length} techniques`);
    console.log(`  - ${insertedMatches.length} matches`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedSampleData();
