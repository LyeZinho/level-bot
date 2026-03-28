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
exports.EconomyService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const schema = __importStar(require("../database/schema"));
const drizzle_provider_1 = require("../database/drizzle.provider");
let EconomyService = class EconomyService {
    constructor(db) {
        this.db = db;
    }
    async addCoins(userId, guildId, amount) {
        await this.db
            .update(schema.users)
            .set({
            coins: (0, drizzle_orm_1.sql) `coins + ${amount}`,
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.userId, userId), (0, drizzle_orm_1.eq)(schema.users.guildId, guildId)));
    }
    async removeCoins(userId, guildId, amount) {
        const result = await this.db
            .update(schema.users)
            .set({
            coins: (0, drizzle_orm_1.sql) `GREATEST(0, coins - ${amount})`,
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.userId, userId), (0, drizzle_orm_1.eq)(schema.users.guildId, guildId)))
            .returning();
        return parseInt(result[0]?.coins || '0');
    }
    async transferCoins(fromUserId, toUserId, guildId, amount) {
        try {
            const sender = await this.db
                .select()
                .from(schema.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.userId, fromUserId), (0, drizzle_orm_1.eq)(schema.users.guildId, guildId)))
                .limit(1);
            if (sender.length === 0 || parseInt(sender[0].coins) < amount) {
                return { success: false, reason: 'insufficient_funds' };
            }
            await this.removeCoins(fromUserId, guildId, amount);
            await this.addCoins(toUserId, guildId, amount);
            return { success: true };
        }
        catch (error) {
            throw error;
        }
    }
    async getBalance(userId, guildId) {
        const user = await this.db
            .select()
            .from(schema.users)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.userId, userId), (0, drizzle_orm_1.eq)(schema.users.guildId, guildId)))
            .limit(1);
        if (user.length === 0) {
            return null;
        }
        return { coins: parseInt(user[0].coins) };
    }
    async claimDaily(userId, guildId) {
        const user = await this.db
            .select()
            .from(schema.users)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.userId, userId), (0, drizzle_orm_1.eq)(schema.users.guildId, guildId)))
            .limit(1);
        if (user.length === 0) {
            return { success: false, reason: 'user_not_found' };
        }
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const lastClaim = user[0].lastDailyClaimAt?.getTime() || 0;
        if (now - lastClaim < oneDayMs) {
            const timeLeft = oneDayMs - (now - lastClaim);
            return { success: false, reason: 'already_claimed', timeLeft };
        }
        const dailyAmount = Math.floor(Math.random() * 3) + 3;
        await this.db
            .update(schema.users)
            .set({
            coins: (parseInt(user[0].coins) + dailyAmount).toString(),
            lastDailyClaimAt: new Date(),
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.userId, userId), (0, drizzle_orm_1.eq)(schema.users.guildId, guildId)));
        return { success: true, amount: dailyAmount };
    }
};
exports.EconomyService = EconomyService;
exports.EconomyService = EconomyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DRIZZLE)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase])
], EconomyService);
//# sourceMappingURL=economy.service.js.map