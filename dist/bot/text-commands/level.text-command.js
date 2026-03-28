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
exports.LevelTextCommand = void 0;
const common_1 = require("@nestjs/common");
const necord_1 = require("necord");
const discord_js_1 = require("discord.js");
const leveling_service_1 = require("../../leveling/leveling.service");
const svg_generator_1 = require("../../utils/svg.generator");
const image_service_1 = require("../../utils/image.service");
let LevelTextCommand = class LevelTextCommand {
    constructor(levelingService, svgGenerator, imageService) {
        this.levelingService = levelingService;
        this.svgGenerator = svgGenerator;
        this.imageService = imageService;
    }
    async onLevel(message) {
        const targetUser = message.mentions.users.first() || message.author;
        const userId = targetUser.id;
        const guildId = message.guildId;
        if (!guildId) {
            await message.reply('Este comando só funciona em servidores.');
            return;
        }
        try {
            const levelInfo = await this.levelingService.getLevelInfo(userId, guildId);
            if (!levelInfo) {
                await message.reply(`${targetUser.username} ainda não tem XP.`);
                return;
            }
            const level = this.levelingService.calculateLevel(parseInt(levelInfo.user.xp));
            const nextLevelXp = this.levelingService.getXPForLevel(level + 1);
            const xp = parseInt(levelInfo.user.xp);
            const coins = parseInt(levelInfo.user.coins);
            const cardSvg = this.svgGenerator.generateLevelCard(targetUser.username, level, xp, nextLevelXp, levelInfo.rank, coins);
            const pngBuffer = await this.imageService.convertSvgToPng(cardSvg);
            const attachment = new discord_js_1.AttachmentBuilder(pngBuffer, {
                name: 'level-card.png',
            });
            await message.reply({ files: [attachment] });
        }
        catch (error) {
            console.error('Error in level text command:', error);
            await message.reply('Ocorreu um erro ao gerar seu card de nível. Tente novamente.');
        }
    }
    async onLvl(message) {
        return this.onLevel(message);
    }
};
exports.LevelTextCommand = LevelTextCommand;
__decorate([
    (0, necord_1.TextCommand)({
        name: 'level',
        description: 'Confira seu nível e XP',
    }),
    __param(0, (0, necord_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [discord_js_1.Message]),
    __metadata("design:returntype", Promise)
], LevelTextCommand.prototype, "onLevel", null);
__decorate([
    (0, necord_1.TextCommand)({
        name: 'lvl',
        description: 'Alias para level',
    }),
    __param(0, (0, necord_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [discord_js_1.Message]),
    __metadata("design:returntype", Promise)
], LevelTextCommand.prototype, "onLvl", null);
exports.LevelTextCommand = LevelTextCommand = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [leveling_service_1.LevelingService,
        svg_generator_1.SvgGeneratorService,
        image_service_1.ImageService])
], LevelTextCommand);
//# sourceMappingURL=level.text-command.js.map