import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, Colors } from '../utils/embedGenerator.js';

const jokes = [
  "Por que o computador foi ao médico? Porque estava com vírus!",
  "O que o pato falou para a pata? Vem quá!",
  "Por que a matemática é chata? Porque tem muitos problemas!",
  "O que é um pontinho preto no avião? Uma aeromosca!",
  "Por que o livro de matemática cometeu suicídio? Porque tinha muitos problemas!",
  "O que o zero disse para o oito? Belo cinto!",
  "Por que o tomate ficou vermelho? Porque viu a salada se vestindo!",
  "O que é um esqueleto voador? Um osso-planador!",
  "Por que o elefante não usa computador? Porque tem medo do mouse!",
  "O que o oceano disse para a praia? Nada, só acenou!"
];

export default {
  data: new SlashCommandBuilder()
    .setName('piada')
    .setDescription('Conta uma piada aleatória'),

  async execute(interaction) {
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

    const embed = createEmbed({
      title: '😂 Piada Aleatória',
      description: randomJoke,
      color: Colors.WARNING,
      footer: 'Divirta-se!'
    });

    await interaction.reply({ embeds: [embed] });
  }
};