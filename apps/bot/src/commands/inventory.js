import { SlashCommandBuilder } from 'discord.js';
import { getUser, createUser, getUserInventory } from '../database.js';
import { createInventoryEmbed } from '../utils/embedGenerator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Mostra seu inventário de itens')
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
    
    const inventory = await getUserInventory(targetUser.id, guildId);
    
    const embed = createInventoryEmbed({
      username: targetUser.username,
      avatarUrl: targetUser.displayAvatarURL(),
      items: inventory
    });
    
    await interaction.reply({ embeds: [embed] });
  }
};
