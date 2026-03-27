"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VipService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const schema = __importStar(require("../database/schema"));
const drizzle_provider_1 = require("../database/drizzle.provider");
const vip_constants_1 = require("./vip.constants");
const cache_service_1 = require("../cache/cache.service");
let VipService = class VipService {
    constructor(db, cacheService) {
        this.db = db;
        this.cacheService = cacheService;
    }
    async getActiveVip(userId, guildId) {
        const vips = await this.db
            .select()
            .from(schema.userVips)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userVips.userId, userId), (0, drizzle_orm_1.eq)(schema.userVips.guildId, guildId)));
        for (const vip of vips) {
            if (new Date(vip.expiresAt) <= new Date()) {
                await this.db
                    .delete(schema.userVips)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userVips.userId, userId), (0, drizzle_orm_1.eq)(schema.userVips.guildId, guildId), (0, drizzle_orm_1.eq)(schema.userVips.tier, vip.tier)));
            }
        }
        const active = await this.db
            .select()
            .from(schema.userVips)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userVips.userId, userId), (0, drizzle_orm_1.eq)(schema.userVips.guildId, guildId), (0, drizzle_orm_1.eq)(schema.userVips.active, true)))
            .limit(1);
        return active[0] || null;
    }
    async activateVip(userId, guildId, tier, durationDays) {
        const tierConfig = vip_constants_1.VIP_TIERS[tier];
        const duration = durationDays || tierConfig.durationDays;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + duration);
        await this.db.delete(schema.userVips).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userVips.userId, userId), (0, drizzle_orm_1.eq)(schema.userVips.guildId, guildId)));
        await this.db.insert(schema.userVips).values({
            userId,
            guildId,
            tier,
            multiplier: tierConfig.multiplier,
            expiresAt,
            active: true,
        });
        await this.db.insert(schema.userBoosts).values({
            userId,
            guildId,
            boostType: `vip_${tier}`,
            multiplier: tierConfig.multiplier.toString(),
            expiresAt,
        });
        await this.cacheService.del(`multiplier:${userId}:${guildId}`);
    }
    async getExpiredVips() {
        return this.db
            .select()
            .from(schema.userVips)
            .where((0, drizzle_orm_1.lt)(schema.userVips.expiresAt, new Date()));
    }
    async deactivateVip(userId, guildId) {
        await this.db
            .delete(schema.userVips)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userVips.userId, userId), (0, drizzle_orm_1.eq)(schema.userVips.guildId, guildId)));
        const boosts = await this.db
            .select()
            .from(schema.userBoosts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userBoosts.userId, userId), (0, drizzle_orm_1.eq)(schema.userBoosts.guildId, guildId)));
        for (const boost of boosts) {
            if (boost.boostType.startsWith('vip_')) {
                await this.db
                    .delete(schema.userBoosts)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userBoosts.userId, userId), (0, drizzle_orm_1.eq)(schema.userBoosts.guildId, guildId), (0, drizzle_orm_1.eq)(schema.userBoosts.boostType, boost.boostType)));
            }
        }
        await this.cacheService.del(`multiplier:${userId}:${guildId}`);
    }
    async giveVipItem(userId, guildId, tier) {
        const tierConfig = vip_constants_1.VIP_TIERS[tier];
        const itemName = `VIP ${tierConfig.name}`;
        const item = await this.db.select().from(schema.items).where((0, drizzle_orm_1.eq)(schema.items.name, itemName)).limit(1);
        if (item.length > 0) {
            const existing = await this.db
                .select()
                .from(schema.userInventory)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userInventory.userId, userId), (0, drizzle_orm_1.eq)(schema.userInventory.guildId, guildId), (0, drizzle_orm_1.eq)(schema.userInventory.itemId, item[0].itemId)))
                .limit(1);
            if (existing.length > 0) {
                await this.db
                    .update(schema.userInventory)
                    .set({
                    quantity: (parseInt(existing[0].quantity) + 1).toString(),
                })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userInventory.userId, userId), (0, drizzle_orm_1.eq)(schema.userInventory.guildId, guildId), (0, drizzle_orm_1.eq)(schema.userInventory.itemId, item[0].itemId)));
            }
            else {
                await this.db.insert(schema.userInventory).values({
                    userId,
                    guildId,
                    itemId: item[0].itemId,
                    quantity: '1',
                });
            }
        }
    }
};
exports.VipService = VipService;
exports.VipService = VipService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DRIZZLE)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase,
        cache_service_1.CacheService])
], VipService);
//# sourceMappingURL=vip.service.js.map