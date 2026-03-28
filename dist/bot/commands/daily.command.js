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
exports.DailyCommand = void 0;
const common_1 = require("@nestjs/common");
const necord_1 = require("necord");
const economy_service_1 = require("../../economy/economy.service");
const embed_generator_1 = require("../../utils/embed.generator");
let DailyCommand = class DailyCommand {
    constructor(economyService, embedGenerator) {
        this.economyService = economyService;
        this.embedGenerator = embedGenerator;
    }
    async onDaily([interaction]) {
        await interaction.deferReply();
        const userId = interaction.user.id;
        const guildId = interaction.guildId;
        if (!guildId) {
            await interaction.editReply({
                content: 'Este comando só funciona em servidores.',
            });
            return;
        }
        try {
            const result = await this.economyService.claimDaily(userId, guildId);
            if (!result.success) {
                if (result.reason === 'already_claimed') {
                    const hoursLeft = Math.ceil((result.timeLeft || 0) / (60 * 60 * 1000));
                    const embed = this.embedGenerator.createWarningEmbed('⏰ Recompensa Diária', `Você já reivindicou sua recompensa hoje. Tente novamente em **${hoursLeft}h**.`);
                    await interaction.editReply({ embeds: [embed] });
                    return;
                }
                throw new Error(result.reason);
            }
            const embed = this.embedGenerator.createSuccessEmbed('🎉 Recompensa Diária', `Parabéns! Você ganhou **${result.amount} PityCoins**!`);
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            console.error('Error in daily command:', error);
            await interaction.editReply({
                content: 'Ocorreu um erro ao reivindicar sua recompensa. Tente novamente.',
            });
        }
    }
};
exports.DailyCommand = DailyCommand;
__decorate([
    (0, necord_1.SlashCommand)({
        name: 'daily',
        description: 'Reivindique sua recompensa diária de PityCoins',
    }),
    __param(0, (0, necord_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], DailyCommand.prototype, "onDaily", null);
exports.DailyCommand = DailyCommand = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [economy_service_1.EconomyService,
        embed_generator_1.EmbedGeneratorService])
], DailyCommand);
//# sourceMappingURL=daily.command.js.map