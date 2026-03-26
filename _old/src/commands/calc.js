import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, Colors } from '../utils/embedGenerator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('calc')
    .setDescription('Calculadora simples')
    .addStringOption(option =>
      option.setName('expressao')
        .setDescription('Expressão matemática (ex: 2+2, 10*5, 100/4)')
        .setRequired(true)),

  async execute(interaction) {
    const expression = interaction.options.getString('expressao');

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

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const embed = createEmbed({
        title: '❌ Erro no Cálculo',
        description: 'Expressão inválida. Use apenas números e operadores básicos (+, -, *, /).',
        color: Colors.ERROR,
        footer: 'Tente novamente!'
      });

      await interaction.reply({ embeds: [embed] });
    }
  }
};