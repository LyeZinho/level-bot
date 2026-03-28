import { Client } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { ShopService } from './shop.service';
export declare class RobuxService {
    private db;
    private shopService;
    private configService;
    constructor(db: PostgresJsDatabase<typeof schema>, shopService: ShopService, configService: ConfigService);
    createRedemptionThread(client: Client, guildId: string, userId: string, robuxAmount: number): Promise<void>;
    handleRobuxPurchase(client: Client, guildId: string, userId: string): Promise<{
        success: boolean;
        reason?: string;
    }>;
}
//# sourceMappingURL=robux.service.d.ts.map