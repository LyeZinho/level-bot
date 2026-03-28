import { Injectable } from '@nestjs/common';
import { SlashCommand, Context, SlashCommandContext } from 'necord';
import { LevelingService } from '../../leveling/leveling.service';
import { EmbedGeneratorService } from '../../utils/embed.generator';

@Injectable()
export class LevelCommand {
  constructor(
    private levelingService: LevelingService,
    private embedGenerator: EmbedGeneratorService,
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

      const embed = this.embedGenerator.createLevelEmbed(
        targetUser.username,
        level,
        xp,
        nextLevelXp,
        levelInfo.rank,
        coins,
      );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in level command:', error);
      await interaction.editReply({
        content: 'Ocorreu um erro ao buscar seu nível. Tente novamente.',
      });
    }
  }
}



