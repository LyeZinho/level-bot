import { getUser, createUser } from '../database.js';
import { createCoinsEmbed } from '../utils/embedGenerator.js';

export default {
  name: 'coins',
  aliases: ['balance', 'bal', 'moedas', 'saldo', 'coin', 'pitycoins'],
  description: 'Mostra o saldo de PityCoins de um usuário',
  usage: '!coins [@usuario]',
  
  async execute(message, args) {
    const targetUser = message.mentions.users.first() || message.author;
    const guildId = message.guild.id;
    
    let userData = await getUser(targetUser.id, guildId);
    
    if (!userData) {
      userData = await createUser(targetUser.id, targetUser.username, guildId);
    }
    
    const embed = createCoinsEmbed({
      username: targetUser.username,
      avatarUrl: targetUser.displayAvatarURL(),
      coins: userData.coins
    });
    
    await message.reply({ embeds: [embed] });
  }
};
