import { pgTable, varchar, bigint, numeric, timestamp, boolean, uniqueIndex, index, primaryKey } from 'drizzle-orm/pg-core';

export const userVips = pgTable(
  'user_vips',
  {
    userId: varchar('user_id', { length: 20 }).notNull(),
    guildId: varchar('guild_id', { length: 20 }).notNull(),
    tier: varchar('tier', { length: 50 }).notNull(),
    multiplier: bigint('multiplier', { mode: 'number' }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    active: boolean('active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.guildId, table.tier] }),
    uniqueUserVip: uniqueIndex('unique_user_vip').on(table.userId, table.guildId),
    idxActive: index('idx_user_vips_active').on(table.active),
    idxExpiresAt: index('idx_user_vips_expires_at').on(table.expiresAt),
  }),
);
