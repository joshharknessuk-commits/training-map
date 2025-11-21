import { pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { gyms } from './gyms';

export const gymRoleEnum = pgEnum('gym_role', ['owner', 'manager', 'instructor', 'staff']);

export const gymAdmins = pgTable('gym_admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  gymId: uuid('gym_id')
    .notNull()
    .references(() => gyms.id, { onDelete: 'cascade' }),
  role: gymRoleEnum('role').notNull().default('staff'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type GymAdmin = typeof gymAdmins.$inferSelect;
export type InsertGymAdmin = typeof gymAdmins.$inferInsert;
