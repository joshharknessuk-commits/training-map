import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { gyms } from './gyms';

export const gymClaims = pgTable(
  'gym_claims',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gymId: uuid('gym_id')
      .notNull()
      .references(() => gyms.id, { onDelete: 'cascade' }),
    claimantName: text('claimant_name').notNull(),
    claimantEmail: text('claimant_email').notNull(),
    proofUrl: text('proof_url'),
    message: text('message'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('gym_claims_gym_id_idx').on(table.gymId),
    index('gym_claims_claimant_email_idx').on(table.claimantEmail),
  ],
);

export type GymClaim = typeof gymClaims.$inferSelect;
export type InsertGymClaim = typeof gymClaims.$inferInsert;
