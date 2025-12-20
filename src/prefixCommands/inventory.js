import { getUser, createUser, getUserInventory } from '../database.js';
import { createInventoryEmbed } from '../utils/embedGenerator.js';

export default {
  name: 'inventory',
  aliases: ['inv', 'inventario', 'bag'],
  description: 'Mostra seu inventário de itens',
  usage: '!inventory [@usuario]',
  
  async execute(message, args) {
    const targetUser = message.mentions.users.first() || message.author;
    const guildId = message.guild.id;
    
    let userData = await getUser(targetUser.id, guildId);
    if (!userData) {
      userData = await createUser(targetUser.id, targetUser.username, guildId);
    }
    
    const inventory = await getUserInventory(targetUser.id, guildId);
    
    const embed = createInventoryEmbed({
      username: targetUser.username,
      avatarUrl: targetUser.displayAvatarURL(),
      items: inventory
    });
    
    await message.reply({ embeds: [embed] });
  }
};
