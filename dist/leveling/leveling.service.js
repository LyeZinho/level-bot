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
exports.LevelingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const drizzle_orm_1 = require("drizzle-orm");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const schema = __importStar(require("../database/schema"));
const drizzle_provider_1 = require("../database/drizzle.provider");
const cache_service_1 = require("../cache/cache.service");
const xp_constants_1 = require("./xp.constants");
let LevelingService = class LevelingService {
    constructor(db, cacheService, configService) {
        this.db = db;
        this.cacheService = cacheService;
        this.configService = configService;
    }
    calculateLevel(xp) {
        return Math.floor(Math.sqrt(xp / 100)) + 1;
    }
    getXPForLevel(level) {
        return Math.pow(level - 1, 2) * 100;
    }
    getXPProgress(xp) {
        const currentLevel = this.calculateLevel(xp);
        const currentLevelXp = this.getXPForLevel(currentLevel);
        const nextLevelXp = this.getXPForLevel(currentLevel + 1);
        const current = xp - currentLevelXp;
        const needed = nextLevelXp - currentLevelXp;
        const percentage = Math.round((current / needed) * 100);
        return { current, needed, percentage };
    }
    async getTotalMultiplier(userId, guildId) {
        let multiplier = 1;
        let hasVip = false;
        let hasBoost = false;
        const cacheKey = `multiplier:${userId}:${guildId}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const vip = await this.db.select().from(schema.userVips).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userVips.userId, userId), (0, drizzle_orm_1.eq)(schema.userVips.guildId, guildId))).limit(1);
        if (vip.length > 0 && vip[0].active) {
            multiplier *= vip[0].multiplier;
            hasVip = true;
        }
        const boosts = await this.db.select().from(schema.userBoosts).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userBoosts.userId, userId), (0, drizzle_orm_1.eq)(schema.userBoosts.guildId, guildId)));
        if (boosts.length > 0) {
            const now = new Date();
            const activeBoost = boosts.find((b) => new Date(b.expiresAt) > now);
            if (activeBoost) {
                multiplier *= parseFloat(activeBoost.multiplier.toString());
                hasBoost = true;
            }
        }
        await this.cacheService.set(cacheKey, { multiplier, hasVip, hasBoost }, 600);
        return { multiplier, hasVip, hasBoost };
    }
    async addMessageXP(userId, username, guildId, xpGain) {
        let user = await this.db.select().from(schema.users).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.userId, userId), (0, drizzle_orm_1.eq)(schema.users.guildId, guildId))).limit(1);
        if (user.length === 0) {
            await this.db.insert(schema.users).values({
                userId,
                guildId,
                xp: '0',
                level: 0,
                messages: 0,
                voiceTime: 0,
                coins: '0',
            });
            user = await this.db.select().from(schema.users).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.userId, userId), (0, drizzle_orm_1.eq)(schema.users.guildId, guildId))).limit(1);
        }
        const { multiplier, hasVip, hasBoost } = await this.getTotalMultiplier(userId, guildId);
        const finalXpGain = Math.floor(xpGain * multiplier);
        const newXP = parseInt(user[0].xp) + finalXpGain;
        const oldLevel = user[0].level;
        const newLevel = this.calculateLevel(newXP);
        const oldCoinsFromXp = Math.floor(parseInt(user[0].xp) / 100);
        const newCoinsFromXp = Math.floor(newXP / 100);
        let coinsGained = Math.floor((newCoinsFromXp - oldCoinsFromXp) * multiplier);
        coinsGained = Math.min(coinsGained, xp_constants_1.MAX_COINS_PER_MESSAGE);
        await this.db
            .update(schema.users)
            .set({
            xp: newXP.toString(),
            level: newLevel,
            messages: (user[0].messages || 0) + 1,
            coins: (parseInt(user[0].coins) + coinsGained).toString(),
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.userId, userId), (0, drizzle_orm_1.eq)(schema.users.guildId, guildId)));
        await this.cacheService.del(`multiplier:${userId}:${guildId}`);
        return {
            levelUp: newLevel > oldLevel,
            oldLevel,
            newLevel,
            xp: newXP,
            coinsGained,
            xpGained: finalXpGain,
            multiplier,
            hasVip,
            hasBoost,
        };
    }
    async addVoiceTime(userId, username, guildId, seconds) {
        let user = await this.db.select().from(schema.users).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.userId, userId), (0, drizzle_orm_1.eq)(schema.users.guildId, guildId))).limit(1);
        if (user.length === 0) {
            await this.db.insert(schema.users).values({
                userId,
                guildId,
                xp: '0',
                level: 0,
                messages: 0,
                voiceTime: 0,
                coins: '0',
            });
            user = await this.db.select().from(schema.users).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.userId, userId), (0, drizzle_orm_1.eq)(schema.users.guildId, guildId))).limit(1);
        }
        const baseXpGain = Math.floor(seconds / 60) * xp_constants_1.XP_PER_VOICE_MINUTE;
        const { multiplier, hasVip, hasBoost } = await this.getTotalMultiplier(userId, guildId);
        const finalXpGain = Math.floor(baseXpGain * multiplier);
        const newXP = parseInt(user[0].xp) + finalXpGain;
        const oldLevel = user[0].level;
        const newLevel = this.calculateLevel(newXP);
        const oldCoinsFromXp = Math.floor(parseInt(user[0].xp) / 100);
        const newCoinsFromXp = Math.floor(newXP / 100);
        const coinsGained = Math.floor((newCoinsFromXp - oldCoinsFromXp) * multiplier);
        await this.db
            .update(schema.users)
            .set({
            voiceTime: (user[0].voiceTime || 0) + seconds,
            xp: newXP.toString(),
            level: newLevel,
            coins: (parseInt(user[0].coins) + coinsGained).toString(),
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.userId, userId), (0, drizzle_orm_1.eq)(schema.users.guildId, guildId)));
        await this.cacheService.del(`multiplier:${userId}:${guildId}`);
        return {
            levelUp: newLevel > oldLevel,
            oldLevel,
            newLevel,
            coinsGained,
            xpGained: finalXpGain,
            multiplier,
            hasVip,
            hasBoost,
        };
    }
    async getRanking(guildId, limit = 10) {
        return this.db
            .select()
            .from(schema.users)
            .where((0, drizzle_orm_1.eq)(schema.users.guildId, guildId))
            .orderBy((0, drizzle_orm_1.desc)(schema.users.xp))
            .limit(limit);
    }
    async getUserRank(userId, guildId) {
        const result = await this.db
            .select({ rank: (0, drizzle_orm_1.sql) `COUNT(*) + 1` })
            .from(schema.users)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.guildId, guildId), (0, drizzle_orm_1.sql) `xp > (SELECT xp FROM users WHERE user_id = ${userId} AND guild_id = ${guildId})`));
        return result[0]?.rank || 1;
    }
    async getLevelInfo(userId, guildId) {
        const user = await this.db.select().from(schema.users).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.userId, userId), (0, drizzle_orm_1.eq)(schema.users.guildId, guildId))).limit(1);
        if (user.length === 0) {
            return null;
        }
        const userRecord = user[0];
        const rank = await this.getUserRank(userId, guildId);
        const progress = this.getXPProgress(parseInt(userRecord.xp));
        return {
            user: userRecord,
            rank,
            progress,
        };
    }
    async recalculateAllLevels() {
        const allUsers = await this.db.select().from(schema.users);
        for (const user of allUsers) {
            const newLevel = this.calculateLevel(parseInt(user.xp));
            if (newLevel !== user.level) {
                await this.db
                    .update(schema.users)
                    .set({ level: newLevel })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.userId, user.userId), (0, drizzle_orm_1.eq)(schema.users.guildId, user.guildId)));
            }
        }
    }
    async forceSetLevel(userId, guildId, newLevel) {
        const xp = this.getXPForLevel(newLevel);
        await this.db
            .update(schema.users)
            .set({ xp: xp.toString(), level: newLevel })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.userId, userId), (0, drizzle_orm_1.eq)(schema.users.guildId, guildId)));
        await this.cacheService.del(`multiplier:${userId}:${guildId}`);
    }
    async sendLevelUpNotification(client, guildId, userId, newLevel) {
        const channelId = this.configService.get('LEVEL_UP_NOTIFICATION_CHANNEL_ID');
        if (!channelId)
            return;
        try {
            const channel = await client.channels.fetch(channelId);
            if (!channel || !channel.isTextBased() || channel.isDMBased())
                return;
            const embed = {
                title: `🎉 Level Up!`,
                description: `<@${userId}> reached level **${newLevel}**!`,
                color: 0x00ff00,
                timestamp: new Date().toISOString(),
            };
            await channel.send({ embeds: [embed] });
        }
        catch (error) {
            console.error('Error sending level-up notification:', error);
        }
    }
};
exports.LevelingService = LevelingService;
exports.LevelingService = LevelingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DRIZZLE)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase,
        cache_service_1.CacheService,
        config_1.ConfigService])
], LevelingService);
//# sourceMappingURL=leveling.service.js.map