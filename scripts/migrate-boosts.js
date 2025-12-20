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

async function migrateBoosts() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migração de boosts...\n');
    
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
    
    // Limpar itens antigos da loja (opcional)
    console.log('3️⃣ Limpando itens antigos da loja...');
    await client.query('DELETE FROM user_inventory');
    await client.query('DELETE FROM items');
    console.log('✅ Itens antigos removidos\n');
    
    console.log('✅ Migração concluída com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Execute: npm run seed');
    console.log('   2. Reinicie o bot: npm start');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    await pool.end();
    process.exit(1);
  }
}

migrateBoosts();
