import dotenv from 'dotenv';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const appId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID || null;

if (!token || !appId) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID in .env');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

async function listCommands() {
  try {
    if (guildId) {
      console.log(`Listing guild (${guildId}) registered commands:`);
      const cmds = await rest.get(Routes.applicationGuildCommands(appId, guildId));
      console.log(cmds.map(c => `${c.name} (id: ${c.id})`).join('\n') || '(none)');
    } else {
      console.log('Listing global registered commands:');
      const cmds = await rest.get(Routes.applicationCommands(appId));
      console.log(cmds.map(c => `${c.name} (id: ${c.id})`).join('\n') || '(none)');
    }
  } catch (error) {
    console.error('Error listing commands:', error);
    process.exit(1);
  }
}

listCommands();
