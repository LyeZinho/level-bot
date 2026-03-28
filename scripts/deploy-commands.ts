import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName('level')
    .setDescription('Confira seu nível e XP')
    .addUserOption(option =>
      option.setName('user').setDescription('Usuário para verificar nível').setRequired(false),
    ),

  new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Veja o ranking de níveis do servidor'),

  new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Veja seu perfil detalhado com estatísticas')
    .addUserOption(option =>
      option.setName('user').setDescription('Usuário para verificar perfil').setRequired(false),
    ),

  new SlashCommandBuilder()
    .setName('coins')
    .setDescription('Veja seu saldo de PityCoins')
    .addUserOption(option =>
      option.setName('user').setDescription('Usuário para verificar saldo').setRequired(false),
    ),

  new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Reivindique sua recompensa diária de PityCoins'),

  new SlashCommandBuilder()
    .setName('transfer')
    .setDescription('Transfira PityCoins para outro usuário')
    .addUserOption(option =>
      option.setName('user').setDescription('Usuário que receberá os coins').setRequired(true),
    )
    .addIntegerOption(option =>
      option.setName('amount').setDescription('Quantidade de coins').setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Veja os itens disponíveis na loja'),

  new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Veja seu inventário de itens')
    .addUserOption(option =>
      option.setName('user').setDescription('Usuário para verificar inventário').setRequired(false),
    ),

  new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Compre um item da loja')
    .addIntegerOption(option =>
      option.setName('item_id').setDescription('ID do item para comprar').setRequired(true),
    )
    .addIntegerOption(option =>
      option.setName('quantity').setDescription('Quantidade (padrão: 1)').setRequired(false),
    ),
].map(command => command.toJSON());

async function deployCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildIds = process.env.ALLOWED_GUILD_IDS?.split(',') || [];

  if (!token || !clientId) {
    console.error('Missing DISCORD_TOKEN or CLIENT_ID environment variables');
    process.exit(1);
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log(`Deploying ${commands.length} slash commands...`);

    for (const guildId of guildIds) {
      console.log(`\nDeploying to guild: ${guildId}`);
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );

      console.log(`✅ Successfully deployed ${(data as any[]).length} commands to guild ${guildId}`);
    }

    console.log('\n✅ All commands deployed successfully!');
  } catch (error) {
    console.error('Error deploying commands:', error);
    process.exit(1);
  }
}

deployCommands();
