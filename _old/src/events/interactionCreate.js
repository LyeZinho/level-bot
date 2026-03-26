import { triggerSeasonalEvent } from '../utils/seasonalEvents.js';

export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;
    
    const command = client.commands.get(interaction.commandName);
    
    if (!command) return;
    
    try {
      await command.execute(interaction);
      
      // Tentar disparar evento sazonal após comando
      if (interaction.replied || interaction.deferred) {
        // Criar objeto similar a message para compatibilidade
        const pseudoMessage = {
          author: interaction.user,
          user: interaction.user,
          guild: interaction.guild,
          reply: async (options) => {
            return await interaction.followUp(options);
          }
        };
        
        await triggerSeasonalEvent(pseudoMessage);
      }
    } catch (error) {
      console.error(`Erro ao executar comando ${interaction.commandName}:`, error);
      const errorMessage = { 
        content: 'Ocorreu um erro ao executar este comando!', 
        flags: 64 
      };
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  }
};
