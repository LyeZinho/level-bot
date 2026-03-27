"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userBoosts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.userBoosts = (0, pg_core_1.pgTable)('user_boosts', {
    userId: (0, pg_core_1.varchar)('user_id', { length: 20 }).notNull(),
    guildId: (0, pg_core_1.varchar)('guild_id', { length: 20 }).notNull(),
    boostType: (0, pg_core_1.varchar)('boost_type', { length: 50 }).notNull(),
    multiplier: (0, pg_core_1.numeric)('multiplier', { precision: 5, scale: 2 }).notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.userId, table.guildId, table.boostType] }),
    idxExpiresAt: (0, pg_core_1.index)('idx_user_boosts_expires_at').on(table.expiresAt),
}));
//# sourceMappingURL=user-boosts.js.map