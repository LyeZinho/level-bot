import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { getRanking } from '../database.js';
import { fetchImageAsDataUri } from '../utils/fetchImage.js';
import { generateRankingImage } from '../utils/svgGenerator.js';
import { svgToPng } from '../utils/convertSvg.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Mostra o ranking dos top 10 usuários do servidor'),
  
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const ranking = await getRanking(guildId, 10);
    
    if (ranking.length === 0) {
      return interaction.reply('Ainda não há usuários no ranking!');
    }
    
    // Buscar dados dos usuários do Discord
    const enrichedRanking = await Promise.all(
      ranking.map(async (user, index) => {
        try {
          const discordUser = await interaction.client.users.fetch(user.user_id);
          const avatarDataUri = await fetchImageAsDataUri(discordUser.displayAvatarURL({ size: 64, extension: 'png' }));
          return {
            ...user,
            rank: index + 1,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatarURL: avatarDataUri
          };
        } catch (error) {
          const avatarDataUri = null;
          return {
            ...user,
            rank: index + 1,
            username: user.username,
            discriminator: '0000',
            avatarURL: avatarDataUri
          };
        }
      })
    );
    
    const { svg, width: svgWidth, height: svgHeight } = generateRankingImage({
      guildName: interaction.guild.name,
      ranking: enrichedRanking
    });

    const pngBuffer = await svgToPng(svg, { width: svgWidth, height: svgHeight, quality: 90 });
    const attachment = new AttachmentBuilder(pngBuffer, { name: 'ranking.png' });
    
    await interaction.reply({
      files: [attachment]
    });
  }
};
