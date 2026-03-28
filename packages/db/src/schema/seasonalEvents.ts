import {
  pgTable,
  serial,
  varchar,
  text,
  real,
  integer,
  boolean,
  timestamp,
  json,
  index,
} from 'drizzle-orm/pg-core';

export const seasonalEvents = pgTable(
  'seasonal_events',
  {
    id: serial('id').primaryKey(),
    eventId: varchar('event_id', { length: 64 }).notNull().unique(),
    name: varchar('name', { length: 128 }).notNull(),
    description: text('description').notNull(),
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }).notNull(),
    triggerChance: real('trigger_chance').notNull().default(0.1),
    message: text('message').notNull(),
    reactionEmoji: varchar('reaction_emoji', { length: 32 }).notNull(),
    errorMessage: text('error_message').notNull(),
    reactionTimeout: integer('reaction_timeout').notNull().default(30000),
    rewards: json('rewards').$type<{
      badge_name: string;
      items: number[];
      coins: number;
    }>().notNull(),
    active: boolean('active').notNull().default(true),
    cooldownPerUser: integer('cooldown_per_user').notNull().default(3600000),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('seasonal_events_active_idx').on(table.active),
    index('seasonal_events_dates_idx').on(table.startDate, table.endDate),
  ],
);
