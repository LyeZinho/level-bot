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
exports.ShopCommand = void 0;
const common_1 = require("@nestjs/common");
const necord_1 = require("necord");
const shop_service_1 = require("../../economy/shop.service");
const embed_generator_1 = require("../../utils/embed.generator");
let ShopCommand = class ShopCommand {
    constructor(shopService, embedGenerator) {
        this.shopService = shopService;
        this.embedGenerator = embedGenerator;
    }
    async onShop([interaction]) {
        await interaction.deferReply();
        try {
            const items = await this.shopService.getAllItems();
            if (!items || items.length === 0) {
                await interaction.editReply({
                    content: 'A loja está vazia no momento.',
                });
                return;
            }
            const embed = this.embedGenerator.createShopEmbed(items);
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            console.error('Error in shop command:', error);
            await interaction.editReply({
                content: 'Ocorreu um erro ao carregar a loja. Tente novamente.',
            });
        }
    }
};
exports.ShopCommand = ShopCommand;
__decorate([
    (0, necord_1.SlashCommand)({
        name: 'shop',
        description: 'Veja os itens disponíveis na loja',
    }),
    __param(0, (0, necord_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ShopCommand.prototype, "onShop", null);
exports.ShopCommand = ShopCommand = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [shop_service_1.ShopService,
        embed_generator_1.EmbedGeneratorService])
], ShopCommand);
//# sourceMappingURL=shop.command.js.map