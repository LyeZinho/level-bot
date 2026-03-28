import { SlashCommandBuilder } from 'discord.js';
import { getUser, createUser, transferCoins } from '../database.js';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embedGenerator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('transfer')
    .setDescription('Transfere PityCoins para outro usuário')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuário que receberá as coins')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('quantidade')
        .setDescription('Quantidade de PityCoins para transferir')
        .setRequired(true)
        .setMinValue(1)
    ),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('usuario');
    const amount = interaction.options.getInteger('quantidade');
    const guildId = interaction.guild.id;
    
    if (targetUser.id === interaction.user.id) {
      const embed = createErrorEmbed(
        'Transferência Inválida',
        'Você não pode transferir coins para si mesmo!'
      );
      return interaction.reply({ embeds: [embed], flags: 64 });
    }
    
    if (targetUser.bot) {
      const embed = createErrorEmbed(
        'Transferência Inválida',
        'Você não pode transferir coins para bots!'
      );
      return interaction.reply({ embeds: [embed], flags: 64 });
    }
    
    let senderData = await getUser(interaction.user.id, guildId);
    if (!senderData) {
      senderData = await createUser(interaction.user.id, interaction.user.username, guildId);
    }
    
    let receiverData = await getUser(targetUser.id, guildId);
    if (!receiverData) {
      receiverData = await createUser(targetUser.id, targetUser.username, guildId);
    }
    
    const result = await transferCoins(interaction.user.id, targetUser.id, guildId, amount);
    
    if (!result.success) {
      if (result.reason === 'insufficient_funds') {
        const embed = createErrorEmbed(
          'Saldo Insuficiente',
          `Você não tem PityCoins suficientes!\n\nSaldo atual: **${senderData.coins}** coins`
        );
        return interaction.reply({ embeds: [embed], flags: 64 });
      }
    }
    
    const embed = createSuccessEmbed(
      'Transferência Realizada',
      `${interaction.user} transferiu **${amount}** <:pitycoin:1448368905948102897> PityCoins para ${targetUser}\n\n**${interaction.user.username}** - Novo saldo: **${senderData.coins - amount}** coins\n**${targetUser.username}** - Novo saldo: **${receiverData.coins + amount}** coins`
    );
    
    await interaction.reply({ embeds: [embed] });
  }
};
