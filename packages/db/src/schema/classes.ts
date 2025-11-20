import {
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { gyms } from './gyms';

export const classTypeEnum = pgEnum('class_type', [
  'gi',
  'nogi',
  'open_mat',
  'competition_training',
  'fundamentals',
  'advanced',
  'beginners',
  'all_levels',
  'drilling',
  'sparring',
  'women_only',
  'kids',
]);

export const classStatusEnum = pgEnum('class_status', [
  'scheduled',
  'ongoing',
  'completed',
  'cancelled',
]);

export const dayOfWeekEnum = pgEnum('day_of_week', [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);

export const classes = pgTable('classes', {
  id: uuid('id').primaryKey().defaultRandom(),
  gymId: uuid('gym_id')
    .notNull()
    .references(() => gyms.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  instructorName: text('instructor_name'),
  classType: classTypeEnum('class_type').notNull(),

  // Scheduling
  dayOfWeek: dayOfWeekEnum('day_of_week'), // for recurring classes
  startTime: text('start_time').notNull(), // HH:MM format
  endTime: text('end_time').notNull(), // HH:MM format
  specificDate: timestamp('specific_date', { withTimezone: true }), // for one-off classes

  // Capacity & Pricing
  capacity: integer('capacity').notNull(),
  currentBookings: integer('current_bookings').notNull().default(0),
  pricePerSession: doublePrecision('price_per_session').notNull(), // in GBP
  isFreeForMembers: integer('is_free_for_members').notNull().default(0), // 1 = free for network members

  // Status & Visibility
  status: classStatusEnum('status').notNull().default('scheduled'),
  isRecurring: integer('is_recurring').notNull().default(1), // 1 = recurring, 0 = one-off
  isActive: integer('is_active').notNull().default(1), // 1 = active, 0 = inactive

  // Requirements
  minBeltRank: text('min_belt_rank'), // minimum belt rank required
  maxCapacity: integer('max_capacity'), // absolute max capacity

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Class = typeof classes.$inferSelect;
export type InsertClass = typeof classes.$inferInsert;
