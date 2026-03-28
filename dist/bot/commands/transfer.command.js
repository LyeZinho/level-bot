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
exports.TransferCommand = void 0;
const common_1 = require("@nestjs/common");
const necord_1 = require("necord");
const economy_service_1 = require("../../economy/economy.service");
const embed_generator_1 = require("../../utils/embed.generator");
let TransferCommand = class TransferCommand {
    constructor(economyService, embedGenerator) {
        this.economyService = economyService;
        this.embedGenerator = embedGenerator;
    }
    async onTransfer([interaction]) {
        await interaction.deferReply();
        const fromUserId = interaction.user.id;
        const toUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const guildId = interaction.guildId;
        if (!guildId || !toUser || !amount) {
            await interaction.editReply({
                content: 'Parâmetros inválidos.',
            });
            return;
        }
        if (toUser.id === fromUserId) {
            await interaction.editReply({
                content: 'Você não pode transferir coins para você mesmo.',
            });
            return;
        }
        if (amount <= 0) {
            await interaction.editReply({
                content: 'A quantia deve ser maior que 0.',
            });
            return;
        }
        try {
            const result = await this.economyService.transferCoins(fromUserId, toUser.id, guildId, amount);
            if (!result.success) {
                const embed = this.embedGenerator.createErrorEmbed('❌ Transferência Falhou', result.reason === 'insufficient_funds'
                    ? 'Você não tem PityCoins suficientes.'
                    : 'Ocorreu um erro na transferência.');
                await interaction.editReply({ embeds: [embed] });
                return;
            }
            const embed = this.embedGenerator.createSuccessEmbed('✅ Transferência Realizada', `Você transferiu **${amount} PityCoins** para ${toUser.username}.`);
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            console.error('Error in transfer command:', error);
            await interaction.editReply({
                content: 'Ocorreu um erro ao transferir coins. Tente novamente.',
            });
        }
    }
};
exports.TransferCommand = TransferCommand;
__decorate([
    (0, necord_1.SlashCommand)({
        name: 'transfer',
        description: 'Transfira PityCoins para outro usuário',
    }),
    __param(0, (0, necord_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], TransferCommand.prototype, "onTransfer", null);
exports.TransferCommand = TransferCommand = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [economy_service_1.EconomyService,
        embed_generator_1.EmbedGeneratorService])
], TransferCommand);
//# sourceMappingURL=transfer.command.js.map