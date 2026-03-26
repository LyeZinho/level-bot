import { REST, Routes } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log(`📁 Encontrados ${commandFiles.length} arquivos de comando: ${commandFiles.join(', ')}`);

// Carregar comandos
for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  try {
    const command = await import(`file://${filePath}`);
    if (command.default?.data) {
      commands.push(command.default.data.toJSON());
      console.log(`✅ Comando preparado: ${command.default.data.name}`);
    } else {
      console.log(`⚠️ Comando ${file} não tem propriedade 'data'`);
    }
  } catch (error) {
    console.log(`❌ Erro ao carregar ${file}: ${error.message}`);
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Registrar comandos
try {
  console.log(`🔄 Registrando ${commands.length} comandos...`);
  
  // Registrar comandos globalmente (pode levar até 1 hora para aparecer)
  // Para desenvolvimento, use comandos de guild (instantâneo)
  if (process.env.GUILD_ID) {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Comandos registrados no servidor de teste!');
  } else {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Comandos registrados globalmente!');
  }
} catch (error) {
  console.error('❌ Erro ao registrar comandos:', error);
}
