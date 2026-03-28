import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { exec } from 'child_process';
import path from 'path';
import { createEmbed, Colors } from '../utils/embedGenerator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('backup')
    .setDescription('Cria um backup da database (Admin apenas)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const backupScript = path.join(process.cwd(), 'scripts', 'backup-database.js');

    exec(`node "${backupScript}" backup`, { cwd: process.cwd() }, async (error, stdout, stderr) => {
      if (error) {
        const errorEmbed = createEmbed(
          'Erro ao fazer Backup',
          `❌ Ocorreu um erro ao tentar fazer o backup:\n\`\`\`${error.message}\`\`\``,
          Colors.Red
        );
        return interaction.editReply({ embeds: [errorEmbed] });
      }

      const successEmbed = createEmbed(
        'Backup Concluído',
        '✅ Backup realizado com sucesso!',
        Colors.Green
      );
      return interaction.editReply({ embeds: [successEmbed] });
    });
  }
};
