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
var VipExpirationWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VipExpirationWorker = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const vip_service_1 = require("../vip/vip.service");
let VipExpirationWorker = VipExpirationWorker_1 = class VipExpirationWorker {
    constructor(vipService) {
        this.vipService = vipService;
        this.logger = new common_1.Logger(VipExpirationWorker_1.name);
    }
    async handleVipExpiration() {
        try {
            this.logger.debug('Starting VIP expiration cleanup...');
            const expiredVips = await this.vipService.getExpiredVips();
            for (const vip of expiredVips) {
                await this.vipService.deactivateVip(vip.userId, vip.guildId);
            }
            this.logger.debug(`Deactivated ${expiredVips.length} expired VIPs`);
        }
        catch (error) {
            this.logger.error('Error during VIP expiration cleanup:', error);
        }
    }
};
exports.VipExpirationWorker = VipExpirationWorker;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VipExpirationWorker.prototype, "handleVipExpiration", null);
exports.VipExpirationWorker = VipExpirationWorker = VipExpirationWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [vip_service_1.VipService])
], VipExpirationWorker);
//# sourceMappingURL=vip-expiration.worker.js.map