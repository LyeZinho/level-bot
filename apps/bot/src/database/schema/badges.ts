import { pgTable, serial, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';

export const badges = pgTable(
  'badges',
  {
    badgeId: serial('badge_id').primaryKey(),
    name: varchar('name', { length: 255 }).unique().notNull(),
    imagePath: varchar('image_path', { length: 255 }),
    badgeType: varchar('badge_type', { length: 50 }).notNull(),
    tier: varchar('tier', { length: 50 }),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    idxBadgeType: index('idx_badges_badge_type').on(table.badgeType),
    idxTier: index('idx_badges_tier').on(table.tier),
  }),
);
