import { pgTable, text, timestamp, uuid, integer, jsonb } from 'drizzle-orm/pg-core';

export const rulesets = pgTable('rulesets', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // e.g., "ADCC", "IBJJF", "EBI", "Polaris"
  organization: text('organization').notNull(),
  description: text('description'),
  pointsForTakedown: integer('points_for_takedown'),
  pointsForSweep: integer('points_for_sweep'),
  pointsForPass: integer('points_for_pass'),
  pointsForMount: integer('points_for_mount'),
  pointsForBack: integer('points_for_back'),
  hasOvertimeRules: integer('has_overtime_rules').default(0), // 1 = yes, 0 = no
  overtimeRulesDescription: text('overtime_rules_description'),
  matchDurationMinutes: integer('match_duration_minutes'),
  submissionOnly: integer('submission_only').default(0), // 1 = yes, 0 = no
  gi: integer('gi').default(1), // 1 = gi, 0 = no-gi
  otherRules: jsonb('other_rules').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const tournaments = pgTable('tournaments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  organization: text('organization').notNull(), // ADCC, IBJJF, AJP, etc.
  year: integer('year').notNull(),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  location: text('location'),
  country: text('country'),
  countryCode: text('country_code'),
  rulesetId: uuid('ruleset_id').references(() => rulesets.id),
  edition: text('edition'), // e.g., "World Championships", "Pan-Ams", "European Open"
  website: text('website'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const weightClasses = pgTable('weight_classes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tournamentId: uuid('tournament_id').notNull().references(() => tournaments.id),
  name: text('name').notNull(), // e.g., "66kg", "Light Feather", "-77kg"
  minWeightKg: integer('min_weight_kg'),
  maxWeightKg: integer('max_weight_kg'),
  gender: text('gender').notNull(), // "male", "female", "open"
  division: text('division'), // "adult", "master", "juvenile", etc.
  beltLevel: text('belt_level'), // "black", "brown", "purple", etc. (null for no-gi)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type Ruleset = typeof rulesets.$inferSelect;
export type InsertRuleset = typeof rulesets.$inferInsert;
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = typeof tournaments.$inferInsert;
export type WeightClass = typeof weightClasses.$inferSelect;
export type InsertWeightClass = typeof weightClasses.$inferInsert;
