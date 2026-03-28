import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { missions } from './missions';

export const userMissions = pgTable(
  'user_missions',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 20 }).notNull(),
    guildId: varchar('guild_id', { length: 20 }).notNull(),
    missionId: integer('mission_id').notNull(),
    currentValue: integer('current_value').notNull().default(0),
    completed: boolean('completed').notNull().default(false),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('user_missions_user_guild_mission_idx').on(
      table.userId,
      table.guildId,
      table.missionId,
    ),
    index('user_missions_user_id_idx').on(table.userId),
    index('user_missions_mission_id_idx').on(table.missionId),
  ],
);

export const userMissionsRelations = relations(userMissions, ({ one }) => ({
  user: one(users, {
    fields: [userMissions.userId, userMissions.guildId],
    references: [users.discordId, users.guildId],
  }),
  mission: one(missions, {
    fields: [userMissions.missionId],
    references: [missions.id],
  }),
}));
