import { Injectable } from '@nestjs/common';
import { SlashCommand, Context, SlashCommandContext } from 'necord';
import { AttachmentBuilder } from 'discord.js';
import { LevelingService } from '../../leveling/leveling.service';
import { SvgGeneratorService } from '../../utils/svg.generator';
import { ImageService } from '../../utils/image.service';

@Injectable()
export class LevelCommand {
  constructor(
    private levelingService: LevelingService,
    private svgGenerator: SvgGeneratorService,
    private imageService: ImageService,
  ) {}

  @SlashCommand({
    name: 'level',
    description: 'Confira seu nível e XP',
  })
  async onLevel(
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

      const cardSvg = this.svgGenerator.generateLevelCard(
        targetUser.username,
        level,
        xp,
        nextLevelXp,
        levelInfo.rank,
        coins,
      );

      const pngBuffer = await this.imageService.convertSvgToPng(cardSvg);

      const attachment = new AttachmentBuilder(pngBuffer, {
        name: 'level-card.png',
      });

      await interaction.editReply({ files: [attachment] });
    } catch (error) {
      console.error('Error in level command:', error);
      await interaction.editReply({
        content: 'Ocorreu um erro ao gerar seu card de nível. Tente novamente.',
      });
    }
  }
}




