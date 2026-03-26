import { SlashCommandBuilder } from 'discord.js';
import { getUser, createUser, buyItem, getItemByName } from '../database.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embedGenerator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Compra um item da loja')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Nome do item para comprar')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('quantidade')
        .setDescription('Quantidade para comprar (padrão: 1)')
        .setRequired(false)
        .setMinValue(1)
    ),
  
  async execute(interaction) {
    const itemName = interaction.options.getString('item');
    const quantity = interaction.options.getInteger('quantidade') || 1;
    const guildId = interaction.guild.id;
    
    let userData = await getUser(interaction.user.id, guildId);
    if (!userData) {
      userData = await createUser(interaction.user.id, interaction.user.username, guildId);
    }
    
    const item = await getItemByName(itemName);
    if (!item) {
      const embed = createErrorEmbed(
        'Item Não Encontrado',
        `Item "${itemName}" não encontrado na loja!\n\nUse \`/shop\` para ver os itens disponíveis.`
      );
      return interaction.reply({ embeds: [embed], flags: 64 });
    }
    
    const result = await buyItem(interaction.user.id, guildId, item.item_id, quantity);
    
    if (!result.success) {
      if (result.reason === 'insufficient_funds') {
        const embed = createErrorEmbed(
          'Saldo Insuficiente',
          `Você não tem PityCoins suficientes!\n\n**Custo total:** ${result.cost} coins\n**Seu saldo:** ${userData.coins} coins\n**Faltam:** ${result.cost - userData.coins} coins`
        );
        return interaction.reply({ embeds: [embed], flags: 64 });
      }
      const embed = createErrorEmbed(
        'Erro na Compra',
        'Erro ao comprar o item. Tente novamente mais tarde.'
      );
      return interaction.reply({ embeds: [embed], flags: 64 });
    }
    
    const embed = createSuccessEmbed(
      'Compra Realizada',
      `Você comprou **${quantity}x ${item.emoji} ${item.name}**!\n\n**Custo Total:** ${result.totalCost} <:pitycoin:1448368905948102897> PityCoins\n**Saldo Restante:** ${userData.coins - result.totalCost} coins`
    );
    embed.setFooter({ text: 'Use /inventory para ver seus itens' });
    
    await interaction.reply({ embeds: [embed] });
  }
};
