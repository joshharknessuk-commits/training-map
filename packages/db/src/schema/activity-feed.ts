import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { gyms } from './gyms';
import { classes } from './classes';
import { bookings } from './bookings';

export const activityTypeEnum = pgEnum('activity_type', [
  'booking_created',
  'class_attended',
  'gym_visited',
  'belt_promotion',
  'connection_made',
  'achievement_unlocked',
  'review_posted',
]);

export const activityFeed = pgTable('activity_feed', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  activityType: activityTypeEnum('activity_type').notNull(),

  // Related entities (nullable as not all activities involve all entities)
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),
  classId: uuid('class_id').references(() => classes.id, { onDelete: 'cascade' }),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'cascade' }),

  // Activity content
  title: text('title').notNull(),
  description: text('description'),
  metadata: text('metadata'), // JSON string for additional data

  // Visibility
  isPublic: integer('is_public').notNull().default(1), // 1 = public, 0 = connections only

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type ActivityFeed = typeof activityFeed.$inferSelect;
export type InsertActivityFeed = typeof activityFeed.$inferInsert;
