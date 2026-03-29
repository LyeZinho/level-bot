import { pgTable, serial, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';

export const items = pgTable(
  'items',
  {
    itemId: serial('item_id').primaryKey(),
    name: text('name').unique().notNull(),
    description: text('description'),
    price: integer('price').notNull(),
    emoji: text('emoji').default('📦').notNull(),
    type: text('type').default('consumable').notNull(),
    hidden: boolean('hidden').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    idxType: index('idx_items_type').on(table.type),
    idxHidden: index('idx_items_hidden').on(table.hidden),
  }),
);
