import {
  pgTable,
  serial,
  varchar,
  integer,
  bigint,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userMissions } from './userMissions';
import { userInventory } from './userInventory';
import { userBadges } from './userBadges';
import { userVIP } from './userVIP';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    discordId: varchar('discord_id', { length: 20 }).notNull(),
    guildId: varchar('guild_id', { length: 20 }).notNull(),
    username: varchar('username', { length: 64 }),
    avatar: varchar('avatar', { length: 128 }),
    xp: bigint('xp', { mode: 'number' }).notNull().default(0),
    level: integer('level').notNull().default(0),
    coins: bigint('coins', { mode: 'number' }).notNull().default(0),
    messages: bigint('messages', { mode: 'number' }).notNull().default(0),
    voiceTime: bigint('voice_time', { mode: 'number' }).notNull().default(0),
    lastDailyClaimAt: timestamp('last_daily_claim_at', { withTimezone: true }),
    lastActivityAt: timestamp('last_activity_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('users_discord_guild_idx').on(table.discordId, table.guildId),
    index('users_discord_id_idx').on(table.discordId),
    index('users_username_idx').on(table.username),
    index('users_guild_id_idx').on(table.guildId),
    index('users_level_idx').on(table.level),
    index('users_xp_idx').on(table.xp),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  missions: many(userMissions),
  inventory: many(userInventory),
  badges: many(userBadges),
  vip: many(userVIP),
}));
