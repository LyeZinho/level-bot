import { pgTable, serial, varchar, bigint, timestamp, boolean, uniqueIndex, index, foreignKey } from 'drizzle-orm/pg-core';
import { missions } from './missions';

export const userMissions = pgTable(
  'user_missions',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 20 }).notNull(),
    guildId: varchar('guild_id', { length: 20 }).notNull(),
    missionId: bigint('mission_id', { mode: 'number' }).notNull(),
    currentValue: bigint('current_value', { mode: 'number' }).default(0).notNull(),
    completed: boolean('completed').default(false).notNull(),
    completedAt: timestamp('completed_at'),
    startedAt: timestamp('started_at').defaultNow().notNull(),
  },
  (table) => ({
    fkMissionId: foreignKey({
      columns: [table.missionId],
      foreignColumns: [missions.missionId],
    }),
    uniqueUserMission: uniqueIndex('unique_user_mission').on(table.userId, table.guildId, table.missionId),
    idxUserId: index('idx_user_missions_user_id').on(table.userId),
    idxCompleted: index('idx_user_missions_completed').on(table.completed),
  }),
);
