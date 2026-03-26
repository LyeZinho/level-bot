import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  boolean,
  json,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    discordId: varchar('discord_id', { length: 255 }).notNull().unique(),
    guildId: varchar('guild_id', { length: 255 }).notNull(),
    username: varchar('username', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    discordIdIdx: index('idx_users_discord_id').on(table.discordId),
    guildIdIdx: index('idx_users_guild_id').on(table.guildId),
  }),
);

// User Levels table
export const userLevels = pgTable(
  'user_levels',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    guildId: varchar('guild_id', { length: 255 }).notNull(),
    xp: integer('xp').notNull().default(0),
    level: integer('level').notNull().default(1),
    totalXp: integer('total_xp').notNull().default(0),
    messageCount: integer('message_count').notNull().default(0),
    voiceSeconds: integer('voice_seconds').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_user_levels_user_id').on(table.userId),
    guildIdIdx: index('idx_user_levels_guild_id').on(table.guildId),
    fk_user: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'fk_user_levels_user_id',
    }).onDelete('cascade'),
  }),
);

// User Coins table
export const userCoins = pgTable(
  'user_coins',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    guildId: varchar('guild_id', { length: 255 }).notNull(),
    balance: integer('balance').notNull().default(0),
    totalEarned: integer('total_earned').notNull().default(0),
    totalSpent: integer('total_spent').notNull().default(0),
    lastDailyAt: timestamp('last_daily_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_user_coins_user_id').on(table.userId),
    guildIdIdx: index('idx_user_coins_guild_id').on(table.guildId),
    fk_user: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'fk_user_coins_user_id',
    }).onDelete('cascade'),
  }),
);

// Items table
export const items = pgTable(
  'items',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 1024 }),
    price: integer('price').notNull(),
    emoji: varchar('emoji', { length: 10 }),
    type: varchar('type', { length: 50 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    typeIdx: index('idx_items_type').on(table.type),
  }),
);

// User Inventory table
export const userInventory = pgTable(
  'user_inventory',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    itemId: integer('item_id').notNull(),
    quantity: integer('quantity').notNull().default(1),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_user_inventory_user_id').on(table.userId),
    itemIdIdx: index('idx_user_inventory_item_id').on(table.itemId),
    fk_user: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'fk_user_inventory_user_id',
    }).onDelete('cascade'),
    fk_item: foreignKey({
      columns: [table.itemId],
      foreignColumns: [items.id],
      name: 'fk_user_inventory_item_id',
    }).onDelete('cascade'),
  }),
);

// Badges table
export const badges = pgTable(
  'badges',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 1024 }),
    emoji: varchar('emoji', { length: 10 }),
    rarity: varchar('rarity', { length: 50 }).notNull().default('common'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
);

// User Badges table
export const userBadges = pgTable(
  'user_badges',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    badgeId: integer('badge_id').notNull(),
    awardedAt: timestamp('awarded_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_user_badges_user_id').on(table.userId),
    badgeIdIdx: index('idx_user_badges_badge_id').on(table.badgeId),
    fk_user: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'fk_user_badges_user_id',
    }).onDelete('cascade'),
    fk_badge: foreignKey({
      columns: [table.badgeId],
      foreignColumns: [badges.id],
      name: 'fk_user_badges_badge_id',
    }).onDelete('cascade'),
  }),
);

// Missions table
export const missions = pgTable(
  'missions',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 1024 }),
    type: varchar('type', { length: 50 }).notNull(),
    requirement: integer('requirement').notNull(),
    reward: integer('reward').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
);

// User Missions table
export const userMissions = pgTable(
  'user_missions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    missionId: integer('mission_id').notNull(),
    progress: integer('progress').notNull().default(0),
    completed: boolean('completed').notNull().default(false),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_user_missions_user_id').on(table.userId),
    missionIdIdx: index('idx_user_missions_mission_id').on(table.missionId),
    fk_user: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'fk_user_missions_user_id',
    }).onDelete('cascade'),
    fk_mission: foreignKey({
      columns: [table.missionId],
      foreignColumns: [missions.id],
      name: 'fk_user_missions_mission_id',
    }).onDelete('cascade'),
  }),
);

// Voice Sessions table
export const voiceSessions = pgTable(
  'voice_sessions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    guildId: varchar('guild_id', { length: 255 }).notNull(),
    joinedAt: timestamp('joined_at').notNull(),
    leftAt: timestamp('left_at'),
    duration: integer('duration').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_voice_sessions_user_id').on(table.userId),
    guildIdIdx: index('idx_voice_sessions_guild_id').on(table.guildId),
    fk_user: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'fk_voice_sessions_user_id',
    }).onDelete('cascade'),
  }),
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  levels: many(userLevels),
  coins: many(userCoins),
  inventory: many(userInventory),
  badges: many(userBadges),
  missions: many(userMissions),
  voiceSessions: many(voiceSessions),
}));

export const userLevelsRelations = relations(userLevels, ({ one }) => ({
  user: one(users, {
    fields: [userLevels.userId],
    references: [users.id],
  }),
}));

export const userCoinsRelations = relations(userCoins, ({ one }) => ({
  user: one(users, {
    fields: [userCoins.userId],
    references: [users.id],
  }),
}));

export const userInventoryRelations = relations(userInventory, ({ one }) => ({
  user: one(users, {
    fields: [userInventory.userId],
    references: [users.id],
  }),
  item: one(items, {
    fields: [userInventory.itemId],
    references: [items.id],
  }),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const userMissionsRelations = relations(userMissions, ({ one }) => ({
  user: one(users, {
    fields: [userMissions.userId],
    references: [users.id],
  }),
  mission: one(missions, {
    fields: [userMissions.missionId],
    references: [missions.id],
  }),
}));

export const voiceSessionsRelations = relations(voiceSessions, ({ one }) => ({
  user: one(users, {
    fields: [voiceSessions.userId],
    references: [users.id],
  }),
}));
