import { triggerSeasonalEvent, getActiveEvents } from '../utils/seasonalEvents.js';

export default {
  name: 'event-trigger',
  aliases: ['eventtrigger', 'testevent', 'forceevent'],
  description: 'Forçar disparo de evento sazonal para testes (Admin)',
  usage: '!event-trigger [event_id]',
  adminOnly: false,

  async execute(message, args) {
    // Verificar permissão
    const ALLOWED = '524622388629995541';
    if (message.author.id !== ALLOWED) {
      return message.reply('❌ Você não tem permissão para usar este comando.');
    }

    const activeEvents = getActiveEvents();

    if (activeEvents.length === 0) {
      return message.reply('❌ Nenhum evento sazonal ativo no momento!');
    }

    // Se especificou um event_id, usar esse; senão pega o primeiro ativo
    const eventId = args[0] || activeEvents[0].event_id;
    const event = activeEvents.find(e => e.event_id === eventId);

    if (!event) {
      const availableIds = activeEvents.map(e => e.event_id).join(', ');
      return message.reply(`❌ Evento "${eventId}" não encontrado ou não está ativo.\n\n**Eventos ativos:** ${availableIds}`);
    }

    await message.reply(`🔧 **Modo de Teste Ativado**\nDisparo forçado do evento: **${event.name}**\nChance: 100% (forçado)`);

    // Disparar evento com 100% de chance
    const triggered = await triggerSeasonalEvent(message, eventId, true);

    if (!triggered) {
      await message.reply('❌ Erro ao disparar evento.');
    }
  }
};
