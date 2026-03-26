import { EmbedBuilder } from 'discord.js';

export default {
  name: 'help',
  aliases: ['ajuda', 'h', 'comandos'],
  description: 'Mostra a lista de comandos disponíveis',
  usage: '!help [comando]',
  
  async execute(message, args) {
    const prefix = process.env.PREFIX || '!';
    
    if (args.length > 0) {
      // Ajuda específica de um comando
      const commandName = args[0].toLowerCase();
      const command = message.client.prefixCommands.get(commandName) ||
                     message.client.prefixCommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
      
      if (!command) {
        return message.reply(`Comando \`${commandName}\` não encontrado.`);
      }
      
      const embed = new EmbedBuilder()
        .setColor('#667eea')
        .setTitle(`📖 Ajuda: ${command.name}`)
        .setDescription(command.description || 'Sem descrição')
        .addFields(
          { name: 'Uso', value: command.usage || `${prefix}${command.name}`, inline: false }
        );
      
      if (command.aliases && command.aliases.length > 0) {
        embed.addFields({ name: 'Aliases', value: command.aliases.join(', '), inline: false });
      }
      
      return message.reply({ embeds: [embed] });
    }
    
    // Lista de todos os comandos
    const commands = message.client.prefixCommands;
    
    const embed = new EmbedBuilder()
      .setColor('#667eea')
      .setTitle('🤖 Comandos do Level Bot')
      .setDescription(`Use \`${prefix}help [comando]\` para mais informações sobre um comando específico.\n\n**Prefixo:** \`${prefix}\`\n**Slash Commands:** Use \`/\` para comandos slash`)
      .addFields(
        {
          name: '📊 Sistema de Níveis',
          value: commands.filter(cmd => ['level', 'ranking', 'profile'].includes(cmd.name))
            .map(cmd => `\`${prefix}${cmd.name}\` - ${cmd.description}`)
            .join('\n'),
          inline: false
        },
        {
          name: '💰 Economia',
          value: commands.filter(cmd => ['coins', 'daily', 'shop', 'inventory', 'transfer', 'buy', 'use'].includes(cmd.name))
            .map(cmd => `\`${prefix}${cmd.name}\` - ${cmd.description}`)
            .join('\n'),
          inline: false
        },
        {
          name: '🎉 Diversão',
          value: commands.filter(cmd => ['piada', 'bola8', 'roleta'].includes(cmd.name))
            .map(cmd => `\`${prefix}${cmd.name}\` - ${cmd.description}`)
            .join('\n'),
          inline: false
        },
        {
          name: '🛠️ Utilitários',
          value: commands.filter(cmd => ['calc', 'hora'].includes(cmd.name))
            .map(cmd => `\`${prefix}${cmd.name}\` - ${cmd.description}`)
            .join('\n'),
          inline: false
        },
        {
          name: '❓ Outros',
          value: `\`${prefix}help\` - Mostra esta mensagem de ajuda\n` +
                 commands.filter(cmd => ['vip', 'vip-activate', 'boost'].includes(cmd.name))
                   .map(cmd => `\`${prefix}${cmd.name}\` - ${cmd.description}`)
                   .join('\n'),
          inline: false
        }
      )
      .setFooter({ text: 'Você também pode usar os comandos com / (slash commands)' })
      .setTimestamp();
    
    await message.reply({ embeds: [embed] });
  }
};
