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

async function migrateVips() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migração de VIPs...\n');
    
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
    
    console.log('✅ Migração de VIPs concluída com sucesso!\n');
    console.log('📋 Próximos passos:');
    console.log('1. Execute: npm run seed (para criar itens VIP na loja)');
    console.log('2. Execute: npm run deploy (para registrar comando /vip-activate)');
    console.log('3. Reinicie o bot: npm start\n');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateVips();
