import { createEmbed, Colors } from '../utils/embedGenerator.js';

export default {
  name: 'hora',
  aliases: ['time', 'horario', 'agora'],
  description: 'Mostra a hora atual',
  usage: '!hora',
  
  async execute(message, args) {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const dateString = now.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const embed = createEmbed({
      title: '🕐 Hora Atual',
      description: `**Data:** ${dateString}\n**Hora:** ${timeString}`,
      color: Colors.INFO,
      footer: 'Horário de Brasília (UTC-3)'
    });

    await message.reply({ embeds: [embed] });
  }
};