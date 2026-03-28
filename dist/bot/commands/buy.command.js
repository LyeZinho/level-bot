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
exports.BuyCommand = void 0;
const common_1 = require("@nestjs/common");
const necord_1 = require("necord");
const shop_service_1 = require("../../economy/shop.service");
const embed_generator_1 = require("../../utils/embed.generator");
let BuyCommand = class BuyCommand {
    constructor(shopService, embedGenerator) {
        this.shopService = shopService;
        this.embedGenerator = embedGenerator;
    }
    async onBuy([interaction]) {
        await interaction.deferReply();
        const userId = interaction.user.id;
        const guildId = interaction.guildId;
        const itemId = interaction.options.getInteger('item_id');
        const quantity = interaction.options.getInteger('quantity') || 1;
        if (!guildId || !itemId) {
            await interaction.editReply({
                content: 'Parâmetros inválidos.',
            });
            return;
        }
        if (quantity <= 0) {
            await interaction.editReply({
                content: 'A quantidade deve ser maior que 0.',
            });
            return;
        }
        try {
            const result = await this.shopService.buyItem(userId, guildId, itemId, quantity);
            if (!result.success) {
                const embed = this.embedGenerator.createErrorEmbed('❌ Compra Falhou', result.reason === 'insufficient_funds'
                    ? 'Você não tem PityCoins suficientes para essa compra.'
                    : result.reason === 'item_not_found'
                        ? 'Item não encontrado.'
                        : 'Ocorreu um erro na compra.');
                await interaction.editReply({ embeds: [embed] });
                return;
            }
            const embed = this.embedGenerator.createSuccessEmbed('✅ Compra Realizada', `Você comprou **${result.quantity}x ${result.item.name}** por **${result.totalCost} PityCoins**.`);
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            console.error('Error in buy command:', error);
            await interaction.editReply({
                content: 'Ocorreu um erro ao processar a compra. Tente novamente.',
            });
        }
    }
};
exports.BuyCommand = BuyCommand;
__decorate([
    (0, necord_1.SlashCommand)({
        name: 'buy',
        description: 'Compre um item da loja',
    }),
    __param(0, (0, necord_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], BuyCommand.prototype, "onBuy", null);
exports.BuyCommand = BuyCommand = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [shop_service_1.ShopService,
        embed_generator_1.EmbedGeneratorService])
], BuyCommand);
//# sourceMappingURL=buy.command.js.map