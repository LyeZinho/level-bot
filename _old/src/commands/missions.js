import { SlashCommandBuilder } from 'discord.js';
import { getUserMissions } from '../utils/badgeSystem.js';
import { createEmbed, Colors } from '../utils/embedGenerator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('missions')
    .setDescription('Ver suas missões ativas e progresso')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Ver missões de outro usuário (opcional)')
        .setRequired(false)),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('usuario') || interaction.user;
    const guildId = interaction.guild.id;
    
    const missions = await getUserMissions(targetUser.id, guildId);
    
    if (missions.length === 0) {
      return interaction.reply({
        content: '❌ Nenhuma missão ativa no momento!',
        flags: 64
      });
    }
    
    let description = '';
    
    const activeMissions = missions.filter(m => !m.completed);
    const completedMissions = missions.filter(m => m.completed);
    
    if (activeMissions.length > 0) {
      description += '**📋 Missões Ativas**\n\n';
      activeMissions.forEach(mission => {
        const current = mission.current_value || 0;
        const progress = Math.floor((current / mission.target_value) * 100);
        const progressBar = createProgressBar(progress);
        
        description += `**${mission.name}**\n`;
        description += `${mission.description}\n`;
        description += `${progressBar} ${current}/${mission.target_value} (${progress}%)\n`;
        
        if (mission.reward_badge_id) {
          description += `🎖️ Recompensa: Badge`;
        }
        if (mission.reward_coins > 0) {
          const prefix = mission.reward_badge_id ? ' + ' : '💰 Recompensa: ';
          description += `${prefix}${mission.reward_coins} PityCoins`;
        }
        description += '\n\n';
      });
    }
    
    if (completedMissions.length > 0) {
      description += '**✅ Missões Completas**\n\n';
      completedMissions.forEach(mission => {
        const completedDate = new Date(mission.completed_at).toLocaleDateString('pt-BR');
        description += `• **${mission.name}** ✓ (${completedDate})\n`;
      });
    }
    
    const embed = createEmbed({
      title: `🎯 Missões de ${targetUser.username}`,
      description,
      color: Colors.PRIMARY,
      thumbnail: targetUser.displayAvatarURL(),
      footer: `${completedMissions.length}/${missions.length} missões completas`
    });
    
    await interaction.reply({ embeds: [embed] });
  }
};

function createProgressBar(percentage) {
  const filledBlocks = Math.floor(percentage / 10);
  const emptyBlocks = 10 - filledBlocks;
  return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
}
