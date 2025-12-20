import { addMessageXP, getUser } from '../database.js';
import { updateMissionProgress, incrementMissionProgress } from '../utils/badgeSystem.js';
import { triggerSeasonalEvent } from '../utils/seasonalEvents.js';

export default {
  name: 'messageCreate',
  async execute(message, client, userCooldowns) {
    if (message.author.bot) return;
    if (!message.guild) return;
    
    const userId = message.author.id;
    const guildId = message.guild.id;
    const now = Date.now();
    const prefix = process.env.PREFIX || '!';
    
    // Verificar se é um comando com prefixo
    if (message.content.startsWith(prefix)) {
      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();
      
      const command = client.prefixCommands.get(commandName) ||
                     client.prefixCommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
      
      if (command) {
        try {
          await command.execute(message, args);
          
          // Tentar disparar evento sazonal após comando
          await triggerSeasonalEvent(message);
        } catch (error) {
          console.error(`Erro ao executar comando ${commandName}:`, error);
          message.reply('❌ Ocorreu um erro ao executar este comando!');
        }
        return; // Não ganhar XP ao executar comandos
      }
    }
    
    // Cooldown de 60 segundos para ganhar XP
    const cooldownKey = `${userId}-${guildId}`;
    const lastMessage = userCooldowns.get(cooldownKey);
    
    if (lastMessage && (now - lastMessage) < 60000) {
      return; // Ainda em cooldown
    }
    
    userCooldowns.set(cooldownKey, now);
    
    // Ganhar entre 15 e 25 XP por mensagem
    const xpGain = Math.floor(Math.random() * 11) + 15;
    
    const result = await addMessageXP(userId, message.author.username, guildId, xpGain);
    
    // Atualizar progresso de missões
    const userData = await getUser(userId, guildId);
    if (userData) {
      await updateMissionProgress(userId, guildId, 'messages', userData.messages);
      await updateMissionProgress(userId, guildId, 'level', userData.level);
    }
    
    // Notificar se subiu de nível
    if (result.levelUp) {
      const levelUpMessages = [
        `🎉 Parabéns ${message.author}! Você subiu para o **Nível ${result.newLevel}**!`,
        `⬆️ ${message.author} alcançou o **Nível ${result.newLevel}**! Continue assim!`,
        `🌟 Level Up! ${message.author} agora é **Nível ${result.newLevel}**!`
      ];
      
      const randomMessage = levelUpMessages[Math.floor(Math.random() * levelUpMessages.length)];
      let notification = randomMessage;
      
      // Adicionar informação de XP ganho se houver boost
      if (result.multiplier > 1) {
        notification += `\n⚡ **Boost ${result.multiplier}x ativo!** (+${result.xpGained} XP)`;
      }
      
      message.channel.send(notification);
    }
    
    // Notificar se ganhou coins (silenciosamente, apenas em level up)
    if (result.coinsGained > 0 && result.levelUp) {
      message.channel.send(`💰 Você também ganhou **${result.coinsGained}** <:pitycoin:1448368905948102897> PityCoins!`);
    }
  }
};
