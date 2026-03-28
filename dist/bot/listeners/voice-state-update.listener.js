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
exports.VoiceStateUpdateListener = void 0;
const common_1 = require("@nestjs/common");
const necord_1 = require("necord");
const leveling_service_1 = require("../../leveling/leveling.service");
const config_1 = require("@nestjs/config");
let VoiceStateUpdateListener = class VoiceStateUpdateListener {
    constructor(levelingService, configService) {
        this.levelingService = levelingService;
        this.configService = configService;
        this.voiceTimers = new Map();
    }
    async onVoiceStateUpdate([oldState, newState]) {
        if (!newState.guild || !newState.member || newState.member.user.bot) {
            return;
        }
        const allowedGuildIds = this.configService.get('ALLOWED_GUILD_IDS')?.split(',') || [];
        if (!allowedGuildIds.includes(newState.guild.id)) {
            return;
        }
        const minVoiceSeconds = this.configService.get('MIN_VOICE_SECONDS') || 60;
        const userKey = `${newState.member.id}:${newState.guild.id}`;
        if (!oldState.channel && newState.channel) {
            const timer = setTimeout(async () => {
                try {
                    const latestState = newState.member?.voice;
                    if (latestState?.channel && newState.member) {
                        await this.levelingService.addVoiceTime(newState.member.id, newState.member.user.username, newState.guild.id, minVoiceSeconds);
                    }
                }
                catch (error) {
                    console.error('Error adding voice time:', error);
                }
                this.voiceTimers.delete(userKey);
            }, minVoiceSeconds * 1000);
            this.voiceTimers.set(userKey, timer);
        }
        else if (oldState.channel && !newState.channel) {
            const timer = this.voiceTimers.get(userKey);
            if (timer) {
                clearTimeout(timer);
                this.voiceTimers.delete(userKey);
            }
        }
    }
};
exports.VoiceStateUpdateListener = VoiceStateUpdateListener;
__decorate([
    (0, necord_1.On)('voiceStateUpdate'),
    __param(0, (0, necord_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], VoiceStateUpdateListener.prototype, "onVoiceStateUpdate", null);
exports.VoiceStateUpdateListener = VoiceStateUpdateListener = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [leveling_service_1.LevelingService,
        config_1.ConfigService])
], VoiceStateUpdateListener);
//# sourceMappingURL=voice-state-update.listener.js.map