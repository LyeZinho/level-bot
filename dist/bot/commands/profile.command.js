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
exports.ProfileCommand = void 0;
const common_1 = require("@nestjs/common");
const necord_1 = require("necord");
const discord_js_1 = require("discord.js");
const leveling_service_1 = require("../../leveling/leveling.service");
const badges_service_1 = require("../../badges/badges.service");
const svg_generator_1 = require("../../utils/svg.generator");
const image_service_1 = require("../../utils/image.service");
let ProfileCommand = class ProfileCommand {
    constructor(levelingService, badgesService, svgGenerator, imageService) {
        this.levelingService = levelingService;
        this.badgesService = badgesService;
        this.svgGenerator = svgGenerator;
        this.imageService = imageService;
    }
    async onProfile([interaction]) {
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
            const levelInfo = await this.levelingService.getLevelInfo(userId, guildId);
            const userBadges = await this.badgesService.getUserBadges(userId, guildId);
            if (!levelInfo) {
                await interaction.editReply({
                    content: `${targetUser.username} ainda não tem XP.`,
                });
                return;
            }
            const level = this.levelingService.calculateLevel(parseInt(levelInfo.user.xp));
            const xp = parseInt(levelInfo.user.xp);
            const coins = parseInt(levelInfo.user.coins);
            const messages = levelInfo.user.messages;
            const voiceTime = levelInfo.user.voiceTime;
            const cardSvg = this.svgGenerator.generateProfileCard(targetUser.username, level, xp, levelInfo.rank, coins, userBadges.length);
            const pngBuffer = await this.imageService.convertSvgToPng(cardSvg);
            const attachment = new discord_js_1.AttachmentBuilder(pngBuffer, {
                name: 'profile-card.png',
            });
            await interaction.editReply({ files: [attachment] });
        }
        catch (error) {
            console.error('Error in profile command:', error);
            await interaction.editReply({
                content: 'Ocorreu um erro ao gerar o perfil. Tente novamente.',
            });
        }
    }
};
exports.ProfileCommand = ProfileCommand;
__decorate([
    (0, necord_1.SlashCommand)({
        name: 'profile',
        description: 'Veja seu perfil detalhado com estatísticas',
    }),
    __param(0, (0, necord_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ProfileCommand.prototype, "onProfile", null);
exports.ProfileCommand = ProfileCommand = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [leveling_service_1.LevelingService,
        badges_service_1.BadgesService,
        svg_generator_1.SvgGeneratorService,
        image_service_1.ImageService])
], ProfileCommand);
//# sourceMappingURL=profile.command.js.map