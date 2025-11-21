import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const membershipStatusEnum = pgEnum('membership_status', [
  'active',
  'grace',
  'paused',
  'past_due',
  'canceled',
]);

export const membershipTierEnum = pgEnum('membership_tier', ['standard', 'pro', 'academy']);

export const userRoleEnum = pgEnum('user_role', ['user', 'gym_admin', 'super_admin']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'), // hashed password
  firstName: text('first_name'),
  lastName: text('last_name'),
  role: userRoleEnum('role').notNull().default('user'),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  stripeCustomerId: text('stripe_customer_id'),
  membershipStatus: membershipStatusEnum('membership_status').notNull().default('grace'),
  membershipTier: membershipTierEnum('membership_tier').notNull().default('standard'),
  activeUntil: timestamp('active_until', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
