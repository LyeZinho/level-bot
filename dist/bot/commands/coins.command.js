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
exports.CoinsCommand = void 0;
const common_1 = require("@nestjs/common");
const necord_1 = require("necord");
const economy_service_1 = require("../../economy/economy.service");
const embed_generator_1 = require("../../utils/embed.generator");
let CoinsCommand = class CoinsCommand {
    constructor(economyService, embedGenerator) {
        this.economyService = economyService;
        this.embedGenerator = embedGenerator;
    }
    async onCoins([interaction]) {
        await interaction.deferReply();
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const userId = targetUser.id;
        const guildId = interaction.guildId;
        if (!guildId) {
            await interaction.editReply({
                content: 'Este comando só funciona em servidores.',
            });
            return;
        }
        try {
            const balance = await this.economyService.getBalance(userId, guildId);
            if (!balance) {
                await interaction.editReply({
                    content: `${targetUser.username} tem 0 PityCoins.`,
                });
                return;
            }
            const embed = this.embedGenerator.createSuccessEmbed(`💰 Saldo de ${targetUser.username}`, `**PityCoins:** ${balance.coins}`);
            embed.setThumbnail(targetUser.displayAvatarURL());
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            console.error('Error in coins command:', error);
            await interaction.editReply({
                content: 'Ocorreu um erro ao buscar seu saldo. Tente novamente.',
            });
        }
    }
};
exports.CoinsCommand = CoinsCommand;
__decorate([
    (0, necord_1.SlashCommand)({
        name: 'coins',
        description: 'Veja seu saldo de PityCoins',
    }),
    __param(0, (0, necord_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], CoinsCommand.prototype, "onCoins", null);
exports.CoinsCommand = CoinsCommand = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [economy_service_1.EconomyService,
        embed_generator_1.EmbedGeneratorService])
], CoinsCommand);
//# sourceMappingURL=coins.command.js.map