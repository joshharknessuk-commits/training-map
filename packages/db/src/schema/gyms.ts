import { doublePrecision, index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const gyms = pgTable(
  'gyms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    lat: doublePrecision('lat').notNull(),
    lon: doublePrecision('lon').notNull(),
    borough: text('borough'),
    website: text('website'),
    extraWebsites: text('extra_websites').array(),
    osmUrl: text('osm_url'),
    nearestTransport: text('nearest_transport'),
    tags: jsonb('tags').$type<Record<string, string | number | boolean | null> | null>(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('gyms_borough_idx').on(table.borough),
    index('gyms_lat_lon_idx').on(table.lat, table.lon),
  ],
);

export type Gym = typeof gyms.$inferSelect;
export type InsertGym = typeof gyms.$inferInsert;
