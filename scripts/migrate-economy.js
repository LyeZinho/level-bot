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

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migração do banco de dados...\n');
    
    // Adicionar colunas à tabela users
    console.log('1️⃣ Adicionando coluna "coins" à tabela users...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0
    `);
    console.log('✅ Coluna "coins" adicionada\n');
    
    console.log('2️⃣ Adicionando coluna "last_daily_claim" à tabela users...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_daily_claim BIGINT DEFAULT 0
    `);
    console.log('✅ Coluna "last_daily_claim" adicionada\n');
    
    // Criar tabela items
    console.log('3️⃣ Criando tabela "items"...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        item_id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        price INTEGER NOT NULL,
        emoji TEXT DEFAULT '📦',
        type TEXT DEFAULT 'consumable',
        created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
      )
    `);
    console.log('✅ Tabela "items" criada\n');
    
    // Criar tabela user_inventory
    console.log('4️⃣ Criando tabela "user_inventory"...');
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
    
    console.log('5️⃣ Criando índice para user_inventory...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_inventory_user 
      ON user_inventory(user_id, guild_id)
    `);
    console.log('✅ Índice criado\n');
    
    console.log('✅ Migração concluída com sucesso!');
    console.log('\n💡 Próximo passo: Execute "node seed-shop.js" para popular a loja com itens de exemplo.');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
