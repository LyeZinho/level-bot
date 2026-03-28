import { createEmbed, Colors } from '../utils/embedGenerator.js';

export default {
  name: 'calc',
  aliases: ['calculadora', 'calcular', 'math'],
  description: 'Calculadora simples',
  usage: '!calc <expressão>',
  
  async execute(message, args) {
    const expression = args.join(' ');
    
    if (!expression) {
      return message.reply('🧮 Você precisa fornecer uma expressão! Exemplo: `!calc 2+2` ou `!calc 10*5`');
    }

    try {
      // Avaliar expressão de forma segura (apenas operações básicas)
      const result = eval(expression.replace(/[^0-9+\-*/().\s]/g, ''));

      if (isNaN(result) || !isFinite(result)) {
        throw new Error('Resultado inválido');
      }

      const embed = createEmbed({
        title: '🧮 Calculadora',
        description: `**Expressão:** ${expression}\n**Resultado:** ${result}`,
        color: Colors.SUCCESS,
        footer: 'Cálculo realizado com sucesso!'
      });

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const embed = createEmbed({
        title: '❌ Erro no Cálculo',
        description: 'Expressão inválida. Use apenas números e operadores básicos (+, -, *, /).',
        color: Colors.ERROR,
        footer: 'Tente novamente!'
      });

      await message.reply({ embeds: [embed] });
    }
  }
};