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
exports.ShopService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const schema = __importStar(require("../database/schema"));
const drizzle_provider_1 = require("../database/drizzle.provider");
const economy_service_1 = require("./economy.service");
let ShopService = class ShopService {
    constructor(db, economyService) {
        this.db = db;
        this.economyService = economyService;
    }
    async createItem(name, description, price, emoji = '📦', type = 'consumable', hidden = false) {
        const existing = await this.db.select().from(schema.items).where((0, drizzle_orm_1.eq)(schema.items.name, name)).limit(1);
        if (existing.length > 0) {
            await this.db
                .update(schema.items)
                .set({
                description,
                price,
                emoji,
                type,
                hidden,
            })
                .where((0, drizzle_orm_1.eq)(schema.items.name, name));
            const updated = await this.db.select().from(schema.items).where((0, drizzle_orm_1.eq)(schema.items.name, name)).limit(1);
            return updated[0];
        }
        const result = await this.db.insert(schema.items).values({
            name,
            description,
            price,
            emoji,
            type,
            hidden,
        }).returning();
        return result[0];
    }
    async getAllItems() {
        return this.db.select().from(schema.items).where((0, drizzle_orm_1.eq)(schema.items.hidden, false)).orderBy(schema.items.price);
    }
    async getItem(itemId) {
        const result = await this.db.select().from(schema.items).where((0, drizzle_orm_1.eq)(schema.items.itemId, itemId)).limit(1);
        return result[0] || null;
    }
    async getItemByName(name) {
        const result = await this.db
            .select()
            .from(schema.items)
            .where((0, drizzle_orm_1.sql) `LOWER(name) = LOWER(${name})`)
            .limit(1);
        return result[0] || null;
    }
    async buyItem(userId, guildId, itemId, quantity = 1) {
        try {
            const item = await this.getItem(itemId);
            if (!item) {
                return { success: false, reason: 'item_not_found' };
            }
            const totalCost = item.price * quantity;
            const user = await this.db
                .select()
                .from(schema.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.userId, userId), (0, drizzle_orm_1.eq)(schema.users.guildId, guildId)))
                .limit(1);
            if (user.length === 0 || parseInt(user[0].coins) < totalCost) {
                return { success: false, reason: 'insufficient_funds', totalCost };
            }
            await this.economyService.removeCoins(userId, guildId, totalCost);
            const existing = await this.db
                .select()
                .from(schema.userInventory)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userInventory.userId, userId), (0, drizzle_orm_1.eq)(schema.userInventory.guildId, guildId), (0, drizzle_orm_1.eq)(schema.userInventory.itemId, itemId)))
                .limit(1);
            if (existing.length > 0) {
                await this.db
                    .update(schema.userInventory)
                    .set({
                    quantity: (parseInt(existing[0].quantity) + quantity).toString(),
                })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userInventory.userId, userId), (0, drizzle_orm_1.eq)(schema.userInventory.guildId, guildId), (0, drizzle_orm_1.eq)(schema.userInventory.itemId, itemId)));
            }
            else {
                await this.db.insert(schema.userInventory).values({
                    userId,
                    guildId,
                    itemId,
                    quantity: quantity.toString(),
                });
            }
            return { success: true, item, quantity, totalCost };
        }
        catch (error) {
            throw error;
        }
    }
    async getUserInventory(userId, guildId) {
        const result = await this.db
            .select({
            id: schema.userInventory.id,
            userId: schema.userInventory.userId,
            guildId: schema.userInventory.guildId,
            itemId: schema.userInventory.itemId,
            quantity: schema.userInventory.quantity,
            acquiredAt: schema.userInventory.acquiredAt,
            name: schema.items.name,
            description: schema.items.description,
            emoji: schema.items.emoji,
            type: schema.items.type,
            price: schema.items.price,
        })
            .from(schema.userInventory)
            .innerJoin(schema.items, (0, drizzle_orm_1.eq)(schema.userInventory.itemId, schema.items.itemId))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userInventory.userId, userId), (0, drizzle_orm_1.eq)(schema.userInventory.guildId, guildId)))
            .orderBy((0, drizzle_orm_1.desc)(schema.userInventory.acquiredAt));
        return result;
    }
};
exports.ShopService = ShopService;
exports.ShopService = ShopService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DRIZZLE)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase,
        economy_service_1.EconomyService])
], ShopService);
//# sourceMappingURL=shop.service.js.map