import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { BadgesService } from './badges.service';
export declare class MissionsService {
    private db;
    private badgesService;
    constructor(db: PostgresJsDatabase<typeof schema>, badgesService: BadgesService);
    trackProgress(userId: string, guildId: string, missionId: number, progressAmount: number): Promise<void>;
    completeMission(userId: string, guildId: string, missionId: number): Promise<boolean>;
    getUserMissions(userId: string, guildId: string): Promise<any[]>;
    getActiveMissions(): Promise<typeof schema.missions.$inferSelect[]>;
}
//# sourceMappingURL=missions.service.d.ts.map