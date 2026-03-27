import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { EconomyService } from './economy.service';
export declare class ShopService {
    private db;
    private economyService;
    constructor(db: PostgresJsDatabase<typeof schema>, economyService: EconomyService);
    createItem(name: string, description: string, price: number, emoji?: string, type?: string, hidden?: boolean): Promise<typeof schema.items.$inferSelect>;
    getAllItems(): Promise<typeof schema.items.$inferSelect[]>;
    getItem(itemId: number): Promise<typeof schema.items.$inferSelect | null>;
    getItemByName(name: string): Promise<typeof schema.items.$inferSelect | null>;
    buyItem(userId: string, guildId: string, itemId: number, quantity?: number): Promise<{
        success: boolean;
        reason?: string;
        item?: any;
        quantity?: number;
        totalCost?: number;
    }>;
    getUserInventory(userId: string, guildId: string): Promise<any[]>;
}
//# sourceMappingURL=shop.service.d.ts.map