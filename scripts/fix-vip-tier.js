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

async function fixVipTier() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Verificando estrutura da tabela user_vips...\n');
    
    // Verificar se a coluna vip_tier existe
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_vips' 
      AND column_name = 'vip_tier';
    `);
    
    if (checkColumn.rows.length === 0) {
      console.log('⚠️ Coluna "vip_tier" não encontrada. Adicionando...');
      
      // Adicionar coluna vip_tier
      await client.query(`
        ALTER TABLE user_vips 
        ADD COLUMN vip_tier TEXT NOT NULL DEFAULT 'gold';
      `);
      
      console.log('✅ Coluna "vip_tier" adicionada com sucesso!\n');
    } else {
      console.log('✅ Coluna "vip_tier" já existe!\n');
    }
    
    // Exibir estrutura atual da tabela
    console.log('📋 Estrutura atual da tabela user_vips:');
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'user_vips'
      ORDER BY ordinal_position;
    `);
    
    console.table(columns.rows);
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixVipTier();
