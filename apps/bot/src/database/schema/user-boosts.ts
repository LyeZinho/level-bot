import { pgTable, varchar, timestamp, numeric, index, primaryKey } from 'drizzle-orm/pg-core';

export const userBoosts = pgTable(
  'user_boosts',
  {
    userId: varchar('user_id', { length: 20 }).notNull(),
    guildId: varchar('guild_id', { length: 20 }).notNull(),
    boostType: varchar('boost_type', { length: 50 }).notNull(),
    multiplier: numeric('multiplier', { precision: 5, scale: 2 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.guildId, table.boostType] }),
    idxExpiresAt: index('idx_user_boosts_expires_at').on(table.expiresAt),
  }),
);
