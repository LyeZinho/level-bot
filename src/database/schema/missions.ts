import { pgTable, serial, varchar, bigint, text, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { badges } from './badges';

export const missions = pgTable(
  'missions',
  {
    missionId: serial('mission_id').primaryKey(),
    missionType: varchar('mission_type', { length: 50 }).notNull(),
    targetValue: bigint('target_value', { mode: 'number' }).notNull(),
    rewardBadgeId: bigint('reward_badge_id', { mode: 'number' }).notNull(),
    rewardCoins: bigint('reward_coins', { mode: 'number' }).default(0).notNull(),
    description: text('description'),
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
