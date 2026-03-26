import { getRanking } from '../database.js';
import { generateRankingImage } from '../utils/svgGenerator.js';
import { fetchImageAsDataUri } from '../utils/fetchImage.js';
import { svgToPng } from '../utils/convertSvg.js';
import { AttachmentBuilder } from 'discord.js';

export default {
  name: 'ranking',
  aliases: ['rank', 'top', 'leaderboard'],
  description: 'Mostra o ranking dos top 10 usuários do servidor',
  usage: '!ranking',
  
  async execute(message, args) {
    const guildId = message.guild.id;
    const ranking = await getRanking(guildId, 10);
    
    if (ranking.length === 0) {
      return message.reply('Ainda não há usuários no ranking!');
    }
    
    // Buscar dados dos usuários do Discord
    const enrichedRanking = await Promise.all(
      ranking.map(async (user, index) => {
        try {
          const discordUser = await message.client.users.fetch(user.user_id);
          const avatarDataUri = await fetchImageAsDataUri(discordUser.displayAvatarURL({ size: 64, extension: 'png' }));
          return {
            ...user,
            rank: index + 1,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatarURL: avatarDataUri
          };
        } catch (error) {
          return {
            ...user,
            rank: index + 1,
            username: user.username,
            discriminator: '0000',
            avatarURL: null
          };
        }
      })
    );
    
    const { svg, width: svgWidth, height: svgHeight } = generateRankingImage({
      guildName: message.guild.name,
      ranking: enrichedRanking
    });

    const pngBuffer = await svgToPng(svg, { width: svgWidth, height: svgHeight, quality: 90 });
    const attachment = new AttachmentBuilder(pngBuffer, { name: 'ranking.png' });
    
    await message.reply({
      files: [attachment]
    });
  }
};
