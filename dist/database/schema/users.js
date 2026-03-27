"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)('users', {
    userId: (0, pg_core_1.varchar)('user_id', { length: 20 }).notNull(),
    guildId: (0, pg_core_1.varchar)('guild_id', { length: 20 }).notNull(),
    xp: (0, pg_core_1.numeric)('xp', { precision: 20, scale: 0 }).default('0').notNull(),
    level: (0, pg_core_1.bigint)('level', { mode: 'number' }).default(0).notNull(),
    messages: (0, pg_core_1.bigint)('messages', { mode: 'number' }).default(0).notNull(),
    voiceTime: (0, pg_core_1.bigint)('voice_time', { mode: 'number' }).default(0).notNull(),
    coins: (0, pg_core_1.numeric)('coins', { precision: 20, scale: 0 }).default('0').notNull(),
    lastDailyClaimAt: (0, pg_core_1.timestamp)('last_daily_claim_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.userId, table.guildId] }),
    idxGuildId: (0, pg_core_1.index)('idx_users_guild_id').on(table.guildId),
    idxLevel: (0, pg_core_1.index)('idx_users_level').on(table.level),
}));
//# sourceMappingURL=users.js.map