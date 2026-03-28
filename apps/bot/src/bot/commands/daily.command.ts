import { Injectable } from '@nestjs/common';
import { SlashCommand, Context, SlashCommandContext } from 'necord';
import { EconomyService } from '../../economy/economy.service';
import { EmbedGeneratorService } from '../../utils/embed.generator';

@Injectable()
export class DailyCommand {
  constructor(
    private economyService: EconomyService,
    private embedGenerator: EmbedGeneratorService,
  ) {}

  @SlashCommand({
    name: 'daily',
    description: 'Reivindique sua recompensa diária de PityCoins',
  })
  async onDaily(
    @Context() [interaction]: SlashCommandContext,
  ): Promise<void> {
    await interaction.deferReply();

    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.editReply({
        content: 'Este comando só funciona em servidores.',
      });
      return;
    }

    try {
      const result = await this.economyService.claimDaily(userId, guildId);

      if (!result.success) {
        if (result.reason === 'already_claimed') {
          const hoursLeft = Math.ceil((result.timeLeft || 0) / (60 * 60 * 1000));
          const embed = this.embedGenerator.createWarningEmbed(
            '⏰ Recompensa Diária',
            `Você já reivindicou sua recompensa hoje. Tente novamente em **${hoursLeft}h**.`,
          );
          await interaction.editReply({ embeds: [embed] });
          return;
        }
        throw new Error(result.reason);
      }

      const embed = this.embedGenerator.createSuccessEmbed(
        '🎉 Recompensa Diária',
        `Parabéns! Você ganhou **${result.amount} PityCoins**!`,
      );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in daily command:', error);
      await interaction.editReply({
        content: 'Ocorreu um erro ao reivindicar sua recompensa. Tente novamente.',
      });
    }
  }
}
