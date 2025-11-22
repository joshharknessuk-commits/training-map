import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { matches } from './matches';
import { athletes } from './athletes';

export const techniqueCategories = pgTable('technique_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // "Submission", "Takedown", "Pass", "Sweep", etc.
  parentCategoryId: uuid('parent_category_id'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const techniques = pgTable('techniques', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // "Rear Naked Choke", "Double Leg", "Toreando Pass"
  normalizedName: text('normalized_name').notNull(),
  categoryId: uuid('category_id').notNull().references(() => techniqueCategories.id),
  aliases: text('aliases').array(), // Alternative names
  description: text('description'),
  tags: text('tags').array(), // ["guard", "top"], ["gi"], ["no-gi"]
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const matchEvents = pgTable('match_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id').notNull().references(() => matches.id),
  athleteId: uuid('athlete_id').notNull().references(() => athletes.id),
  techniqueId: uuid('technique_id').references(() => techniques.id),

  eventType: text('event_type').notNull(), // "submission", "points", "advantage", "penalty", "position"
  eventTimestamp: integer('event_timestamp'), // Seconds into match

  pointsAwarded: integer('points_awarded').default(0),
  advantagesAwarded: integer('advantages_awarded').default(0),
  penaltiesAwarded: integer('penalties_awarded').default(0),

  position: text('position'), // "mount", "back", "guard", "top", "bottom", etc.
  description: text('description'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type TechniqueCategory = typeof techniqueCategories.$inferSelect;
export type InsertTechniqueCategory = typeof techniqueCategories.$inferInsert;
export type Technique = typeof techniques.$inferSelect;
export type InsertTechnique = typeof techniques.$inferInsert;
export type MatchEvent = typeof matchEvents.$inferSelect;
export type InsertMatchEvent = typeof matchEvents.$inferInsert;
