import { SlashCommandBuilder } from 'discord.js';
import { useItem, getItemByName } from '../database.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embedGenerator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('use')
    .setDescription('Usa um item do seu inventário')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Nome do item para usar')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    const itemName = interaction.options.getString('item');
    const guildId = interaction.guild.id;
    
    const item = await getItemByName(itemName);
    if (!item) {
      const embed = createErrorEmbed(
        'Item Não Encontrado',
        `Item "${itemName}" não encontrado!\n\nUse \`/inventory\` para ver seus itens.`
      );
      return interaction.reply({ embeds: [embed], flags: 64 });
    }
    
    const result = await useItem(interaction.user.id, guildId, item.item_id);
    
    if (!result.success) {
      if (result.reason === 'item_not_in_inventory') {
        const embed = createErrorEmbed(
          'Item Não Encontrado',
          `Você não possui "${item.name}" no seu inventário!`
        );
        return interaction.reply({ embeds: [embed], flags: 64 });
      }
      const embed = createErrorEmbed(
        'Erro',
        'Erro ao usar o item. Tente novamente mais tarde.'
      );
      return interaction.reply({ embeds: [embed], flags: 64 });
    }
    
    // Adicionar cargo VIP se for item VIP
    if (result.effect.type === 'vip') {
      const vipRoles = {
        gold: '1335433259114434681',
        platinum: '1363761681049845770',
        ruby: '1446749963236282520'
      };
      
      const member = interaction.member;
      const tier = result.effect.tier.toLowerCase();
      const newRoleId = vipRoles[tier];
      
      // Verificar se o usuário já tem o cargo do tier atual
      if (newRoleId && member.roles.cache.has(newRoleId)) {
        // Já tem o cargo, não mexer nos cargos
      } else {
        // Não tem o cargo, remover VIPs existentes e adicionar o novo
        for (const t of ['gold', 'platinum', 'ruby']) {
          const roleId = vipRoles[t];
          if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId);
          }
        }
        
        // Adicionar novo cargo VIP
        if (newRoleId) {
          await member.roles.add(newRoleId);
        }
      }
    }
    
    // Mensagem baseada no efeito do item
    let description = `Você usou **${result.item.emoji} ${result.item.name}**!\n\n`;
    
    if (result.effect.type === 'vip') {
      const daysLeft = Math.floor((result.effect.expires_at - Date.now()) / (1000 * 60 * 60 * 24));
      description += `🎉 **Boost VIP ${result.effect.tier.toUpperCase()} ativado!**\n\n`;
      description += `✨ Multiplicador: **${result.effect.multiplier}x** XP e Coins\n`;
      description += `⏰ Duração: **${daysLeft} dias**\n`;
      description += `📅 Expira em: <t:${Math.floor(result.effect.expires_at / 1000)}:F>\n\n`;
      description += `🎯 Todo XP e Coins serão multiplicados por ${result.effect.multiplier}!`;
    } else if (result.effect.type === 'boost') {
      const expiresInMinutes = Math.floor((result.effect.expiresAt - Date.now()) / 60000);
      description += `✨ **Boost de XP ${result.effect.multiplier}x ativado!**\n`;
      description += `⏰ Duração: ${expiresInMinutes} minutos\n`;
      description += `🎯 Todo XP ganho será multiplicado por ${result.effect.multiplier}!`;
    } else if (result.effect.type === 'xp_pack') {
      description += `📈 **+${result.effect.xp} XP**\n`;
      description += `💰 **+${result.effect.coins} PityCoins**`;
    }
    
    const embed = createSuccessEmbed('Item Usado', description);
    embed.setFooter({ text: 'O item foi removido do seu inventário' });
    
    await interaction.reply({ embeds: [embed] });
  }
};
