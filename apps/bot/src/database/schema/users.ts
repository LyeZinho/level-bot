import { pgTable, varchar, bigint, text, numeric, timestamp, serial, uniqueIndex, index, primaryKey } from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    userId: varchar('user_id', { length: 20 }).notNull(),
    guildId: varchar('guild_id', { length: 20 }).notNull(),
    xp: numeric('xp', { precision: 20, scale: 0 }).default('0').notNull(),
    level: bigint('level', { mode: 'number' }).default(0).notNull(),
    messages: bigint('messages', { mode: 'number' }).default(0).notNull(),
    voiceTime: bigint('voice_time', { mode: 'number' }).default(0).notNull(),
    coins: numeric('coins', { precision: 20, scale: 0 }).default('0').notNull(),
    lastDailyClaimAt: timestamp('last_daily_claim_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.guildId] }),
    idxGuildId: index('idx_users_guild_id').on(table.guildId),
    idxLevel: index('idx_users_level').on(table.level),
  }),
);
