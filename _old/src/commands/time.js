import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, Colors } from '../utils/embedGenerator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('hora')
    .setDescription('Mostra a hora atual'),

  async execute(interaction) {
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

    await interaction.reply({ embeds: [embed] });
  }
};