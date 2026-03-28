import { pgTable, serial, varchar, bigint, numeric, timestamp, uniqueIndex, index, foreignKey } from 'drizzle-orm/pg-core';
import { items } from './items';

export const userInventory = pgTable(
  'user_inventory',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 20 }).notNull(),
    guildId: varchar('guild_id', { length: 20 }).notNull(),
    itemId: bigint('item_id', { mode: 'number' }).notNull(),
    quantity: numeric('quantity', { precision: 20, scale: 0 }).default('1').notNull(),
    acquiredAt: timestamp('acquired_at').defaultNow().notNull(),
  },
  (table) => ({
    fkItemId: foreignKey({
      columns: [table.itemId],
      foreignColumns: [items.itemId],
    }),
    uniqueUserItem: uniqueIndex('unique_user_item').on(table.userId, table.guildId, table.itemId),
    idxUserId: index('idx_user_inventory_user_id').on(table.userId),
  }),
);
