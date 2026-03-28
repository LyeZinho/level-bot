import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getBadgeByName, giveUserBadge, getUserBadges } from './badgeSystem.js';
import { addCoins } from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EVENTS_FILE = path.join(__dirname, '../data/seasonal-events.json');
const userCooldowns = new Map(); // Armazena cooldowns por usuário

/**
 * Carregar eventos do arquivo JSON
 */
export function loadEvents() {
  try {
    if (!fs.existsSync(EVENTS_FILE)) {
      console.warn('⚠️ Arquivo de eventos sazonais não encontrado:', EVENTS_FILE);
      return { events: [] };
    }
    const data = fs.readFileSync(EVENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Erro ao carregar eventos sazonais:', error);
    return { events: [] };
  }
}

/**
 * Obter eventos ativos no momento
 */
export function getActiveEvents() {
  const { events } = loadEvents();
  const now = Date.now();
  
  return events.filter(event => {
    if (!event.active) return false;
    
    const startDate = new Date(event.start_date).getTime();
    const endDate = new Date(event.end_date).getTime();
    
    return now >= startDate && now <= endDate;
  });
}

/**
 * Verificar se um evento deve ser disparado (baseado na chance)
 * @param {string} eventId - ID do evento (opcional, pega qualquer ativo se não especificado)
 * @param {boolean} forceTrigger - Forçar disparo (100% chance) para testes
 * @returns {object|null} Evento a ser disparado ou null
 */
export function shouldTriggerEvent(eventId = null, forceTrigger = false) {
  const activeEvents = getActiveEvents();
  
  if (activeEvents.length === 0) return null;
  
  // Se eventId foi especificado, busca apenas esse evento
  const targetEvent = eventId 
    ? activeEvents.find(e => e.event_id === eventId)
    : activeEvents[Math.floor(Math.random() * activeEvents.length)];
  
  if (!targetEvent) return null;
  
  // Modo de teste: sempre dispara
  if (forceTrigger) return targetEvent;
  
  // Verifica chance de disparo
  const roll = Math.random();
  return roll < targetEvent.trigger_chance ? targetEvent : null;
}

/**
 * Verificar se usuário está em cooldown para um evento
 */
export function isUserOnCooldown(userId, eventId) {
  const key = `${userId}-${eventId}`;
  const lastTrigger = userCooldowns.get(key);
  
  if (!lastTrigger) return false;
  
  const { events } = loadEvents();
  const event = events.find(e => e.event_id === eventId);
  
  if (!event || !event.cooldown_per_user) return false;
  
  const timePassed = Date.now() - lastTrigger;
  return timePassed < event.cooldown_per_user;
}

/**
 * Registrar que usuário recebeu o evento (iniciar cooldown)
 */
export function setUserCooldown(userId, eventId) {
  const key = `${userId}-${eventId}`;
  userCooldowns.set(key, Date.now());
}

/**
 * Processar reação do evento e dar recompensas
 */
export async function processEventReaction(userId, guildId, eventId) {
  const { events } = loadEvents();
  const event = events.find(e => e.event_id === eventId);
  
  if (!event) {
    return { success: false, error: 'Evento não encontrado' };
  }
  
  const rewards = [];
  
  try {
    // Dar badge se especificada
    if (event.rewards.badge_name) {
      const badge = await getBadgeByName(event.rewards.badge_name);
      if (badge) {
        const success = await giveUserBadge(userId, guildId, badge.badge_id);
        if (success) {
          rewards.push(`🎖️ Badge: **${badge.name}**`);
        } else {
          rewards.push(`⚠️ Você já possui a badge **${badge.name}**`);
        }
      }
    }
    
    // Dar coins se especificado
    if (event.rewards.coins && event.rewards.coins > 0) {
      await addCoins(userId, guildId, event.rewards.coins);
      rewards.push(`💰 ${event.rewards.coins} PityCoins`);
    }
    
    // Dar items se especificados (implementar quando necessário)
    if (event.rewards.items && event.rewards.items.length > 0) {
      // TODO: Implementar entrega de items
      rewards.push(`📦 ${event.rewards.items.length} item(ns)`);
    }
    
    return {
      success: true,
      rewards,
      event
    };
  } catch (error) {
    console.error('❌ Erro ao processar recompensas do evento:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Disparar evento em uma mensagem
 * @param {object} message - Mensagem do Discord (ou interaction)
 * @param {string} eventId - ID do evento (opcional)
 * @param {boolean} forceTrigger - Forçar disparo
 * @returns {Promise<boolean>} True se evento foi disparado
 */
export async function triggerSeasonalEvent(message, eventId = null, forceTrigger = false) {
  const userId = message.author?.id || message.user?.id;
  const guildId = message.guild?.id;
  
  if (!userId || !guildId) return false;
  
  const event = shouldTriggerEvent(eventId, forceTrigger);
  if (!event) return false;
  
  // Verificar cooldown do usuário (exceto em modo forçado)
  if (!forceTrigger && isUserOnCooldown(userId, event.event_id)) {
    return false;
  }
  
  // Verificar se o usuário já completou este evento (já possui a badge)
  if (event.rewards.badge_name) {
    try {
      const userBadges = await getUserBadges(userId, guildId);
      const hasEventBadge = userBadges.some(badge => badge.name === event.rewards.badge_name);
      
      if (hasEventBadge) {
        console.log(`⭐ Usuário ${userId} já completou o evento '${event.event_id}' (já possui a badge '${event.rewards.badge_name}')`);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar badges do usuário:', error);
      // Continua mesmo com erro para não bloquear o evento
    }
  }
  
  try {
    // Enviar mensagem do evento
    const eventMessage = await message.reply({
      content: event.message,
      allowedMentions: { repliedUser: false }
    });
    
    // Adicionar reação
    await eventMessage.react(event.reaction_emoji);
    console.log(`✨ Evento '${event.event_id}' postado em guild ${guildId} (msg ${eventMessage.id})`);
    
    // Aguardar reação do usuário (filtro mais robusto para suportar variações de emoji)
    const filter = (reaction, user) => {
      if (user.id !== userId) return false;

      try {
        // emoji.id existe para emojis customizados, emoji.name para nome e emoji.toString() para unicodes
        const emojiString = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.toString();
        return emojiString === event.reaction_emoji || reaction.emoji.name === event.reaction_emoji;
      } catch (e) {
        return reaction.emoji.name === event.reaction_emoji;
      }
    };

    const timeout = event.reaction_timeout || 30000;

    try {
      const collected = await eventMessage.awaitReactions({ filter, max: 1, time: timeout, errors: ['time'] });
      const reaction = collected.first();

      console.log(`🎯 Evento '${event.event_id}' coletado por ${userId} com emoji '${reaction.emoji.name || reaction.emoji.toString()}'`);

      // Avisa o usuário imediatamente que a reação foi recebida
      await eventMessage.reply({
        content: event.error_message || `! Aconteceu algo inesperado... Contacte um administrador se o problema persistir.`,
        allowedMentions: { repliedUser: false }
      });

      const result = await processEventReaction(userId, guildId, event.event_id);

      if (result.success) {
        const rewardsText = result.rewards.join('\n');
        await eventMessage.reply({
          content: `✅ **Parabéns!** Você completou o evento **${event.name}**!\n\n**Recompensas:**\n${rewardsText}`,
          allowedMentions: { repliedUser: false }
        });

        // Registrar cooldown
        setUserCooldown(userId, event.event_id);
        console.log(`✅ Recompensas entregues a ${userId} para evento '${event.event_id}': ${result.rewards.join(', ')}`);
      } else {
        await eventMessage.reply({
          content: `❌ Erro ao processar recompensas: ${result.error}`,
          allowedMentions: { repliedUser: false }
        });
        console.error(`❌ Falha ao processar recompensas para ${userId} no evento '${event.event_id}': ${result.error}`);
      }
    } catch (err) {
      // Timeout ou erro. O discord.js às vezes rejeita com uma Collection vazia quando tempo expira.
      const isEmptyCollection = err && typeof err.size === 'number' && err.size === 0;
      const isTimeoutMessage = err && err.message && err.message.toLowerCase().includes('time');

      if (isEmptyCollection || isTimeoutMessage) {
        // Possível timeout. Antes de desistir, verificar reações já presentes (race condition).
        console.log(`⏰ Evento '${event.event_id}' possivelmente expirado para ${userId} (timeout). Verificando reações existentes...`);

        // Procurar reação que combine com o emoji do evento
        const reactionMatch = eventMessage.reactions.cache.find(r => {
          try {
            const emojiString = r.emoji.id ? `<:${r.emoji.name}:${r.emoji.id}>` : r.emoji.toString();
            return emojiString === event.reaction_emoji || r.emoji.name === event.reaction_emoji;
          } catch (e) {
            return r.emoji.name === event.reaction_emoji;
          }
        });

        if (reactionMatch) {
          try {
            await reactionMatch.users.fetch();
            if (reactionMatch.users.cache.has(userId)) {
              console.log(`🔁 Encontrada reação do usuário ${userId} em evento '${event.event_id}' após timeout; processando recompensas.`);

                //   await eventMessage.reply({
                //     content: `🔔 Reação recebida (detectada após timeout)! Processando suas recompensas...`,
                //     allowedMentions: { repliedUser: false }
                //   });

              const result = await processEventReaction(userId, guildId, event.event_id);

              if (result.success) {
                const rewardsText = result.rewards.join('\n');
                await eventMessage.reply({
                  content: `✅ **Parabéns!** Você completou o evento **${event.name}**!\n\n**Recompensas:**\n${rewardsText}`,
                  allowedMentions: { repliedUser: false }
                });

                setUserCooldown(userId, event.event_id);
                console.log(`✅ Recompensas entregues a ${userId} após verificação para evento '${event.event_id}': ${result.rewards.join(', ')}`);
                return true;
              } else {
                await eventMessage.reply({
                  content: `❌ Erro ao processar recompensas: ${result.error}`,
                  allowedMentions: { repliedUser: false }
                });
                console.error(`❌ Falha ao processar recompensas (após verificação) para ${userId} no evento '${event.event_id}': ${result.error}`);
                return true;
              }
            }
          } catch (e) {
            console.error('❌ Erro ao checar reações após timeout:', e);
          }
        }

        // Se não encontrou reação válida, enviar mensagem de timeout
        console.log(`⏰ Nenhuma reação válida encontrada para ${userId} no evento '${event.event_id}'`);
        await eventMessage.reply({
          content: `⏰ Tempo esgotado! A estrela desapareceu...`,
          allowedMentions: { repliedUser: false }
        });
      } else {
        await eventMessage.reply({
          content: `❌ Ocorreu um erro ao aguardar sua reação. Tente novamente mais tarde.`,
          allowedMentions: { repliedUser: false }
        });
        console.error('❌ Erro aguardando reação do evento:', err);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao disparar evento sazonal:', error);
    return false;
  }
}
