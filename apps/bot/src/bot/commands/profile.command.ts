import { Injectable } from '@nestjs/common';
import { SlashCommand, Context, SlashCommandContext } from 'necord';
import { AttachmentBuilder } from 'discord.js';
import { LevelingService } from '../../leveling/leveling.service';
import { BadgesService } from '../../badges/badges.service';
import { SvgGeneratorService } from '../../utils/svg.generator';
import { ImageService } from '../../utils/image.service';

@Injectable()
export class ProfileCommand {
  constructor(
    private levelingService: LevelingService,
    private badgesService: BadgesService,
    private svgGenerator: SvgGeneratorService,
    private imageService: ImageService,
  ) { }

  @SlashCommand({
    name: 'profile',
    description: 'Veja seu perfil detalhado com estatísticas',
  })
  async onProfile(
    @Context() [interaction]: SlashCommandContext,
  ): Promise<void> {
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

      const nextLevelXp = this.levelingService.getXPForLevel(level + 1);

      const avatarUrl = targetUser.displayAvatarURL({ extension: 'png', size: 256 });
      const avatarDataUri = avatarUrl ? await this.imageService.fetchImageAsDataUri(avatarUrl) : null;

      const cardSvg = this.svgGenerator.generateProfileCard({
        username: targetUser.username,
        level,
        xp,
        rank: levelInfo.rank,
        progress: {
          current: xp,
          needed: nextLevelXp,
        },
        messages: levelInfo.user.messages || 0,
        voiceHours: Math.floor((levelInfo.user.voiceTime || 0) / 3600),
        voiceMinutes: Math.floor(((levelInfo.user.voiceTime || 0) % 3600) / 60),
        joinedAt: 0, // Not used in SVG visual
        avatarURL: avatarDataUri,
        badges: userBadges.map(b => ({ icon: b.badge.image_path || '' })),
      });

      const pngBuffer = await this.imageService.convertSvgToPng(cardSvg);

      const attachment = new AttachmentBuilder(pngBuffer, {
        name: 'profile-card.png',
      });

      await interaction.editReply({ files: [attachment] });
    } catch (error) {
      console.error('Error in profile command:', error);
      await interaction.editReply({
        content: 'Ocorreu um erro ao gerar o perfil. Tente novamente.',
      });
    }
  }
}
