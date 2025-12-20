import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, Colors } from '../utils/embedGenerator.js';

const responses = [
  "Sim, definitivamente!",
  "Não, de jeito nenhum!",
  "Talvez... quem sabe?",
  "Pergunte novamente mais tarde.",
  "Não conte com isso.",
  "Minhas fontes dizem que sim.",
  "Outlook não tão bom.",
  "Sinais apontam que sim.",
  "Muito duvidoso.",
  "Sem dúvida!",
  "Melhor não te dizer agora.",
  "As perspectivas são boas.",
  "Não posso prever agora.",
  "Provavelmente.",
  "Não é provável.",
  "Parece bom para mim!",
  "Você pode contar com isso.",
  "Resposta nebulosa, tente novamente.",
  "Concentre-se e pergunte novamente.",
  "Meus instintos dizem que não."
];

export default {
  data: new SlashCommandBuilder()
    .setName('bola8')
    .setDescription('Faça uma pergunta e receba uma resposta da bola 8 mágica')
    .addStringOption(option =>
      option.setName('pergunta')
        .setDescription('Sua pergunta para a bola 8')
        .setRequired(true)),

  async execute(interaction) {
    const question = interaction.options.getString('pergunta');
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const embed = createEmbed({
      title: '🔮 Bola 8 Mágica',
      description: `**Pergunta:** ${question}\n\n**Resposta:** ${randomResponse}`,
      color: Colors.INFO,
      footer: 'A bola 8 nunca erra!'
    });

    await interaction.reply({ embeds: [embed] });
  }
};