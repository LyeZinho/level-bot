import { SlashCommandBuilder } from 'discord.js';
import { getActiveBoost } from '../database.js';
import { createEmbed, Colors } from '../utils/embedGenerator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('boost')
    .setDescription('Mostra seu boost de XP ativo (se houver)'),
  
  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    
    const boost = await getActiveBoost(userId, guildId);
    
    if (!boost) {
      const embed = createEmbed({
        title: '⚡ Boost de XP',
        description: '❌ Você não possui nenhum boost ativo no momento.\n\nUse `/shop` para comprar boosts de XP e `/use` para ativá-los!',
        color: Colors.INFO
      });
      return interaction.reply({ embeds: [embed] });
    }
    
    const now = Date.now();
    const timeLeft = boost.expires_at - now;
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    const embed = createEmbed({
      title: '⚡ Boost de XP Ativo',
      description: `Você está com um boost de XP ativo!\n\n**Multiplicador:** ${boost.multiplier}x\n**Tempo restante:** ${hoursLeft}h ${minutesLeft}m\n\n🎯 Todo XP que você ganhar será multiplicado por ${boost.multiplier}!`,
      color: Colors.GOLD,
      thumbnail: interaction.user.displayAvatarURL(),
      footer: 'Continue ganhando XP para aproveitar ao máximo!'
    });
    
    await interaction.reply({ embeds: [embed] });
  }
};
