import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '11900'),
  database: process.env.DB_NAME || 'levelbot',
  user: process.env.DB_USER || 'levelbot',
  password: process.env.DB_PASSWORD || 'levelbot123',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Inicializar tabelas básicas do banco de dados
async function initDatabase(client) {
  console.log('🔄 Inicializando tabelas básicas do banco de dados...\n');

  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      messages INTEGER DEFAULT 0,
      voice_time INTEGER DEFAULT 0,
      last_message_at BIGINT DEFAULT 0,
      coins INTEGER DEFAULT 0,
      last_daily_claim BIGINT DEFAULT 0,
      created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      PRIMARY KEY (user_id, guild_id)
    );

    CREATE INDEX IF NOT EXISTS idx_guild_xp ON users(guild_id, xp DESC);
    CREATE INDEX IF NOT EXISTS idx_user_guild ON users(user_id, guild_id);
  `);

  console.log('✅ Tabelas básicas inicializadas\n');
}

// Migração 1: Sistema de Economia
async function migrateEconomy(client) {
  console.log('🔄 Iniciando migração do sistema de economia...\n');

  // As colunas coins e last_daily_claim já foram criadas na initDatabase
  // Criar tabela items (se não existir)
  console.log('1️⃣ Criando/verificando tabela "items"...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS items (
      item_id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      price INTEGER NOT NULL,
      emoji TEXT DEFAULT '📦',
      type TEXT DEFAULT 'consumable',
      hidden BOOLEAN DEFAULT FALSE,
      created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    )
  `);
  console.log('✅ Tabela "items" criada/verificada\n');

  // Criar tabela user_inventory
  console.log('2️⃣ Criando tabela "user_inventory"...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS user_inventory (
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      item_id INTEGER NOT NULL REFERENCES items(item_id),
      quantity INTEGER DEFAULT 1,
      acquired_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      PRIMARY KEY (user_id, guild_id, item_id)
    )
  `);
  console.log('✅ Tabela "user_inventory" criada\n');

  console.log('3️⃣ Criando índice para user_inventory...');
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_inventory_user
    ON user_inventory(user_id, guild_id)
  `);
  console.log('✅ Índice criado\n');
}

// Migração 2: Sistema de Boosts
async function migrateBoosts(client) {
  console.log('🔄 Iniciando migração do sistema de boosts...\n');

  // Criar tabela user_boosts
  console.log('1️⃣ Criando tabela "user_boosts"...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS user_boosts (
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      boost_type TEXT NOT NULL,
      multiplier FLOAT NOT NULL,
      expires_at BIGINT NOT NULL,
      created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      PRIMARY KEY (user_id, guild_id, boost_type)
    );
  `);
  console.log('✅ Tabela "user_boosts" criada\n');

  console.log('2️⃣ Criando índice para otimização...');
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_boosts_expiry ON user_boosts(user_id, guild_id, expires_at);
  `);
  console.log('✅ Índice criado\n');
}

// Migração 3: Sistema VIP
async function migrateVips(client) {
  console.log('🔄 Iniciando migração do sistema VIP...\n');

  // Criar tabela user_vips
  console.log('1️⃣ Criando tabela "user_vips"...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS user_vips (
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      vip_tier TEXT NOT NULL,
      multiplier FLOAT NOT NULL,
      role_id TEXT,
      activated_at BIGINT NOT NULL,
      expires_at BIGINT NOT NULL,
      created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
      PRIMARY KEY (user_id, guild_id)
    );
  `);
  console.log('✅ Tabela "user_vips" criada\n');

  // Criar índice para otimizar queries de expiração
  console.log('2️⃣ Criando índice em "expires_at"...');
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_user_vips_expires
    ON user_vips(expires_at);
  `);
  console.log('✅ Índice criado\n');
}

// Migração 4: Itens Ocultos
async function migrateHiddenItems(client) {
  console.log('🔄 Verificando sistema de itens ocultos...\n');

  // A coluna hidden já foi adicionada na criação da tabela items
  // Apenas marcar itens VIP como ocultos (preço = 0)
  console.log('1️⃣ Marcando itens VIP como ocultos...');
  const result = await client.query(`
    UPDATE items
    SET hidden = TRUE
    WHERE type = 'vip' OR price = 0
  `);
  console.log(`✅ ${result.rowCount} itens marcados como ocultos\n`);
}

// Função principal de migração
async function migrateAll() {
  const client = await pool.connect();

  try {
    console.log('🚀 Iniciando migração completa do banco de dados...\n');

    // Inicializar tabelas básicas
    await initDatabase(client);
    console.log('✅ Tabelas básicas inicializadas com sucesso!\n');

    // Executar migrações em sequência
    await migrateEconomy(client);
    console.log('✅ Sistema de economia migrado com sucesso!\n');

    await migrateBoosts(client);
    console.log('✅ Sistema de boosts migrado com sucesso!\n');

    await migrateVips(client);
    console.log('✅ Sistema VIP migrado com sucesso!\n');

    await migrateHiddenItems(client);
    console.log('✅ Sistema de itens ocultos configurado com sucesso!\n');

    console.log('🎉 Todas as migrações concluídas com sucesso!\n');
    console.log('📝 Próximos passos:');
    console.log('1. Execute: npm run seed (para popular a loja)');
    console.log('2. Execute: npm run deploy (para registrar comandos)');
    console.log('3. Execute: npm start (para iniciar o bot)\n');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar migração
migrateAll()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Migração falhou:', err);
    process.exit(1);
  });