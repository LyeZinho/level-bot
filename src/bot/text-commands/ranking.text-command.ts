import { Injectable } from '@nestjs/common';
import { TextCommand, Context } from 'necord';
import { Message, AttachmentBuilder } from 'discord.js';
import { LevelingService } from '../../leveling/leveling.service';
import { SvgGeneratorService } from '../../utils/svg.generator';
import { ImageService } from '../../utils/image.service';

@Injectable()
export class RankingTextCommand {
  constructor(
    private levelingService: LevelingService,
    private svgGenerator: SvgGeneratorService,
    private imageService: ImageService,
  ) {}

  @TextCommand({
    name: 'ranking',
    description: 'Veja o ranking de níveis do servidor',
  })
  async onRanking(
    @Context() message: Message,
  ): Promise<void> {
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

      const attachment = new AttachmentBuilder(pngBuffer, {
        name: 'ranking-card.png',
      });

      await message.reply({ files: [attachment] });
    } catch (error) {
      console.error('Error in ranking text command:', error);
      await message.reply('Ocorreu um erro ao gerar o ranking. Tente novamente.');
    }
  }

  @TextCommand({
    name: 'rank',
    description: 'Alias para ranking',
  })
  async onRank(
    @Context() message: Message,
  ): Promise<void> {
    return this.onRanking(message);
  }

  @TextCommand({
    name: 'top',
    description: 'Alias para ranking',
  })
  async onTop(
    @Context() message: Message,
  ): Promise<void> {
    return this.onRanking(message);
  }
}
