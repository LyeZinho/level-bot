import { pgTable, serial, varchar, bigint, text, timestamp, integer, boolean, index, foreignKey } from 'drizzle-orm/pg-core';
import { badges } from './badges';

export const missions = pgTable(
  'missions',
  {
    missionId: serial('mission_id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    missionType: varchar('mission_type', { length: 50 }).notNull(),
    targetValue: integer('target_value').notNull(),
    rewardBadgeId: integer('reward_badge_id'),
    rewardCoins: integer('reward_coins').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    isRepeatable: boolean('is_repeatable').default(false).notNull(),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    fkRewardBadgeId: foreignKey({
      columns: [table.rewardBadgeId],
      foreignColumns: [badges.badgeId],
    }),
    idxMissionType: index('idx_missions_mission_type').on(table.missionType),
  }),
);
