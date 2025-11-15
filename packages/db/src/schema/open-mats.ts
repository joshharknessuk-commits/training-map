import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { gyms } from './gyms';

export const openMatStatusEnum = pgEnum('open_mat_status', ['scheduled', 'live', 'complete', 'canceled']);

export const openMats = pgTable('open_mats', {
  id: uuid('id').primaryKey().defaultRandom(),
  gymId: uuid('gym_id')
    .notNull()
    .references(() => gyms.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: openMatStatusEnum('status').notNull().default('scheduled'),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  capacity: integer('capacity'),
  qrSlug: text('qr_slug').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type OpenMat = typeof openMats.$inferSelect;
export type InsertOpenMat = typeof openMats.$inferInsert;
