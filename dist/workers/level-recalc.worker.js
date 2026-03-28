"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LevelRecalcWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelRecalcWorker = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const leveling_service_1 = require("../leveling/leveling.service");
let LevelRecalcWorker = LevelRecalcWorker_1 = class LevelRecalcWorker {
    constructor(levelingService) {
        this.levelingService = levelingService;
        this.logger = new common_1.Logger(LevelRecalcWorker_1.name);
    }
    async handleLevelRecalculation() {
        try {
            this.logger.debug('Starting level recalculation...');
            await this.levelingService.recalculateAllLevels();
            this.logger.debug('Level recalculation completed');
        }
        catch (error) {
            this.logger.error('Error during level recalculation:', error);
        }
    }
};
exports.LevelRecalcWorker = LevelRecalcWorker;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LevelRecalcWorker.prototype, "handleLevelRecalculation", null);
exports.LevelRecalcWorker = LevelRecalcWorker = LevelRecalcWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [leveling_service_1.LevelingService])
], LevelRecalcWorker);
//# sourceMappingURL=level-recalc.worker.js.map