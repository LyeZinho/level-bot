import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { 
  getAllBadges, 
  getUserBadges, 
  giveUserBadge, 
  removeUserBadge,
  getBadgeByName 
} from '../utils/badgeSystem.js';
import { createEmbed, Colors } from '../utils/embedGenerator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('badge')
    .setDescription('Gerenciar badges de usuários (Admin)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('give')
        .setDescription('Dar uma badge a um usuário')
        .addUserOption(option =>
          option.setName('usuario')
            .setDescription('Usuário que receberá a badge')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('badge')
            .setDescription('Nome da badge')
            .setRequired(true)
            .setAutocomplete(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remover uma badge de um usuário')
        .addUserOption(option =>
          option.setName('usuario')
            .setDescription('Usuário que perderá a badge')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('badge')
            .setDescription('Nome da badge')
            .setRequired(true)
            .setAutocomplete(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Listar todas as badges disponíveis'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('user')
        .setDescription('Ver badges de um usuário')
        .addUserOption(option =>
          option.setName('usuario')
            .setDescription('Usuário para verificar')
            .setRequired(true))),
  
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const badges = await getAllBadges();
    
    const filtered = badges
      .filter(badge => badge.name.toLowerCase().includes(focusedValue.toLowerCase()))
      .slice(0, 25)
      .map(badge => ({
        name: `${badge.name} (${badge.badge_type})`,
        value: badge.name
      }));
    
    await interaction.respond(filtered);
  },
  
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    
    if (subcommand === 'give') {
      const targetUser = interaction.options.getUser('usuario');
      const badgeName = interaction.options.getString('badge');
      
      const badge = await getBadgeByName(badgeName);
      if (!badge) {
        return interaction.reply({
          content: '❌ Badge não encontrada!',
          flags: 64
        });
      }
      
      if (badge.badge_type === 'rank') {
        return interaction.reply({
          content: '❌ Badges de rank são automáticas e não podem ser dadas manualmente!',
          flags: 64
        });
      }
      
      const success = await giveUserBadge(targetUser.id, guildId, badge.badge_id);
      
      if (success) {
        const embed = createEmbed({
          title: '✅ Badge Concedida',
          description: `${targetUser} recebeu a badge **${badge.name}**!`,
          color: Colors.SUCCESS,
          thumbnail: targetUser.displayAvatarURL()
        });
        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply({
          content: '❌ Este usuário já possui essa badge!',
          flags: 64
        });
      }
    }
    
    else if (subcommand === 'remove') {
      const targetUser = interaction.options.getUser('usuario');
      const badgeName = interaction.options.getString('badge');
      
      const badge = await getBadgeByName(badgeName);
      if (!badge) {
        return interaction.reply({
          content: '❌ Badge não encontrada!',
          flags: 64
        });
      }
      
      await removeUserBadge(targetUser.id, guildId, badge.badge_id);
      
      const embed = createEmbed({
        title: '✅ Badge Removida',
        description: `A badge **${badge.name}** foi removida de ${targetUser}!`,
        color: Colors.WARNING,
        thumbnail: targetUser.displayAvatarURL()
      });
      await interaction.reply({ embeds: [embed] });
    }
    
    else if (subcommand === 'list') {
      const badges = await getAllBadges();
      
      if (badges.length === 0) {
        return interaction.reply({
          content: '❌ Nenhuma badge disponível!',
          flags: 64
        });
      }
      
      const rankBadges = badges.filter(b => b.badge_type === 'rank');
      const missionBadges = badges.filter(b => b.badge_type === 'mission');
      const eventBadges = badges.filter(b => b.badge_type === 'event');
      
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
      
      const embed = createEmbed({
        title: '📋 Todas as Badges Disponíveis',
        description,
        color: Colors.PRIMARY,
        footer: `Total: ${badges.length} badges`
      });
      
      await interaction.reply({ embeds: [embed] });
    }
    
    else if (subcommand === 'user') {
      const targetUser = interaction.options.getUser('usuario');
      const badges = await getUserBadges(targetUser.id, guildId);
      
      if (badges.length === 0) {
        return interaction.reply({
          content: `${targetUser} não possui nenhuma badge ainda!`,
          flags: 64
        });
      }
      
      let description = '';
      badges.forEach(badge => {
        const earnedDate = new Date(badge.earned_at).toLocaleDateString('pt-BR');
        description += `• **${badge.name}** - Conquista em ${earnedDate}\n`;
      });
      
      const embed = createEmbed({
        title: `📛 Badges de ${targetUser.username}`,
        description,
        color: Colors.PRIMARY,
        thumbnail: targetUser.displayAvatarURL(),
        footer: `Total: ${badges.length} badges`
      });
      
      await interaction.reply({ embeds: [embed] });
    }
  }
};
