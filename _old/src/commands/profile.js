import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { getUser, createUser, getUserRank, getXPProgress, getActiveBoost } from '../database.js';
import { fetchImageAsDataUri } from '../utils/fetchImage.js';
import { generateProfileCard } from '../utils/svgGenerator.js';
import { svgToPng } from '../utils/convertSvg.js';
import { getUserBadges, loadBadgeImageAsDataUri, updateRankBadge } from '../utils/badgeSystem.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Função auxiliar para carregar imagem local como data URI
function loadLocalImageAsDataUri(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) return null;
    const buffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
    const base64 = buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Erro ao carregar imagem local:', error);
    return null;
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Mostra o perfil detalhado de um usuário')
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
    
    // Calcular tempo de voz em formato legível
    const voiceHours = Math.floor(userData.voice_time / 3600);
    const voiceMinutes = Math.floor((userData.voice_time % 3600) / 60);
    
    // Atualizar badge de rank baseado no nível
    await updateRankBadge(targetUser.id, guildId, userData.level);
    
    // Buscar badges do usuário no banco de dados
    const userBadges = await getUserBadges(targetUser.id, guildId);
    
    // Verificar se usuário tem boost VIP ativo e adicionar badge correspondente
    const activeBoost = await getActiveBoost(targetUser.id, guildId);
    let vipBadges = [];
    
    if (activeBoost) {
      const vipBadgeMap = {
        2: path.join(__dirname, '../../src/assets/goldvip.png'),
        3: path.join(__dirname, '../../src/assets/platinumvip.png'),
        5: path.join(__dirname, '../../src/assets/rubyvip.png')
      };
      
      const vipBadgePath = vipBadgeMap[activeBoost.multiplier];
      if (vipBadgePath) {
        const vipBadgeUri = loadLocalImageAsDataUri(vipBadgePath);
        if (vipBadgeUri) {
          vipBadges.push({ icon: vipBadgeUri });
        }
      }
    }
    
    // Converter badges para formato do SVG (máximo 6 badges)
    const regularBadges = userBadges.slice(0, 6 - vipBadges.length).map(badge => {
      const badgeUri = loadBadgeImageAsDataUri(badge.image_path);
      return badgeUri ? { icon: badgeUri } : null;
    }).filter(badge => badge !== null);
    
    // Combinar badges VIP (primeiro) com badges regulares
    const badges = [...vipBadges, ...regularBadges];
    
    const avatarUrl = targetUser.displayAvatarURL({ size: 256, extension: 'png' });
    const avatarDataUri = await fetchImageAsDataUri(avatarUrl);

    const { svg, width: svgWidth, height: svgHeight } = generateProfileCard({
      username: targetUser.username,
      discriminator: targetUser.discriminator,
      avatarURL: avatarDataUri,
      level: userData.level,
      xp: userData.xp,
      rank: rank,
      progress: progress,
      messages: userData.messages,
      voiceTime: userData.voice_time,
      voiceHours: voiceHours,
      voiceMinutes: voiceMinutes,
      joinedAt: userData.created_at,
      badges: badges
    });
    
    const pngBuffer = await svgToPng(svg, { width: svgWidth, height: svgHeight, quality: 90 });
    const attachment = new AttachmentBuilder(pngBuffer, { name: 'profile.png' });
    
    await interaction.reply({
      files: [attachment]
    });
  }
};
