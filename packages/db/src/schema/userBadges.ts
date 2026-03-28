import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { badges } from './badges';

export const userBadges = pgTable(
  'user_badges',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 20 }).notNull(),
    guildId: varchar('guild_id', { length: 20 }).notNull(),
    badgeId: integer('badge_id').notNull(),
    earnedAt: timestamp('earned_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('user_badges_user_guild_badge_idx').on(
      table.userId,
      table.guildId,
      table.badgeId,
    ),
    index('user_badges_user_id_idx').on(table.userId),
    index('user_badges_badge_id_idx').on(table.badgeId),
  ],
);

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId, userBadges.guildId],
    references: [users.discordId, users.guildId],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));
