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

async function migrateBadges() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migração do sistema de badges...\n');
    
    // 1. Criar tabela de badges
    console.log('1️⃣ Criando tabela "badges"...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS badges (
        badge_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        image_path VARCHAR(255) NOT NULL,
        badge_type VARCHAR(50) NOT NULL, -- 'event', 'mission', 'rank'
        tier INTEGER DEFAULT 1, -- Para badges de rank (1-6)
        is_active BOOLEAN DEFAULT true,
        expires_at BIGINT, -- Timestamp para badges de evento
        created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
      )
    `);
    console.log('✅ Tabela "badges" criada!\n');
    
    // 2. Criar tabela de badges dos usuários
    console.log('2️⃣ Criando tabela "user_badges"...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(30) NOT NULL,
        guild_id VARCHAR(30) NOT NULL,
        badge_id INTEGER NOT NULL REFERENCES badges(badge_id) ON DELETE CASCADE,
        earned_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
        expires_at BIGINT, -- Para badges temporárias
        UNIQUE(user_id, guild_id, badge_id)
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_badges_user 
      ON user_badges(user_id, guild_id)
    `);
    console.log('✅ Tabela "user_badges" criada!\n');
    
    // 3. Criar tabela de missões
    console.log('3️⃣ Criando tabela "missions"...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS missions (
        mission_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        mission_type VARCHAR(50) NOT NULL, -- 'messages', 'voice_time', 'daily_streak', 'custom'
        target_value INTEGER NOT NULL, -- Valor alvo (ex: 100 mensagens)
        reward_badge_id INTEGER REFERENCES badges(badge_id) ON DELETE SET NULL,
        reward_coins INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        is_repeatable BOOLEAN DEFAULT false,
        expires_at BIGINT, -- Missão temporária (evento)
        created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
      )
    `);
    console.log('✅ Tabela "missions" criada!\n');
    
    // 4. Criar tabela de progresso das missões
    console.log('4️⃣ Criando tabela "user_missions"...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_missions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(30) NOT NULL,
        guild_id VARCHAR(30) NOT NULL,
        mission_id INTEGER NOT NULL REFERENCES missions(mission_id) ON DELETE CASCADE,
        current_value INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT false,
        completed_at BIGINT,
        started_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
        UNIQUE(user_id, guild_id, mission_id)
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_missions_user 
      ON user_missions(user_id, guild_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_missions_mission 
      ON user_missions(mission_id)
    `);
    console.log('✅ Tabela "user_missions" criada!\n');
    
    console.log('✅ Migração de badges concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateBadges();
