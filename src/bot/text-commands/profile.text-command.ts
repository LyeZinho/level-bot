import { Injectable } from '@nestjs/common';
import { TextCommand, Context } from 'necord';
import { Message, AttachmentBuilder } from 'discord.js';
import { LevelingService } from '../../leveling/leveling.service';
import { BadgesService } from '../../badges/badges.service';
import { SvgGeneratorService } from '../../utils/svg.generator';
import { ImageService } from '../../utils/image.service';

@Injectable()
export class ProfileTextCommand {
  constructor(
    private levelingService: LevelingService,
    private badgesService: BadgesService,
    private svgGenerator: SvgGeneratorService,
    private imageService: ImageService,
  ) {}

  @TextCommand({
    name: 'profile',
    description: 'Veja seu perfil detalhado com estatísticas',
  })
  async onProfile(
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
      const userBadges = await this.badgesService.getUserBadges(userId, guildId);

      if (!levelInfo) {
        await message.reply(`${targetUser.username} ainda não tem XP.`);
        return;
      }

      const level = this.levelingService.calculateLevel(parseInt(levelInfo.user.xp));
      const xp = parseInt(levelInfo.user.xp);
      const coins = parseInt(levelInfo.user.coins);

      const cardSvg = this.svgGenerator.generateProfileCard(
        targetUser.username,
        level,
        xp,
        levelInfo.rank,
        coins,
        userBadges.length,
      );

      const pngBuffer = await this.imageService.convertSvgToPng(cardSvg);

      const attachment = new AttachmentBuilder(pngBuffer, {
        name: 'profile-card.png',
      });

      await message.reply({ files: [attachment] });
    } catch (error) {
      console.error('Error in profile text command:', error);
      await message.reply('Ocorreu um erro ao gerar o perfil. Tente novamente.');
    }
  }

  @TextCommand({
    name: 'perfil',
    description: 'Alias para profile em português',
  })
  async onPerfil(
    @Context() message: Message,
  ): Promise<void> {
    return this.onProfile(message);
  }

  @TextCommand({
    name: 'p',
    description: 'Alias curto para profile',
  })
  async onP(
    @Context() message: Message,
  ): Promise<void> {
    return this.onProfile(message);
  }
}
