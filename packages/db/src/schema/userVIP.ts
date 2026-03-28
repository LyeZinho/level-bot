import {
  pgTable,
  serial,
  varchar,
  integer,
  real,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { vipTiers } from './vipTiers';

export const userVIP = pgTable(
  'user_vip',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 20 }).notNull(),
    guildId: varchar('guild_id', { length: 20 }).notNull(),
    tierId: integer('tier_id').notNull(),
    // Denormalized from tier for fast queries
    tier: varchar('tier', { length: 32 }).notNull(),
    multiplier: real('multiplier').notNull().default(1),
    active: boolean('active').notNull().default(true),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('user_vip_user_guild_idx').on(table.userId, table.guildId),
    index('user_vip_user_id_idx').on(table.userId),
    index('user_vip_tier_id_idx').on(table.tierId),
    index('user_vip_active_idx').on(table.active),
  ],
);

export const userVIPRelations = relations(userVIP, ({ one }) => ({
  user: one(users, {
    fields: [userVIP.userId, userVIP.guildId],
    references: [users.discordId, users.guildId],
  }),
  vipTier: one(vipTiers, {
    fields: [userVIP.tierId],
    references: [vipTiers.id],
  }),
}));
