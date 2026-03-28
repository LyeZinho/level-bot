import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userBadges } from './userBadges';

export const badgeTypeEnum = pgEnum('badge_type', [
  'mission',
  'seasonal',
  'special',
  'level',
  'achievement',
]);

export const badgeTierEnum = pgEnum('badge_tier', [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
]);

export const badges = pgTable(
  'badges',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 128 }).notNull(),
    imagePath: text('image_path'),
    badgeType: badgeTypeEnum('badge_type').notNull(),
    tier: badgeTierEnum('tier'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('badges_name_idx').on(table.name),
  ],
);

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));
