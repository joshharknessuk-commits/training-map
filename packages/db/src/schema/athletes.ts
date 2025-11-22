import { pgTable, text, timestamp, uuid, integer, doublePrecision } from 'drizzle-orm/pg-core';

export const athletes = pgTable('athletes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  normalizedName: text('normalized_name').notNull(), // For deduplication
  nationality: text('nationality'),
  countryCode: text('country_code'), // ISO 3166-1 alpha-2
  birthYear: integer('birth_year'),
  heightCm: integer('height_cm'),
  currentTeamId: uuid('current_team_id').references(() => teams.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  normalizedName: text('normalized_name').notNull(), // For deduplication
  country: text('country'),
  city: text('city'),
  lat: doublePrecision('lat'),
  lon: doublePrecision('lon'),
  website: text('website'),
  foundedYear: integer('founded_year'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const athleteTeamHistory = pgTable('athlete_team_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  athleteId: uuid('athlete_id').notNull().references(() => athletes.id),
  teamId: uuid('team_id').notNull().references(() => teams.id),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  isPrimary: integer('is_primary').notNull().default(1), // 1 = primary, 0 = affiliate
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type Athlete = typeof athletes.$inferSelect;
export type InsertAthlete = typeof athletes.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;
export type AthleteTeamHistory = typeof athleteTeamHistory.$inferSelect;
export type InsertAthleteTeamHistory = typeof athleteTeamHistory.$inferInsert;
