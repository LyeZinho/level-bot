import { SlashCommandBuilder } from 'discord.js';
import { getUser, createUser, claimDaily } from '../database.js';
import { createDailyEmbed, createCooldownEmbed } from '../utils/embedGenerator.js';
import { incrementMissionProgress } from '../utils/badgeSystem.js';

export default {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Reivindica sua recompensa diária de 3 a 5 PityCoins'),
  
  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    
    let userData = await getUser(userId, guildId);
    
    if (!userData) {
      userData = await createUser(userId, interaction.user.username, guildId);
    }
    
    const result = await claimDaily(userId, guildId);
    
    // Atualizar progresso de missão de daily streak (simplificado)
    if (result.success) {
      await incrementMissionProgress(userId, guildId, 'daily_streak', 1);
    }
    
    if (!result.success) {
      if (result.reason === 'already_claimed') {
        const hoursLeft = Math.floor(result.timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((result.timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        const embed = createCooldownEmbed(hoursLeft, minutesLeft);
        return interaction.reply({ embeds: [embed], flags: 64 });
      }
    }
    
    const embed = createDailyEmbed(result.amount, userData.coins + result.amount);
    await interaction.reply({ embeds: [embed] });
  }
};
