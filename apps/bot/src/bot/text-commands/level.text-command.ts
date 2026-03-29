import { Injectable } from '@nestjs/common';
import { TextCommand, Context } from 'necord';
import { Message, AttachmentBuilder } from 'discord.js';
import { LevelingService } from '../../leveling/leveling.service';
import { SvgGeneratorService } from '../../utils/svg.generator';
import { ImageService } from '../../utils/image.service';

@Injectable()
export class LevelTextCommand {
  constructor(
    private levelingService: LevelingService,
    private svgGenerator: SvgGeneratorService,
    private imageService: ImageService,
  ) { }

  @TextCommand({
    name: 'level',
    description: 'Confira seu nível e XP',
  })
  async onLevel(
    @Context() message: Message,
  ): Promise<void> {
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

      const cardSvg = this.svgGenerator.generateLevelCard({
        username: targetUser.username,
        level,
        xp,
        rank: levelInfo.rank,
        progress: {
          current: xp,
          needed: nextLevelXp,
        },
        messages: levelInfo.user.messages || 0,
        voiceTime: levelInfo.user.voiceTime || 0,
        avatarURL: targetUser.displayAvatarURL({ extension: 'png', size: 256 }) || null,
      });

      const pngBuffer = await this.imageService.convertSvgToPng(cardSvg);

      const attachment = new AttachmentBuilder(pngBuffer, {
        name: 'level-card.png',
      });

      await message.reply({ files: [attachment] });
    } catch (error) {
      console.error('Error in level text command:', error);
      await message.reply('Ocorreu um erro ao gerar seu card de nível. Tente novamente.');
    }
  }

  @TextCommand({
    name: 'lvl',
    description: 'Alias para level',
  })
  async onLvl(
    @Context() message: Message,
  ): Promise<void> {
    return this.onLevel(message);
  }
}
