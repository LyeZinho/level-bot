import { getUserBadges } from '../utils/badgeSystem.js';
import { createEmbed, Colors } from '../utils/embedGenerator.js';

export default {
  name: 'mybadges',
  aliases: ['badges', 'minhasbadges', 'mbadges'],
  description: 'Ver suas badges conquistadas',
  usage: '!mybadges [@usuario]',

  async execute(message, args) {
    const targetUser = message.mentions.users.first() || message.author;
    const guildId = message.guild.id;

    const badges = await getUserBadges(targetUser.id, guildId);

    if (badges.length === 0) {
      return await message.reply(`${targetUser.id === message.author.id ? 'Você não possui' : `${targetUser.username} não possui`} nenhuma badge ainda! Complete missões e suba de nível para conquistar badges.`);
    }

    // Organizar badges por tipo
    const rankBadges = badges.filter(b => b.badge_type === 'rank');
    const missionBadges = badges.filter(b => b.badge_type === 'mission');
    const eventBadges = badges.filter(b => b.badge_type === 'event');

    let description = '';

    if (rankBadges.length > 0) {
      description += '**🏆 Badges de Rank**\n';
      rankBadges.forEach(badge => {
        let earnedDate = 'Desconhecida';
        if (badge.earned_at) {
          const d = new Date(Number(badge.earned_at));
          if (!isNaN(d)) earnedDate = d.toLocaleDateString('pt-BR');
        }
        description += `• **${badge.name}** - Tier ${badge.tier}\n  └ Conquistada em ${earnedDate}\n`;
      });
      description += '\n';
    }

    if (missionBadges.length > 0) {
      description += '**🎯 Badges de Missão**\n';
      missionBadges.forEach(badge => {
        const earnedDate = new Date(badge.earned_at).toLocaleDateString('pt-BR');
        description += `• **${badge.name}**\n  └ Conquistada em ${earnedDate}\n`;
      });
      description += '\n';
    }

    if (eventBadges.length > 0) {
      description += '**🎉 Badges de Evento**\n';
      eventBadges.forEach(badge => {
        const earnedDate = new Date(badge.earned_at).toLocaleDateString('pt-BR');
        let expiryText = '';
        if (badge.user_expires_at) {
          expiryText = ` (Expira: <t:${Math.floor(badge.user_expires_at / 1000)}:R>)`;
        }
        description += `• **${badge.name}**${expiryText}\n  └ Conquistada em ${earnedDate}\n`;
      });
    }

    const embed = createEmbed({
      title: `📛 Badges de ${targetUser.username}`,
      description,
      color: Colors.GOLD,
      thumbnail: targetUser.displayAvatarURL(),
      footer: `Total: ${badges.length} badges | Use !missions para ver suas missões`
    });

    await message.reply({ embeds: [embed] });
  }
};
