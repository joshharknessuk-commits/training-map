import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email'),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type InsertFeedback = typeof feedback.$inferInsert;
export type Feedback = typeof feedback.$inferSelect;
