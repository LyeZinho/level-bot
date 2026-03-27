"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userVips = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.userVips = (0, pg_core_1.pgTable)('user_vips', {
    userId: (0, pg_core_1.varchar)('user_id', { length: 20 }).notNull(),
    guildId: (0, pg_core_1.varchar)('guild_id', { length: 20 }).notNull(),
    tier: (0, pg_core_1.varchar)('tier', { length: 50 }).notNull(),
    multiplier: (0, pg_core_1.bigint)('multiplier', { mode: 'number' }).notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    active: (0, pg_core_1.boolean)('active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.userId, table.guildId, table.tier] }),
    uniqueUserVip: (0, pg_core_1.uniqueIndex)('unique_user_vip').on(table.userId, table.guildId),
    idxActive: (0, pg_core_1.index)('idx_user_vips_active').on(table.active),
    idxExpiresAt: (0, pg_core_1.index)('idx_user_vips_expires_at').on(table.expiresAt),
}));
//# sourceMappingURL=user-vips.js.map