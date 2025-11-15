import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { openMats } from './open-mats';
import { users } from './users';

export const checkIns = pgTable('check_ins', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  openMatId: uuid('open_mat_id')
    .notNull()
    .references(() => openMats.id, { onDelete: 'cascade' }),
  qrSlug: text('qr_slug').notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = typeof checkIns.$inferInsert;
