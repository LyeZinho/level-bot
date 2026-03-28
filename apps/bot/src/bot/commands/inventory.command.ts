import { Injectable } from '@nestjs/common';
import { SlashCommand, Context, SlashCommandContext } from 'necord';
import { ShopService } from '../../economy/shop.service';
import { EmbedGeneratorService } from '../../utils/embed.generator';

@Injectable()
export class InventoryCommand {
  constructor(
    private shopService: ShopService,
    private embedGenerator: EmbedGeneratorService,
  ) {}

  @SlashCommand({
    name: 'inventory',
    description: 'Veja seu inventário de itens',
  })
  async onInventory(
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
      const inventory = await this.shopService.getUserInventory(userId, guildId);

      if (!inventory || inventory.length === 0) {
        await interaction.editReply({
          content: `${targetUser.username} não possui itens no inventário.`,
        });
        return;
      }

      const embed = this.embedGenerator.createInventoryEmbed(targetUser.username, inventory);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in inventory command:', error);
      await interaction.editReply({
        content: 'Ocorreu um erro ao carregar seu inventário. Tente novamente.',
      });
    }
  }
}
