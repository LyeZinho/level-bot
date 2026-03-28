import { Injectable } from '@nestjs/common';
import { SlashCommand, Context, SlashCommandContext } from 'necord';
import { ShopService } from '../../economy/shop.service';
import { EmbedGeneratorService } from '../../utils/embed.generator';

@Injectable()
export class BuyCommand {
  constructor(
    private shopService: ShopService,
    private embedGenerator: EmbedGeneratorService,
  ) {}

  @SlashCommand({
    name: 'buy',
    description: 'Compre um item da loja',
  })
  async onBuy(
    @Context() [interaction]: SlashCommandContext,
  ): Promise<void> {
    await interaction.deferReply();

    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    const itemId = interaction.options.getInteger('item_id');
    const quantity = interaction.options.getInteger('quantity') || 1;

    if (!guildId || !itemId) {
      await interaction.editReply({
        content: 'Parâmetros inválidos.',
      });
      return;
    }

    if (quantity <= 0) {
      await interaction.editReply({
        content: 'A quantidade deve ser maior que 0.',
      });
      return;
    }

    try {
      const result = await this.shopService.buyItem(userId, guildId, itemId, quantity);

      if (!result.success) {
        const embed = this.embedGenerator.createErrorEmbed(
          '❌ Compra Falhou',
          result.reason === 'insufficient_funds'
            ? 'Você não tem PityCoins suficientes para essa compra.'
            : result.reason === 'item_not_found'
              ? 'Item não encontrado.'
              : 'Ocorreu um erro na compra.',
        );
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const embed = this.embedGenerator.createSuccessEmbed(
        '✅ Compra Realizada',
        `Você comprou **${result.quantity}x ${result.item.name}** por **${result.totalCost} PityCoins**.`,
      );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in buy command:', error);
      await interaction.editReply({
        content: 'Ocorreu um erro ao processar a compra. Tente novamente.',
      });
    }
  }
}
