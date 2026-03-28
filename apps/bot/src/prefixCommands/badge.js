import { PermissionFlagsBits } from 'discord.js';
import { getAllBadges, getUserBadges, giveUserBadge, removeUserBadge, getBadgeByName } from '../utils/badgeSystem.js';
import { createEmbed, Colors } from '../utils/embedGenerator.js';

export default {
  name: 'badge',
  aliases: ['badges', 'badgeadmin'],
  description: 'Gerenciar badges de usuários (Admin)',
  usage: '!badge <give|remove|list|user> [@usuario] [nome da badge]',
  adminOnly: false,

  async execute(message, args) {
    const sub = (args[0] || '').toLowerCase();
    const guildId = message.guild.id;

    if (!sub || !['give', 'remove', 'list', 'user'].includes(sub)) {
      return message.reply(`Uso: ${this.usage}`);
    }

    // === GIVE ===
    if (sub === 'give') {
      const ALLOWED = '524622388629995541';
        if (message.author.id !== ALLOWED) {
        return message.reply('❌ Você não tem permissão para usar este comando.');
        }


      const target = message.mentions.users.first();
      if (!target) return message.reply('❌ Mencione o usuário que receberá a badge. Ex: `!badge give @user Nome da Badge`');

      const badgeName = args.slice(1 + (message.mentions.users.size > 0 ? 1 : 0)).join(' ') || args.slice(1).join(' ');
      if (!badgeName) return message.reply('❌ Informe o nome da badge.');

      const badge = await getBadgeByName(badgeName);
      if (!badge) return message.reply('❌ Badge não encontrada!');
      if (badge.badge_type === 'rank') return message.reply('❌ Badges de rank são automáticas e não podem ser dadas manualmente!');

      const existing = await getUserBadges(target.id, guildId);
      if (existing.find(b => b.badge_id === badge.badge_id)) {
        return message.reply('❌ Este usuário já possui essa badge!');
      }

      const success = await giveUserBadge(target.id, guildId, badge.badge_id);
      if (success) {
        const embed = createEmbed({
          title: '✅ Badge Concedida',
          description: `${target} recebeu a badge **${badge.name}**!`,
          color: Colors.SUCCESS,
          thumbnail: target.displayAvatarURL()
        });
        return message.reply({ embeds: [embed] });
      }

      return message.reply('❌ Falha ao dar a badge.');
    }

    // === REMOVE ===
    if (sub === 'remove') {
      const ALLOWED = '524622388629995541';
        if (message.author.id !== ALLOWED) {
        return message.reply('❌ Você não tem permissão para usar este comando.');
        }

      const target = message.mentions.users.first();
      if (!target) return message.reply('❌ Mencione o usuário que perderá a badge. Ex: `!badge remove @user Nome da Badge`');

      const badgeName = args.slice(1 + (message.mentions.users.size > 0 ? 1 : 0)).join(' ') || args.slice(1).join(' ');
      if (!badgeName) return message.reply('❌ Informe o nome da badge.');

      const badge = await getBadgeByName(badgeName);
      if (!badge) return message.reply('❌ Badge não encontrada!');

      await removeUserBadge(target.id, guildId, badge.badge_id);

      const embed = createEmbed({
        title: '✅ Badge Removida',
        description: `A badge **${badge.name}** foi removida de ${target}!`,
        color: Colors.WARNING,
        thumbnail: target.displayAvatarURL()
      });

      return message.reply({ embeds: [embed] });
    }

    // === LIST ===
    if (sub === 'list') {
      const badges = await getAllBadges();

      if (badges.length === 0) return message.reply('❌ Nenhuma badge disponível!');

      const rankBadges = badges.filter(b => b.badge_type === 'rank');
      const missionBadges = badges.filter(b => b.badge_type === 'mission');
      const eventBadges = badges.filter(b => b.badge_type === 'event');
      const uniqueBadges = badges.filter(b => b.badge_type === 'unique');

      let description = '';

      if (rankBadges.length > 0) {
        description += '**🏆 Badges de Rank**\n';
        rankBadges.forEach(badge => {
          description += `• **${badge.name}** (Tier ${badge.tier})\n`;
        });
        description += '\n';
      }

      if (missionBadges.length > 0) {
        description += '**🎯 Badges de Missão**\n';
        missionBadges.forEach(badge => {
          description += `• **${badge.name}**\n  └ ${badge.description}\n`;
        });
        description += '\n';
      }

      if (eventBadges.length > 0) {
        description += '**🎉 Badges de Evento**\n';
        eventBadges.forEach(badge => {
          const expires = badge.expires_at ? `(Expira: <t:${Math.floor(badge.expires_at / 1000)}:R>)` : '';
          description += `• **${badge.name}** ${expires}\n`;
        });
      }

        if (uniqueBadges.length > 0) {
        description += '**💎 Badges Únicas**\n';
        uniqueBadges.forEach(badge => {
          description += `• **${badge.name}**\n  └ ${badge.description}\n`;
        });
        description += '\n';
      }

      const embed = createEmbed({
        title: '📋 Todas as Badges Disponíveis',
        description,
        color: Colors.PRIMARY,
        footer: `Total: ${badges.length} badges`
      });

      return message.reply({ embeds: [embed] });
    }

    // === USER ===
    if (sub === 'user') {
      const target = message.mentions.users.first() || message.author;
      const badges = await getUserBadges(target.id, guildId);

      if (badges.length === 0) return message.reply(`${target.id === message.author.id ? 'Você' : target.username} não possui nenhuma badge ainda!`);

      let description = '';
      badges.forEach(badge => {
        let earnedDate = 'Desconhecida';
        if (badge.earned_at) {
          const d = new Date(Number(badge.earned_at));
          if (!isNaN(d)) earnedDate = d.toLocaleDateString('pt-BR');
        }
        description += `• **${badge.name}** - Conquistada em ${earnedDate}\n`;
      });

      const embed = createEmbed({
        title: `📛 Badges de ${target.username}`,
        description,
        color: Colors.PRIMARY,
        thumbnail: target.displayAvatarURL(),
        footer: `Total: ${badges.length} badges`
      });

      return message.reply({ embeds: [embed] });
    }
  }
};