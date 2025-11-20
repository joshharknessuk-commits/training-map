import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const rateLimits = pgTable(
  'rate_limits',
  {
    key: text('key').primaryKey(), // IP address or other identifier
    count: integer('count').notNull().default(1),
    firstRequest: timestamp('first_request', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (table) => [index('rate_limits_expires_at_idx').on(table.expiresAt)],
);

export type RateLimit = typeof rateLimits.$inferSelect;
export type InsertRateLimit = typeof rateLimits.$inferInsert;
