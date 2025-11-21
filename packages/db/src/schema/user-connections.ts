import { pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const connectionStatusEnum = pgEnum('connection_status', [
  'pending',
  'accepted',
  'blocked',
]);

export const userConnections = pgTable('user_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  followerId: uuid('follower_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  followingId: uuid('following_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: connectionStatusEnum('status').notNull().default('accepted'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type UserConnection = typeof userConnections.$inferSelect;
export type InsertUserConnection = typeof userConnections.$inferInsert;
