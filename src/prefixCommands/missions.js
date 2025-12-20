import { getUserMissions } from '../utils/badgeSystem.js';
import { createEmbed, Colors } from '../utils/embedGenerator.js';

export default {
  name: 'missions',
  aliases: ['missoes', 'missões', 'mission', 'missiones'],
  description: 'Ver suas missões ativas e progresso',
  usage: '!missions [@usuario]',

  async execute(message, args) {
    const targetUser = message.mentions.users.first() || message.author;
    const guildId = message.guild.id;

    const missions = await getUserMissions(targetUser.id, guildId);

    if (!missions || missions.length === 0) {
      return await message.reply('❌ Nenhuma missão ativa no momento!');
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

    await message.reply({ embeds: [embed] });
  }
};

function createProgressBar(percentage) {
  const filledBlocks = Math.floor(percentage / 10);
  const emptyBlocks = 10 - filledBlocks;
  return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
}
