import { getUser, createUser, getUserRank, getXPProgress } from '../database.js';
import { generateLevelCard } from '../utils/svgGenerator.js';
import { svgToPng } from '../utils/convertSvg.js';
import { fetchImageAsDataUri } from '../utils/fetchImage.js';
import { AttachmentBuilder } from 'discord.js';

export default {
  name: 'level',
  aliases: ['lvl', 'nivel'],
  description: 'Mostra o nível e XP de um usuário',
  usage: '!level [@usuario]',
  
  async execute(message, args) {
    const targetUser = message.mentions.users.first() || message.author;
    const guildId = message.guild.id;
    
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
    
    await message.reply({
      files: [attachment]
    });
  }
};
