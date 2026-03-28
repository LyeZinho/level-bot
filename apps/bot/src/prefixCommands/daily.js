import { getUser, createUser, claimDaily } from '../database.js';
import { createDailyEmbed, createCooldownEmbed } from '../utils/embedGenerator.js';

export default {
  name: 'daily',
  aliases: ['diaria', 'diário'],
  description: 'Reivindica sua recompensa diária de 3 a 5 PityCoins',
  usage: '!daily',
  
  async execute(message, args) {
    const userId = message.author.id;
    const guildId = message.guild.id;
    
    let userData = await getUser(userId, guildId);
    
    if (!userData) {
      userData = await createUser(userId, message.author.username, guildId);
    }
    
    const result = await claimDaily(userId, guildId);
    
    if (!result.success) {
      if (result.reason === 'already_claimed') {
        const hoursLeft = Math.floor(result.timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((result.timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        const embed = createCooldownEmbed(hoursLeft, minutesLeft);
        return message.reply({ embeds: [embed] });
      }
    }
    
    const embed = createDailyEmbed(result.amount, userData.coins + result.amount);
    await message.reply({ embeds: [embed] });
  }
};
