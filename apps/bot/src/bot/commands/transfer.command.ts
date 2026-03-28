import { Injectable } from '@nestjs/common';
import { SlashCommand, Context, SlashCommandContext } from 'necord';
import { EconomyService } from '../../economy/economy.service';
import { EmbedGeneratorService } from '../../utils/embed.generator';

@Injectable()
export class TransferCommand {
  constructor(
    private economyService: EconomyService,
    private embedGenerator: EmbedGeneratorService,
  ) {}

  @SlashCommand({
    name: 'transfer',
    description: 'Transfira PityCoins para outro usuário',
  })
  async onTransfer(
    @Context() [interaction]: SlashCommandContext,
  ): Promise<void> {
    await interaction.deferReply();

    const fromUserId = interaction.user.id;
    const toUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const guildId = interaction.guildId;

    if (!guildId || !toUser || !amount) {
      await interaction.editReply({
        content: 'Parâmetros inválidos.',
      });
      return;
    }

    if (toUser.id === fromUserId) {
      await interaction.editReply({
        content: 'Você não pode transferir coins para você mesmo.',
      });
      return;
    }

    if (amount <= 0) {
      await interaction.editReply({
        content: 'A quantia deve ser maior que 0.',
      });
      return;
    }

    try {
      const result = await this.economyService.transferCoins(fromUserId, toUser.id, guildId, amount);

      if (!result.success) {
        const embed = this.embedGenerator.createErrorEmbed(
          '❌ Transferência Falhou',
          result.reason === 'insufficient_funds'
            ? 'Você não tem PityCoins suficientes.'
            : 'Ocorreu um erro na transferência.',
        );
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const embed = this.embedGenerator.createSuccessEmbed(
        '✅ Transferência Realizada',
        `Você transferiu **${amount} PityCoins** para ${toUser.username}.`,
      );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in transfer command:', error);
      await interaction.editReply({
        content: 'Ocorreu um erro ao transferir coins. Tente novamente.',
      });
    }
  }
}
