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
  name: 'bola8',
  aliases: ['8ball', 'bola8', 'magicball'],
  description: 'Faça uma pergunta e receba uma resposta da bola 8 mágica',
  usage: '!bola8 <pergunta>',
  
  async execute(message, args) {
    const question = args.join(' ');
    
    if (!question) {
      return message.reply('❓ Você precisa fazer uma pergunta! Exemplo: `!bola8 Será que vai chover hoje?`');
    }

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const embed = createEmbed({
      title: '🔮 Bola 8 Mágica',
      description: `**Pergunta:** ${question}\n\n**Resposta:** ${randomResponse}`,
      color: Colors.INFO,
      footer: 'A bola 8 nunca erra!'
    });

    await message.reply({ embeds: [embed] });
  }
};