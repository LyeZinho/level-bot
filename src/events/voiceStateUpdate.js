const MIN_VOICE_SECONDS = parseInt(process.env.MIN_VOICE_SECONDS || '60', 10);
import { addVoiceTime, getUser } from '../database.js';
import { updateMissionProgress } from '../utils/badgeSystem.js';

export default {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client, voiceTracking) {
    // Resolve userId and guildId from either state (one could be null)
    const userId = (oldState && oldState.id) || (newState && newState.id);
    const guildId = (oldState && oldState.guild && oldState.guild.id) || (newState && newState.guild && newState.guild.id);
    
    // Usuário entrou em um canal de voz
    if (!oldState.channelId && newState.channelId) {
      // User joined voice
      console.log(`[voice] join ${userId} in guild ${guildId}`);
      voiceTracking.set(userId, Date.now());
    }
    
    // Usuário saiu de um canal de voz
    if (oldState.channelId && !newState.channelId) {
      // User left voice
      console.log(`[voice] leave ${userId} in guild ${guildId}`);
      const joinTime = voiceTracking.get(userId);
      
      if (joinTime) {
        const timeSpent = Math.floor((Date.now() - joinTime) / 1000); // em segundos
        voiceTracking.delete(userId);
        
        // Apenas contabilizar se passou mais de MIN_VOICE_SECONDS
        console.log(`[voice] timeSpent for ${userId}: ${timeSpent}s`);
        if (timeSpent >= MIN_VOICE_SECONDS) {
          try {
            const guild = oldState.guild;
            const member = await guild.members.fetch(userId);
            await addVoiceTime(userId, member.user.username, guildId, timeSpent);
            
            // Atualizar progresso de missões
            const userData = await getUser(userId, guildId);
            if (userData) {
              await updateMissionProgress(userId, guildId, 'voice_time', userData.voice_time);
            }
          } catch (error) {
            console.error('Erro ao adicionar tempo de voz:', error);
          }
        }
      }
    }
  }
};
