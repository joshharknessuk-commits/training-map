import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { athletes } from './athletes';
import { tournaments, weightClasses } from './tournaments';

export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  tournamentId: uuid('tournament_id').notNull().references(() => tournaments.id),
  weightClassId: uuid('weight_class_id').notNull().references(() => weightClasses.id),

  athlete1Id: uuid('athlete1_id').notNull().references(() => athletes.id),
  athlete2Id: uuid('athlete2_id').notNull().references(() => athletes.id),

  winnerId: uuid('winner_id').references(() => athletes.id),

  // Match outcome
  result: text('result').notNull(), // "submission", "points", "decision", "advantage", "dq", "draw"
  submissionType: text('submission_type'), // e.g., "rear_naked_choke", "armbar", "heel_hook"
  submissionCategory: text('submission_category'), // "choke", "joint_lock", "leg_lock"

  // Scores
  athlete1FinalScore: integer('athlete1_final_score').default(0),
  athlete2FinalScore: integer('athlete2_final_score').default(0),
  athlete1Advantages: integer('athlete1_advantages').default(0),
  athlete2Advantages: integer('athlete2_advantages').default(0),
  athlete1Penalties: integer('athlete1_penalties').default(0),
  athlete2Penalties: integer('athlete2_penalties').default(0),

  // Timing
  durationSeconds: integer('duration_seconds'),
  round: text('round'), // "R1", "QF", "SF", "F", "3rd"
  matchNumber: integer('match_number'),
  matchDate: timestamp('match_date', { withTimezone: true }),

  // Metadata
  videoUrl: text('video_url'),
  notes: text('notes'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;
