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
exports.MissionsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const schema = __importStar(require("../database/schema"));
const drizzle_provider_1 = require("../database/drizzle.provider");
const badges_service_1 = require("./badges.service");
let MissionsService = class MissionsService {
    constructor(db, badgesService) {
        this.db = db;
        this.badgesService = badgesService;
    }
    async trackProgress(userId, guildId, missionId, progressAmount) {
        const mission = await this.db.select().from(schema.missions).where((0, drizzle_orm_1.eq)(schema.missions.missionId, missionId)).limit(1);
        if (mission.length === 0)
            return;
        const existing = await this.db
            .select()
            .from(schema.userMissions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userMissions.userId, userId), (0, drizzle_orm_1.eq)(schema.userMissions.guildId, guildId), (0, drizzle_orm_1.eq)(schema.userMissions.missionId, missionId)))
            .limit(1);
        if (existing.length === 0) {
            await this.db.insert(schema.userMissions).values({
                userId,
                guildId,
                missionId,
                currentValue: progressAmount,
                completed: false,
                startedAt: new Date(),
            });
        }
        else {
            const currentVal = typeof existing[0].currentValue === 'string' ? parseInt(existing[0].currentValue) : existing[0].currentValue;
            const newValue = Math.min(currentVal + progressAmount, mission[0].targetValue);
            const completed = newValue >= mission[0].targetValue;
            await this.db
                .update(schema.userMissions)
                .set({
                currentValue: newValue,
                completed,
                completedAt: completed ? new Date() : existing[0].completedAt,
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userMissions.userId, userId), (0, drizzle_orm_1.eq)(schema.userMissions.guildId, guildId), (0, drizzle_orm_1.eq)(schema.userMissions.missionId, missionId)));
            if (completed && !existing[0].completed) {
                if (mission[0].rewardBadgeId) {
                    await this.badgesService.awardBadge(userId, guildId, mission[0].rewardBadgeId);
                }
            }
        }
    }
    async completeMission(userId, guildId, missionId) {
        const mission = await this.db.select().from(schema.missions).where((0, drizzle_orm_1.eq)(schema.missions.missionId, missionId)).limit(1);
        if (mission.length === 0)
            return false;
        const existing = await this.db
            .select()
            .from(schema.userMissions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userMissions.userId, userId), (0, drizzle_orm_1.eq)(schema.userMissions.guildId, guildId), (0, drizzle_orm_1.eq)(schema.userMissions.missionId, missionId)))
            .limit(1);
        if (existing.length === 0 || existing[0].completed)
            return false;
        await this.db
            .update(schema.userMissions)
            .set({
            completed: true,
            completedAt: new Date(),
            currentValue: mission[0].targetValue,
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userMissions.userId, userId), (0, drizzle_orm_1.eq)(schema.userMissions.guildId, guildId), (0, drizzle_orm_1.eq)(schema.userMissions.missionId, missionId)));
        if (mission[0].rewardBadgeId) {
            await this.badgesService.awardBadge(userId, guildId, mission[0].rewardBadgeId);
        }
        return true;
    }
    async getUserMissions(userId, guildId) {
        return this.db
            .select({
            id: schema.userMissions.id,
            userId: schema.userMissions.userId,
            guildId: schema.userMissions.guildId,
            missionId: schema.userMissions.missionId,
            currentValue: schema.userMissions.currentValue,
            completed: schema.userMissions.completed,
            completedAt: schema.userMissions.completedAt,
            startedAt: schema.userMissions.startedAt,
            missionType: schema.missions.missionType,
            targetValue: schema.missions.targetValue,
            rewardCoins: schema.missions.rewardCoins,
            description: schema.missions.description,
        })
            .from(schema.userMissions)
            .innerJoin(schema.missions, (0, drizzle_orm_1.eq)(schema.userMissions.missionId, schema.missions.missionId))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userMissions.userId, userId), (0, drizzle_orm_1.eq)(schema.userMissions.guildId, guildId)))
            .orderBy((0, drizzle_orm_1.desc)(schema.userMissions.completedAt));
    }
    async getActiveMissions() {
        return this.db.select().from(schema.missions).orderBy(schema.missions.missionType);
    }
};
exports.MissionsService = MissionsService;
exports.MissionsService = MissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DRIZZLE)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase,
        badges_service_1.BadgesService])
], MissionsService);
//# sourceMappingURL=missions.service.js.map