import { ConfigService } from '@nestjs/config';
import { Client } from 'discord.js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { CacheService } from '../cache/cache.service';
export declare class LevelingService {
    private db;
    private cacheService;
    private configService;
    constructor(db: PostgresJsDatabase<typeof schema>, cacheService: CacheService, configService: ConfigService);
    calculateLevel(xp: number): number;
    getXPForLevel(level: number): number;
    getXPProgress(xp: number): {
        current: number;
        needed: number;
        percentage: number;
    };
    getTotalMultiplier(userId: string, guildId: string): Promise<{
        multiplier: number;
        hasVip: boolean;
        hasBoost: boolean;
    }>;
    addMessageXP(userId: string, username: string, guildId: string, xpGain: number): Promise<{
        levelUp: boolean;
        oldLevel: number;
        newLevel: number;
        xp: number;
        coinsGained: number;
        xpGained: number;
        multiplier: number;
        hasVip: boolean;
        hasBoost: boolean;
    }>;
    addVoiceTime(userId: string, username: string, guildId: string, seconds: number): Promise<{
        levelUp: boolean;
        oldLevel: number;
        newLevel: number;
        coinsGained: number;
        xpGained: number;
        multiplier: number;
        hasVip: boolean;
        hasBoost: boolean;
    }>;
    getRanking(guildId: string, limit?: number): Promise<{
        userId: string;
        guildId: string;
        xp: string;
        level: number;
        messages: number;
        voiceTime: number;
        coins: string;
        lastDailyClaimAt: Date | null;
        createdAt: Date;
    }[]>;
    getUserRank(userId: string, guildId: string): Promise<number>;
    getLevelInfo(userId: string, guildId: string): Promise<{
        user: {
            userId: string;
            guildId: string;
            xp: string;
            level: number;
            messages: number;
            voiceTime: number;
            coins: string;
            lastDailyClaimAt: Date | null;
            createdAt: Date;
        };
        rank: number;
        progress: {
            current: number;
            needed: number;
            percentage: number;
        };
    } | null>;
    recalculateAllLevels(): Promise<void>;
    forceSetLevel(userId: string, guildId: string, newLevel: number): Promise<void>;
    sendLevelUpNotification(client: Client, guildId: string, userId: string, newLevel: number): Promise<void>;
}
//# sourceMappingURL=leveling.service.d.ts.map