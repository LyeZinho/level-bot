import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userInventory } from './userInventory';

export const shopItemTypeEnum = pgEnum('shop_item_type', [
  'consumable',
  'cosmetic',
  'mystery_box',
  'special',
  'role',
]);

export const shopItems = pgTable(
  'shop_items',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 128 }).notNull().unique(),
    description: text('description'),
    price: integer('price').notNull(),
    emoji: varchar('emoji', { length: 32 }),
    type: shopItemTypeEnum('type').notNull(),
    hidden: boolean('hidden').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('shop_items_type_idx').on(table.type),
    index('shop_items_hidden_idx').on(table.hidden),
  ],
);

export const shopItemsRelations = relations(shopItems, ({ many }) => ({
  inventory: many(userInventory),
}));
