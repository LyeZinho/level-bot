import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
export declare class EconomyService {
    private db;
    constructor(db: PostgresJsDatabase<typeof schema>);
    addCoins(userId: string, guildId: string, amount: number): Promise<void>;
    removeCoins(userId: string, guildId: string, amount: number): Promise<number>;
    transferCoins(fromUserId: string, toUserId: string, guildId: string, amount: number): Promise<{
        success: boolean;
        reason?: string;
    }>;
    getBalance(userId: string, guildId: string): Promise<{
        coins: number;
    } | null>;
    claimDaily(userId: string, guildId: string): Promise<{
        success: boolean;
        reason?: string;
        amount?: number;
        timeLeft?: number;
    }>;
}
//# sourceMappingURL=economy.service.d.ts.map