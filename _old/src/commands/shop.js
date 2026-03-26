import { SlashCommandBuilder } from 'discord.js';
import { getAllItems } from '../database.js';
import { createShopEmbed } from '../utils/embedGenerator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Mostra a loja de itens disponíveis'),
  
  async execute(interaction) {
    const items = await getAllItems();
    
    if (items.length === 0) {
      return interaction.reply({ 
        content: '🏪 A loja está vazia no momento. Volte mais tarde!', 
        flags: 64 
      });
    }
    
    const embed = createShopEmbed({ items });
    
    await interaction.reply({ embeds: [embed] });
  }
};
