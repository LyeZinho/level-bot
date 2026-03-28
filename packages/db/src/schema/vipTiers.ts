import {
  pgTable,
  serial,
  varchar,
  integer,
  real,
  json,
  timestamp,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userVIP } from './userVIP';

export const vipTierKeyEnum = pgEnum('vip_tier_key', [
  'gold',
  'platinum',
  'ruby',
]);

export const vipTiers = pgTable(
  'vip_tiers',
  {
    id: serial('id').primaryKey(),
    tierKey: vipTierKeyEnum('tier_key').notNull(),
    name: varchar('name', { length: 64 }).notNull(),
    multiplier: real('multiplier').notNull().default(1),
    roleId: varchar('role_id', { length: 20 }).notNull().default(''),
    price: integer('price').notNull(),
    durationDays: integer('duration_days').notNull().default(30),
    benefits: json('benefits').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('vip_tiers_tier_key_idx').on(table.tierKey),
  ],
);

export const vipTiersRelations = relations(vipTiers, ({ many }) => ({
  subscribers: many(userVIP),
}));
