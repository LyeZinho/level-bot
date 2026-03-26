import { getAllItems } from '../database.js';
import { createShopEmbed } from '../utils/embedGenerator.js';

export default {
  name: 'shop',
  aliases: ['loja', 'store'],
  description: 'Mostra a loja de itens disponíveis',
  usage: '!shop',
  
  async execute(message, args) {
    const items = await getAllItems();
    
    if (items.length === 0) {
      return message.reply('🏪 A loja está vazia no momento. Volte mais tarde!');
    }
    
    const embed = createShopEmbed({ items });
    
    await message.reply({ embeds: [embed] });
  }
};
