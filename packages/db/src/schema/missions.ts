import {
  pgTable,
  serial,
  varchar,
  integer,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userMissions } from './userMissions';

export const missions = pgTable(
  'missions',
  {
    id: serial('id').primaryKey(),
    missionType: varchar('mission_type', { length: 64 }).notNull(),
    targetValue: integer('target_value').notNull(),
    rewardBadgeId: integer('reward_badge_id'),
    rewardCoins: integer('reward_coins').notNull().default(0),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('missions_type_target_idx').on(table.missionType, table.targetValue),
  ],
);

export const missionsRelations = relations(missions, ({ many }) => ({
  userMissions: many(userMissions),
}));
