import { pgTable, serial, varchar, bigint, timestamp, uniqueIndex, index, foreignKey } from 'drizzle-orm/pg-core';
import { badges } from './badges';

export const userBadges = pgTable(
  'user_badges',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 20 }).notNull(),
    guildId: varchar('guild_id', { length: 20 }).notNull(),
    badgeId: bigint('badge_id', { mode: 'number' }).notNull(),
    earnedAt: timestamp('earned_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at'),
  },
  (table) => ({
    fkBadgeId: foreignKey({
      columns: [table.badgeId],
      foreignColumns: [badges.badgeId],
    }),
    uniqueUserBadge: uniqueIndex('unique_user_badge').on(table.userId, table.guildId, table.badgeId),
    idxUserId: index('idx_user_badges_user_id').on(table.userId),
  }),
);
