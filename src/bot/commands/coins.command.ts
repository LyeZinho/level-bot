import { Injectable } from '@nestjs/common';
import { SlashCommand, Context, SlashCommandContext } from 'necord';
import { EconomyService } from '../../economy/economy.service';
import { EmbedGeneratorService } from '../../utils/embed.generator';

@Injectable()
export class CoinsCommand {
  constructor(
    private economyService: EconomyService,
    private embedGenerator: EmbedGeneratorService,
  ) {}

  @SlashCommand({
    name: 'coins',
    description: 'Veja seu saldo de PityCoins',
  })
  async onCoins(
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
      const balance = await this.economyService.getBalance(userId, guildId);

      if (!balance) {
        await interaction.editReply({
          content: `${targetUser.username} tem 0 PityCoins.`,
        });
        return;
      }

      const embed = this.embedGenerator.createSuccessEmbed(
        `💰 Saldo de ${targetUser.username}`,
        `**PityCoins:** ${balance.coins}`,
      );

      embed.setThumbnail(targetUser.displayAvatarURL());

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in coins command:', error);
      await interaction.editReply({
        content: 'Ocorreu um erro ao buscar seu saldo. Tente novamente.',
      });
    }
  }
}
