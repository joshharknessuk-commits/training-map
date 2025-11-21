import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { gyms } from './gyms';

export const gymProfiles = pgTable('gym_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  gymId: uuid('gym_id')
    .notNull()
    .references(() => gyms.id, { onDelete: 'cascade' })
    .unique(),

  // Extended gym information
  description: text('description'),
  facilities: text('facilities').array(), // e.g., ['showers', 'changing rooms', 'parking']
  amenities: text('amenities').array(), // e.g., ['mats', 'weights', 'bags']
  logoUrl: text('logo_url'),
  coverImageUrl: text('cover_image_url'),
  galleryImages: text('gallery_images').array(),

  // Contact & Social
  phone: text('phone'),
  email: text('email'),
  instagramHandle: text('instagram_handle'),
  facebookUrl: text('facebook_url'),

  // Pricing & Membership
  dropInPrice: integer('drop_in_price'), // in pence
  monthlyMembershipPrice: integer('monthly_membership_price'), // in pence
  hasFreeTrial: integer('has_free_trial').notNull().default(0),

  // Policies
  requiresGiForGiClass: integer('requires_gi_for_gi_class').notNull().default(1),
  allowsDropIns: integer('allows_drop_ins').notNull().default(1),
  covidPolicies: text('covid_policies'),

  // Stats
  totalMembers: integer('total_members').default(0),
  avgClassSize: integer('avg_class_size').default(0),

  // Verified status
  isVerified: integer('is_verified').notNull().default(0),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type GymProfile = typeof gymProfiles.$inferSelect;
export type InsertGymProfile = typeof gymProfiles.$inferInsert;
