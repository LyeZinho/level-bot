import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { VIPTierKey } from './vip.constants';
import { CacheService } from '../cache/cache.service';
export declare class VipService {
    private db;
    private cacheService;
    constructor(db: PostgresJsDatabase<typeof schema>, cacheService: CacheService);
    getActiveVip(userId: string, guildId: string): Promise<typeof schema.userVips.$inferSelect | null>;
    activateVip(userId: string, guildId: string, tier: VIPTierKey, durationDays?: number): Promise<void>;
    getExpiredVips(): Promise<typeof schema.userVips.$inferSelect[]>;
    deactivateVip(userId: string, guildId: string): Promise<void>;
    giveVipItem(userId: string, guildId: string, tier: VIPTierKey): Promise<void>;
}
//# sourceMappingURL=vip.service.d.ts.map