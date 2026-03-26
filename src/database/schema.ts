import { pgTable, text, integer, timestamp, decimal, boolean, serial, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ===== CORE USERS =====
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    discordId: text('discord_id').unique().notNull(),
    guildId: text('guild_id').notNull(),
    username: text('username').notNull(),
    avatar: text('avatar'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    discordIdIdx: index('users_discord_id_idx').on(table.discordId),
    guildIdIdx: index('users_guild_id_idx').on(table.guildId),
  }),
);

// ===== LEVELS & XP =====
export const userLevels = pgTable(
  'user_levels',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    guildId: text('guild_id').notNull(),
    xp: integer('xp').default(0).notNull(),
    level: integer('level').default(1).notNull(),
    totalXp: integer('total_xp').default(0).notNull(),
    voiceSeconds: integer('voice_seconds').default(0).notNull(),
    messageCount: integer('message_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdGuildIdIdx: index('user_levels_user_guild_idx').on(table.userId, table.guildId),
    levelIdx: index('user_levels_level_idx').on(table.level),
  }),
);

// ===== COINS =====
export const userCoins = pgTable(
  'user_coins',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    guildId: text('guild_id').notNull(),
    balance: integer('balance').default(0).notNull(),
    totalEarned: integer('total_earned').default(0).notNull(),
    totalSpent: integer('total_spent').default(0).notNull(),
    lastDailyAt: timestamp('last_daily_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdGuildIdIdx: index('user_coins_user_guild_idx').on(table.userId, table.guildId),
  }),
);

// ===== ITEMS & SHOP =====
export const items = pgTable(
  'items',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    price: integer('price').notNull(),
    emoji: text('emoji'),
    type: text('type').notNull(), // 'consumable', 'cosmetic', 'role', 'mystery'
    rarity: text('rarity').default('common'), // 'common', 'rare', 'epic', 'legendary'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    typeIdx: index('items_type_idx').on(table.type),
  }),
);

// ===== INVENTORY =====
export const userInventory = pgTable(
  'user_inventory',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    itemId: integer('item_id').notNull().references(() => items.id),
    quantity: integer('quantity').default(1).notNull(),
    obtainedAt: timestamp('obtained_at').defaultNow().notNull(),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdItemIdIdx: index('user_inventory_user_item_idx').on(table.userId, table.itemId),
  }),
);

// ===== BADGES =====
export const badges = pgTable(
  'badges',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    description: text('description'),
    emoji: text('emoji').notNull(),
    rarity: text('rarity').default('common'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index('badges_name_idx').on(table.name),
  }),
);

export const userBadges = pgTable(
  'user_badges',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    badgeId: integer('badge_id').notNull().references(() => badges.id),
    obtainedAt: timestamp('obtained_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdBadgeIdIdx: index('user_badges_user_badge_idx').on(table.userId, table.badgeId),
  }),
);

// ===== MISSIONS =====
export const missions = pgTable(
  'missions',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    type: text('type').notNull(), // 'daily', 'weekly', 'monthly', 'special'
    requirement: integer('requirement').notNull(), // XP required, messages, etc
    reward: integer('reward').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    typeIdx: index('missions_type_idx').on(table.type),
  }),
);

export const userMissions = pgTable(
  'user_missions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    missionId: integer('mission_id').notNull().references(() => missions.id),
    progress: integer('progress').default(0).notNull(),
    completed: boolean('completed').default(false).notNull(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdMissionIdIdx: index('user_missions_user_mission_idx').on(table.userId, table.missionId),
  }),
);

// ===== VOICE SESSIONS =====
export const voiceSessions = pgTable(
  'voice_sessions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    guildId: text('guild_id').notNull(),
    channelId: text('channel_id').notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    leftAt: timestamp('left_at'),
    duration: integer('duration'), // seconds
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdGuildIdIdx: index('voice_sessions_user_guild_idx').on(table.userId, table.guildId),
  }),
);

// ===== RELATIONS =====
export const usersRelations = relations(users, ({ one, many }) => ({
  levels: many(userLevels),
  coins: many(userCoins),
  badges: many(userBadges),
  inventory: many(userInventory),
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
