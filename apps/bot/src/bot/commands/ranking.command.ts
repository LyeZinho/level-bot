import { Injectable } from '@nestjs/common';
import { SlashCommand, Context, SlashCommandContext } from 'necord';
import { AttachmentBuilder } from 'discord.js';
import { LevelingService } from '../../leveling/leveling.service';
import { SvgGeneratorService } from '../../utils/svg.generator';
import { ImageService } from '../../utils/image.service';

@Injectable()
export class RankingCommand {
  constructor(
    private levelingService: LevelingService,
    private svgGenerator: SvgGeneratorService,
    private imageService: ImageService,
  ) { }

  @SlashCommand({
    name: 'ranking',
    description: 'Veja o ranking de níveis do servidor',
  })
  async onRanking(
    @Context() [interaction]: SlashCommandContext,
  ): Promise<void> {
    await interaction.deferReply();

    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.editReply({
        content: 'Este comando só funciona em servidores.',
      });
      return;
    }

    try {
      const ranking = await this.levelingService.getRanking(guildId, 10);

      if (!ranking || ranking.length === 0) {
        await interaction.editReply({
          content: 'Nenhum usuário com XP foi encontrado ainda.',
        });
        return;
      }

      const rankingData = await Promise.all(ranking.map(async (r, index) => {
        let discordUser = interaction.client.users.cache.get(r.userId);
        if (!discordUser) {
          try {
            discordUser = await interaction.client.users.fetch(r.userId);
          } catch (e) {
            // silent fail
          }
        }
        return {
          username: discordUser?.username || 'Desconhecido',
          level: this.levelingService.calculateLevel(parseInt(r.xp)),
          xp: parseInt(r.xp),
          rank: index + 1,
          avatarURL: discordUser?.displayAvatarURL({ extension: 'png', size: 128 }) || null
        };
      }));

      const cardSvg = this.svgGenerator.generateRankingCard({
        guildName: interaction.guild?.name || 'Servidor',
        ranking: rankingData
      });
      const pngBuffer = await this.imageService.convertSvgToPng(cardSvg);

      const attachment = new AttachmentBuilder(pngBuffer, {
        name: 'ranking-card.png',
      });

      await interaction.editReply({ files: [attachment] });
    } catch (error) {
      console.error('Error in ranking command:', error);
      await interaction.editReply({
        content: 'Ocorreu um erro ao gerar o ranking. Tente novamente.',
      });
    }
  }
}
