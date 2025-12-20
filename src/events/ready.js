import { startLevelWorker } from '../jobs/levelWorker.js';
import { startVipWorker } from '../jobs/vipWorker.js';

export default {
  name: 'ready',
  once: true,
  async execute(client, userCooldowns, voiceTracking) {
    console.log(`🤖 Bot online como ${client.user.tag}!`);
    console.log(`📊 Servidores: ${client.guilds.cache.size}`);
    console.log(`⚙️ Prefixo: ${process.env.PREFIX || '!'}`);
    
    client.user.setActivity(`${process.env.PREFIX || '!'}help | /level`);
    
    // Start levels recalculation worker in background
    try {
      startLevelWorker(client, parseInt(process.env.LEVEL_RECALC_INTERVAL_MS || '300000'));
      console.log('🛠️ Level recalc worker started');
    } catch (error) {
      console.error('❌ Failed to start level recalc worker:', error);
    }
    
    // Start VIP expiration worker (check every 1 hour)
    try {
      startVipWorker(client, 60 * 60 * 1000);
      console.log('💎 VIP expiration worker started');
    } catch (error) {
      console.error('❌ Failed to start VIP worker:', error);
    }
    
    // Initialize voice tracking for users already in voice channels to avoid missed joins
    try {
      for (const guild of client.guilds.cache.values()) {
        for (const member of guild.members.cache.values()) {
          if (member.voice && member.voice.channelId) {
            voiceTracking.set(member.id, Date.now());
          }
        }
      }
      console.log('🟢 Voice tracking initialized for active members');
    } catch (err) {
      console.error('❌ Error initializing voice tracking:', err);
    }
  }
};
