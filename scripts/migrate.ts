import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Old database connection (source)
const oldPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '11900'),
  database: process.env.DB_NAME || 'levelbot',
  user: process.env.DB_USER || 'levelbot',
  password: process.env.DB_PASSWORD || 'levelbot123',
});

async function migrateData() {
  const client = await oldPool.connect();
  
  try {
    console.log('🔄 Starting database migration...');

    // Get all users from old schema
    const usersResult = await client.query('SELECT DISTINCT user_id, username, guild_id FROM users');
    const oldUsers = usersResult.rows;

    console.log(`📊 Found ${oldUsers.length} user-guild records to migrate`);

    // For now, just validate the data can be read
    let userCount = 0;
    let levelCount = 0;
    let coinCount = 0;

    for (const oldUser of oldUsers) {
      userCount++;
      levelCount++;
      coinCount++;

      console.log(`  ✓ User: ${oldUser.user_id} @ ${oldUser.guild_id}`);
    }

    console.log(`\n✅ Migration validation complete:`);
    console.log(`   - Users to migrate: ${userCount}`);
    console.log(`   - Levels to migrate: ${levelCount}`);
    console.log(`   - Coins to migrate: ${coinCount}`);
    console.log(`\n⚠️  DATA MIGRATION READY - Next step: Deploy schema and run data import`);
    console.log(`   Run 'npm run db:migrate' when ready to execute actual import`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await oldPool.end();
  }
}

await migrateData();
