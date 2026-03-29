import { pgTable, serial, varchar, text, timestamp, integer, boolean, index } from 'drizzle-orm/pg-core';

export const badges = pgTable(
  'badges',
  {
    badgeId: serial('badge_id').primaryKey(),
    name: varchar('name', { length: 100 }).unique().notNull(),
    description: text('description'),
    imagePath: varchar('image_path', { length: 255 }).notNull(),
    badgeType: varchar('badge_type', { length: 50 }).notNull(),
    tier: integer('tier').default(1).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    idxBadgeType: index('idx_badges_badge_type').on(table.badgeType),
    idxTier: index('idx_badges_tier').on(table.tier),
  }),
);
