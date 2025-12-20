import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializar o cliente Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers
  ]
});

// ==================== CARREGAR COMANDOS ====================

// Carregar slash commands
client.commands = new Collection();
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  if (command.default?.data && command.default?.execute) {
    client.commands.set(command.default.data.name, command.default);
    console.log(`✅ Slash command carregado: ${command.default.data.name}`);
  }
}

// Carregar prefix commands
client.prefixCommands = new Collection();
const prefixCommandsPath = join(__dirname, 'prefixCommands');
const prefixCommandFiles = readdirSync(prefixCommandsPath).filter(file => file.endsWith('.js'));

for (const file of prefixCommandFiles) {
  const filePath = join(prefixCommandsPath, file);
  const command = await import(`file://${filePath}`);
  if (command.default?.name && command.default?.execute) {
    client.prefixCommands.set(command.default.name, command.default);
    console.log(`✅ Prefix command carregado: ${command.default.name}`);
  }
}

// ==================== CARREGAR EVENTOS ====================

// Maps compartilhados entre eventos
const userCooldowns = new Map();
const voiceTracking = new Map();

const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = join(eventsPath, file);
  const event = await import(`file://${filePath}`);
  
  if (event.default?.name && event.default?.execute) {
    if (event.default.once) {
      client.once(event.default.name, (...args) => 
        event.default.execute(...args, client, userCooldowns, voiceTracking)
      );
    } else {
      client.on(event.default.name, (...args) => 
        event.default.execute(...args, client, userCooldowns, voiceTracking)
      );
    }
    console.log(`✅ Event handler carregado: ${event.default.name}`);
  }
}

// ==================== LOGIN ====================

client.login(process.env.DISCORD_TOKEN);
