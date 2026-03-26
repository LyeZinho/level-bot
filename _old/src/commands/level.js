import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { getUser, createUser, getUserRank, getXPProgress } from '../database.js';
import { fetchImageAsDataUri } from '../utils/fetchImage.js';
import { generateLevelCard } from '../utils/svgGenerator.js';
import { svgToPng } from '../utils/convertSvg.js';

export default {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Mostra o nível e XP de um usuário')
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
    
    const rank = await getUserRank(targetUser.id, guildId);
    const progress = getXPProgress(userData.xp);
    
    const avatarUrl = targetUser.displayAvatarURL({ size: 128, extension: 'png' });
    const avatarDataUri = await fetchImageAsDataUri(avatarUrl);

    const { svg, width: svgWidth, height: svgHeight } = generateLevelCard({
      username: targetUser.username,
      discriminator: targetUser.discriminator,
      avatarURL: avatarDataUri,
      level: userData.level,
      xp: userData.xp,
      rank: rank,
      progress: progress,
      messages: userData.messages,
      voiceTime: userData.voice_time
    });
    
    const pngBuffer = await svgToPng(svg, { width: svgWidth, height: svgHeight, quality: 90 });
    const attachment = new AttachmentBuilder(pngBuffer, { name: 'level-card.png' });
    
    await interaction.reply({
      files: [attachment]
    });
  }
};
