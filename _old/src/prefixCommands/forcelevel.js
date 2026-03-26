import { getUser, createUser } from '../database.js';
import { updateRankBadge } from '../utils/badgeSystem.js';

export default {
  name: 'forcelevel',
  aliases: ['levelforce', 'up'],
  description: 'Força um level up para si mesmo ou outro usuário (somente tester)',
  usage: '!forcelevel [@usuario] [niveis]',
  adminOnly: false,

  async execute(message, args) {
    // somente user id autorizado
    const ALLOWED = '524622388629995541';
    if (message.author.id !== ALLOWED) {
      return message.reply('❌ Você não tem permissão para usar este comando.');
    }

    let target = message.mentions.users.first() || message.author;
    const levels = parseInt(args[1] || args[0]) || 1; // se usar !forcelevel 3 ou !forcelevel @user 3

    // se o primeiro arg for usuário, segundo pode ser levels
    if (args.length > 0 && message.mentions.users.size > 0 && args[1]) {
      // já definido target
    } else if (args.length > 0 && !message.mentions.users.size && !isNaN(parseInt(args[0]))) {
      // comando sem menção, apenas número
    }

    const guildId = message.guild.id;

    let userData = await getUser(target.id, guildId);
    if (!userData) {
      userData = await createUser(target.id, target.username, guildId);
    }

    // calcular novo nivel e xp
    const currentLevel = userData.level;
    const targetLevel = Math.max(1, currentLevel + Math.max(1, levels));
    const { forceSetLevel, getXPForLevel } = await import('../database.js');

    // atualizar via função do database
    const updatedUser = await forceSetLevel(target.id, guildId, targetLevel);

    // atualizar badge de rank
    await updateRankBadge(target.id, guildId, targetLevel);

    return message.reply(`✅ Forçado ${target.username} para o nível ${targetLevel} (XP setado: ${getXPForLevel(targetLevel)})`);
  }
};