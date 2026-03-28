import { Injectable } from '@nestjs/common';
import { SlashCommand, Context, SlashCommandContext } from 'necord';
import { ShopService } from '../../economy/shop.service';
import { EmbedGeneratorService } from '../../utils/embed.generator';

@Injectable()
export class ShopCommand {
  constructor(
    private shopService: ShopService,
    private embedGenerator: EmbedGeneratorService,
  ) {}

  @SlashCommand({
    name: 'shop',
    description: 'Veja os itens disponíveis na loja',
  })
  async onShop(
    @Context() [interaction]: SlashCommandContext,
  ): Promise<void> {
    await interaction.deferReply();

    try {
      const items = await this.shopService.getAllItems();

      if (!items || items.length === 0) {
        await interaction.editReply({
          content: 'A loja está vazia no momento.',
        });
        return;
      }

      const embed = this.embedGenerator.createShopEmbed(items);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in shop command:', error);
      await interaction.editReply({
        content: 'Ocorreu um erro ao carregar a loja. Tente novamente.',
      });
    }
  }
}
