import { PermissionFlagsBits } from 'discord.js';
import { giveVipItem } from '../database.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embedGenerator.js';

// Configuração dos tiers VIP
const VIP_TIERS = {
  gold: {
    name: 'Boost VIP Gold',
    multiplier: 2,
    duration: 30,
    emoji: '⚡'
  },
  platinum: {
    name: 'Boost VIP Platinum',
    multiplier: 3,
    duration: 30,
    emoji: '💎'
  },
  ruby: {
    name: 'Boost VIP Ruby',
    multiplier: 5,
    duration: 30,
    emoji: '💎'
  }
};

export default {
  name: 'vip-activate',
  aliases: ['vipactivate', 'vip-give', 'givevip'],
  description: 'Concede um item Boost VIP a um usuário (ADMIN APENAS)',
  usage: '!vip-activate @usuario <tier>',
  adminOnly: true,
  
  async execute(message, args) {
    // Verificar se o usuário tem permissão de Administrador
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      const errorEmbed = createErrorEmbed(
        'Sem Permissão',
        '❌ Você precisa ter permissão de **Administrador** para usar este comando.'
      );
      return message.reply({ embeds: [errorEmbed] });
    }

    // Verificar argumentos
    if (args.length < 2) {
      const errorEmbed = createErrorEmbed(
        'Uso Incorreto',
        `❌ Use: \`!vip-activate @usuario <tier>\`\n\n**Tiers disponíveis:**\n⚡ \`gold\` - 2x XP e Coins (30 dias)\n💎 \`platinum\` - 3x XP e Coins (30 dias)\n💎 \`ruby\` - 5x XP e Coins (30 dias)`
      );
      return message.reply({ embeds: [errorEmbed] });
    }

    // Pegar usuário mencionado
    const targetUser = message.mentions.users.first();
    if (!targetUser) {
      const errorEmbed = createErrorEmbed(
        'Usuário Não Encontrado',
        '❌ Você precisa mencionar um usuário válido.\n\n**Exemplo:** `!vip-activate @usuario gold`'
      );
      return message.reply({ embeds: [errorEmbed] });
    }

    // Verificar se não é bot
    if (targetUser.bot) {
      const errorEmbed = createErrorEmbed(
        'Usuário Inválido',
        '❌ Você não pode dar VIP para bots!'
      );
      return message.reply({ embeds: [errorEmbed] });
    }

    // Pegar tier
    const tier = args[1].toLowerCase();
    const vipConfig = VIP_TIERS[tier];

    if (!vipConfig) {
      const errorEmbed = createErrorEmbed(
        'Tier Inválido',
        `❌ Tier \`${tier}\` não existe.\n\n**Tiers disponíveis:**\n⚡ \`gold\` - 2x XP e Coins (30 dias)\n💎 \`platinum\` - 3x XP e Coins (30 dias)\n💎 \`ruby\` - 5x XP e Coins (30 dias)`
      );
      return message.reply({ embeds: [errorEmbed] });
    }

    const guildId = message.guild.id;

    try {
      // Dar o item VIP ao usuário
      await giveVipItem(targetUser.id, guildId, tier);

      // Embed de sucesso
      const successEmbed = createSuccessEmbed(
        'Boost VIP Concedido',
        `${vipConfig.emoji} **${vipConfig.name}** foi adicionado ao inventário de ${targetUser}!\n\n` +
        `**Multiplicador:** ${vipConfig.multiplier}x XP e Coins\n` +
        `**Duração:** ${vipConfig.duration} dias\n` +
        `**Ativação:** O usuário pode ativar com \`/use ${vipConfig.name}\`\n\n` +
        `✅ O Boost VIP só começará a contar após ser ativado pelo usuário.`
      );

      await message.reply({ embeds: [successEmbed] });

      // Tentar enviar DM para o usuário
      try {
        const dmEmbed = createSuccessEmbed(
          'Você Recebeu um Boost VIP!',
          `${vipConfig.emoji} **${vipConfig.name}** foi adicionado ao seu inventário no servidor **${message.guild.name}**!\n\n` +
          `**Multiplicador:** ${vipConfig.multiplier}x XP e Coins\n` +
          `**Duração:** ${vipConfig.duration} dias (após ativar)\n\n` +
          `📦 Para ativar, use: \`/use ${vipConfig.name}\` ou \`!use ${vipConfig.name}\`\n` +
          `📋 Veja seu inventário: \`/inventory\` ou \`!inv\`\n\n` +
          `⏰ **Importante:** O Boost VIP só começará a contar os ${vipConfig.duration} dias após você ativá-lo. Ative quando estiver pronto!`
          `! **Ao ativar, qualquer VIP ativo será substituído pelo novo, independentemente do tier.**`
        );

        await targetUser.send({ embeds: [dmEmbed] });
      } catch (dmError) {
        console.log(`⚠️ Não foi possível enviar DM para ${targetUser.tag}`);
        
        // Avisar no canal que o usuário precisa habilitar DMs
        const channelWarning = createErrorEmbed(
          'DM Não Enviada',
          `❌ Não foi possível enviar DM para ${targetUser}.\n\n` +
          `**Para receber instruções sobre como usar o Boost VIP, ${targetUser} precisa:**\n` +
          `1. Clicar com botão direito no nome do bot\n` +
          `2. Selecionar "Mensagem"\n` +
          `3. Habilitar "Permitir mensagens diretas de membros do servidor"\n\n` +
          `Ou usar \`/inventory\` para ver o item no inventário.`
        );
        await message.reply({ embeds: [channelWarning] });
      }

    } catch (error) {
      console.error('Erro ao dar VIP:', error);
      const errorEmbed = createErrorEmbed(
        'Erro',
        `❌ Ocorreu um erro ao conceder o VIP. Tente novamente.`
      );
      await message.reply({ embeds: [errorEmbed] });
    }
  }
};
