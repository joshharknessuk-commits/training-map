import { integer, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { gyms } from './gyms';

export const payoutStatusEnum = pgEnum('payout_status', ['pending', 'processing', 'paid', 'failed']);

export const gymPayouts = pgTable('gym_payouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  gymId: uuid('gym_id')
    .notNull()
    .references(() => gyms.id, { onDelete: 'cascade' }),
  amountCents: integer('amount_cents').notNull(),
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
  status: payoutStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
});

export type GymPayout = typeof gymPayouts.$inferSelect;
export type InsertGymPayout = typeof gymPayouts.$inferInsert;
