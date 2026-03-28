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
exports.LevelCommand = void 0;
const common_1 = require("@nestjs/common");
const necord_1 = require("necord");
const leveling_service_1 = require("../../leveling/leveling.service");
const embed_generator_1 = require("../../utils/embed.generator");
let LevelCommand = class LevelCommand {
    constructor(levelingService, embedGenerator) {
        this.levelingService = levelingService;
        this.embedGenerator = embedGenerator;
    }
    async onLevel([interaction]) {
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
            if (!levelInfo) {
                await interaction.editReply({
                    content: `${targetUser.username} ainda não tem XP.`,
                });
                return;
            }
            const level = this.levelingService.calculateLevel(parseInt(levelInfo.user.xp));
            const nextLevelXp = this.levelingService.getXPForLevel(level + 1);
            const xp = parseInt(levelInfo.user.xp);
            const coins = parseInt(levelInfo.user.coins);
            const embed = this.embedGenerator.createLevelEmbed(targetUser.username, level, xp, nextLevelXp, levelInfo.rank, coins);
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            console.error('Error in level command:', error);
            await interaction.editReply({
                content: 'Ocorreu um erro ao buscar seu nível. Tente novamente.',
            });
        }
    }
};
exports.LevelCommand = LevelCommand;
__decorate([
    (0, necord_1.SlashCommand)({
        name: 'level',
        description: 'Confira seu nível e XP',
    }),
    __param(0, (0, necord_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], LevelCommand.prototype, "onLevel", null);
exports.LevelCommand = LevelCommand = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [leveling_service_1.LevelingService,
        embed_generator_1.EmbedGeneratorService])
], LevelCommand);
//# sourceMappingURL=level.command.js.map