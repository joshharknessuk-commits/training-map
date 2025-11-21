import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const beltRankEnum = pgEnum('belt_rank', [
  'white',
  'blue',
  'purple',
  'brown',
  'black',
  'coral',
  'red',
]);

export const weightClassEnum = pgEnum('weight_class', [
  'rooster',
  'light_feather',
  'feather',
  'light',
  'middle',
  'medium_heavy',
  'heavy',
  'super_heavy',
  'ultra_heavy',
]);

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  displayName: text('display_name'),
  bio: text('bio'),
  beltRank: beltRankEnum('belt_rank'),
  stripes: integer('stripes').default(0), // 0-4 stripes
  weightKg: integer('weight_kg'),
  weightClass: weightClassEnum('weight_class'),
  yearsTraining: integer('years_training'),
  homeGymId: uuid('home_gym_id'), // reference to gyms table but not enforced FK for flexibility
  avatarUrl: text('avatar_url'),
  instagramHandle: text('instagram_handle'),
  preferredTrainingTimes: text('preferred_training_times').array(), // e.g., ['morning', 'evening']
  trainingGoals: text('training_goals').array(), // e.g., ['competition', 'fitness', 'self-defense']
  isPublic: integer('is_public').notNull().default(1), // 1 = public, 0 = private
  city: text('city').default('London'),
  postcode: text('postcode'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
