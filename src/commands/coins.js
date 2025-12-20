import { SlashCommandBuilder } from 'discord.js';
import { getUser, createUser } from '../database.js';
import { createCoinsEmbed } from '../utils/embedGenerator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('coins')
    .setDescription('Mostra o saldo de PityCoins de um usuário')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuário para verificar (padrão: você)')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('usuario') || interaction.user;
    const guildId = interaction.guild.id;
    
    let userData = await getUser(targetUser.id, guildId);
    
    if (!userData) {
      userData = await createUser(targetUser.id, targetUser.username, guildId);
    }
    
    const embed = createCoinsEmbed({
      username: targetUser.username,
      avatarUrl: targetUser.displayAvatarURL(),
      coins: userData.coins
    });
    
    await interaction.reply({ embeds: [embed] });
  }
};
