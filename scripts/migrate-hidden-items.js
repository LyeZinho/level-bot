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

async function migrateHiddenItems() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migração para itens ocultos...\n');
    
    // Adicionar coluna hidden à tabela items
    console.log('1️⃣ Adicionando coluna "hidden" à tabela items...');
    await client.query(`
      ALTER TABLE items 
      ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE
    `);
    console.log('✅ Coluna "hidden" adicionada\n');
    
    // Marcar itens VIP como ocultos (preço = 0)
    console.log('2️⃣ Marcando itens VIP como ocultos...');
    const result = await client.query(`
      UPDATE items 
      SET hidden = TRUE 
      WHERE type = 'vip' OR price = 0
    `);
    console.log(`✅ ${result.rowCount} itens marcados como ocultos\n`);
    
    console.log('✅ Migração concluída com sucesso!\n');
    console.log('📝 Próximos passos:');
    console.log('1. Reinicie o bot: npm start');
    console.log('2. Teste a loja com: /shop');
    console.log('3. Itens VIP não devem aparecer na loja\n');
    
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    await pool.end();
    process.exit(1);
  }
}

migrateHiddenItems();
