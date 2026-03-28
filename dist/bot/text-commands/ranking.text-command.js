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
exports.RankingTextCommand = void 0;
const common_1 = require("@nestjs/common");
const necord_1 = require("necord");
const discord_js_1 = require("discord.js");
const leveling_service_1 = require("../../leveling/leveling.service");
const svg_generator_1 = require("../../utils/svg.generator");
const image_service_1 = require("../../utils/image.service");
let RankingTextCommand = class RankingTextCommand {
    constructor(levelingService, svgGenerator, imageService) {
        this.levelingService = levelingService;
        this.svgGenerator = svgGenerator;
        this.imageService = imageService;
    }
    async onRanking(message) {
        const guildId = message.guildId;
        if (!guildId) {
            await message.reply('Este comando só funciona em servidores.');
            return;
        }
        try {
            const ranking = await this.levelingService.getRanking(guildId, 10);
            if (!ranking || ranking.length === 0) {
                await message.reply('Nenhum usuário com XP foi encontrado ainda.');
                return;
            }
            const cardSvg = this.svgGenerator.generateRankingCard(ranking);
            const pngBuffer = await this.imageService.convertSvgToPng(cardSvg);
            const attachment = new discord_js_1.AttachmentBuilder(pngBuffer, {
                name: 'ranking-card.png',
            });
            await message.reply({ files: [attachment] });
        }
        catch (error) {
            console.error('Error in ranking text command:', error);
            await message.reply('Ocorreu um erro ao gerar o ranking. Tente novamente.');
        }
    }
    async onRank(message) {
        return this.onRanking(message);
    }
    async onTop(message) {
        return this.onRanking(message);
    }
};
exports.RankingTextCommand = RankingTextCommand;
__decorate([
    (0, necord_1.TextCommand)({
        name: 'ranking',
        description: 'Veja o ranking de níveis do servidor',
    }),
    __param(0, (0, necord_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [discord_js_1.Message]),
    __metadata("design:returntype", Promise)
], RankingTextCommand.prototype, "onRanking", null);
__decorate([
    (0, necord_1.TextCommand)({
        name: 'rank',
        description: 'Alias para ranking',
    }),
    __param(0, (0, necord_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [discord_js_1.Message]),
    __metadata("design:returntype", Promise)
], RankingTextCommand.prototype, "onRank", null);
__decorate([
    (0, necord_1.TextCommand)({
        name: 'top',
        description: 'Alias para ranking',
    }),
    __param(0, (0, necord_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [discord_js_1.Message]),
    __metadata("design:returntype", Promise)
], RankingTextCommand.prototype, "onTop", null);
exports.RankingTextCommand = RankingTextCommand = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [leveling_service_1.LevelingService,
        svg_generator_1.SvgGeneratorService,
        image_service_1.ImageService])
], RankingTextCommand);
//# sourceMappingURL=ranking.text-command.js.map