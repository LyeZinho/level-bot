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
import { shopItems } from './shopItems';

export const userInventory = pgTable(
  'user_inventory',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 20 }).notNull(),
    guildId: varchar('guild_id', { length: 20 }).notNull(),
    itemId: integer('item_id').notNull(),
    quantity: integer('quantity').notNull().default(1),
    acquiredAt: timestamp('acquired_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('user_inventory_user_guild_item_idx').on(
      table.userId,
      table.guildId,
      table.itemId,
    ),
    index('user_inventory_user_id_idx').on(table.userId),
    index('user_inventory_item_id_idx').on(table.itemId),
  ],
);

export const userInventoryRelations = relations(userInventory, ({ one }) => ({
  user: one(users, {
    fields: [userInventory.userId, userInventory.guildId],
    references: [users.discordId, users.guildId],
  }),
  item: one(shopItems, {
    fields: [userInventory.itemId],
    references: [shopItems.id],
  }),
}));
