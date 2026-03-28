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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageCreateListener = void 0;
const common_1 = require("@nestjs/common");
const necord_1 = require("necord");
const leveling_service_1 = require("../../leveling/leveling.service");
const config_1 = require("@nestjs/config");
let MessageCreateListener = class MessageCreateListener {
    constructor(levelingService, configService) {
        this.levelingService = levelingService;
        this.configService = configService;
    }
    async onMessageCreate([message]) {
        if (message.author.bot || !message.guild || !message.guildId) {
            return;
        }
        const allowedGuildIds = this.configService.get('ALLOWED_GUILD_IDS')?.split(',') || [];
        if (!allowedGuildIds.includes(message.guildId)) {
            return;
        }
        try {
            const xpGain = Math.floor(Math.random() * 25) + 10;
            await this.levelingService.addMessageXP(message.author.id, message.author.username, message.guildId, xpGain);
        }
        catch (error) {
            console.error('Error in messageCreate listener:', error);
        }
    }
};
exports.MessageCreateListener = MessageCreateListener;
__decorate([
    (0, necord_1.On)('messageCreate'),
    __param(0, (0, necord_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], MessageCreateListener.prototype, "onMessageCreate", null);
exports.MessageCreateListener = MessageCreateListener = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [leveling_service_1.LevelingService,
        config_1.ConfigService])
], MessageCreateListener);
//# sourceMappingURL=message-create.listener.js.map