import { doublePrecision, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { classes } from './classes';

export const bookingStatusEnum = pgEnum('booking_status', [
  'confirmed',
  'pending',
  'cancelled',
  'completed',
  'no_show',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'paid',
  'pending',
  'refunded',
  'free',
]);

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  classId: uuid('class_id')
    .notNull()
    .references(() => classes.id, { onDelete: 'cascade' }),

  // Booking details
  bookingDate: timestamp('booking_date', { withTimezone: true }).notNull(), // the actual date of the class
  bookingStatus: bookingStatusEnum('booking_status').notNull().default('confirmed'),

  // Payment
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
  amountPaid: doublePrecision('amount_paid').notNull().default(0),
  stripePaymentIntentId: text('stripe_payment_intent_id'),

  // Check-in
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }),

  // Notes
  userNotes: text('user_notes'),
  adminNotes: text('admin_notes'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
