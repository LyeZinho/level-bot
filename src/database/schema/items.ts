import { pgTable, serial, varchar, bigint, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';

export const items = pgTable(
  'items',
  {
    itemId: serial('item_id').primaryKey(),
    name: varchar('name', { length: 255 }).unique().notNull(),
    description: text('description'),
    price: bigint('price', { mode: 'number' }).notNull(),
    emoji: varchar('emoji', { length: 10 }),
    type: varchar('type', { length: 50 }).notNull(),
    hidden: boolean('hidden').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    idxType: index('idx_items_type').on(table.type),
    idxHidden: index('idx_items_hidden').on(table.hidden),
  }),
);
