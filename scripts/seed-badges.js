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

async function seedBadges() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Populando badges e missões...\n');
    
    // 1. Badges de Rank (1-6)
    console.log('1️⃣ Criando badges de rank...');
    
    const rankBadges = [
      { name: 'Rank 1 - Iniciante', tier: 1, minLevel: 1, maxLevel: 10, image: 'badge_rank_1.png' },
      { name: 'Rank 2 - Aprendiz', tier: 2, minLevel: 11, maxLevel: 30, image: 'badge_rank_2.png' },
      { name: 'Rank 3 - Experiente', tier: 3, minLevel: 31, maxLevel: 60, image: 'badge_rank_3.png' },
      { name: 'Rank 4 - Veterano', tier: 4, minLevel: 61, maxLevel: 100, image: 'badge_rank_4.png' },
      { name: 'Rank 5 - Elite', tier: 5, minLevel: 101, maxLevel: 150, image: 'badge_rank_5.png' },
      { name: 'Rank 6 - Lendário', tier: 6, minLevel: 151, maxLevel: 999999, image: 'badge_rank_6.png' }
    ];
    
    for (const rank of rankBadges) {
      await client.query(`
        INSERT INTO badges (name, description, image_path, badge_type, tier, is_active)
        VALUES ($1, $2, $3, 'rank', $4, true)
        ON CONFLICT (name) DO NOTHING
      `, [
        rank.name,
        `Alcance o nível ${rank.minLevel}${rank.maxLevel < 999999 ? ` a ${rank.maxLevel}` : '+'}`,
        rank.image,
        rank.tier
      ]);
    }
    console.log('✅ Badges de rank criadas!\n');

    // Badges unicas 
    const uniqueBadges = [
        { name: 'Desenvolvedor', description: 'Badge exclusiva para desenvolvedores do bot', image: 'dev_badge.png' },
    ];

    for (const badge of uniqueBadges) {
        await client.query(`
            INSERT INTO badges (name, description, image_path, badge_type, is_active)
            VALUES ($1, $2, $3, 'unique', true)
            ON CONFLICT (name) DO NOTHING
        `, [badge.name, badge.description, badge.image]);
    }
    console.log('✅ Badges únicas criadas!\n');

    
    // 2. Badge de Evento Especial (Natal 2025)
    console.log('2️⃣ Criando badge de evento (Natal 2025)...');
    const xmasExpiration = new Date('2026-01-07').getTime(); // Expira 7 de janeiro
    await client.query(`
      INSERT INTO badges (name, description, image_path, badge_type, is_active, expires_at)
      VALUES ($1, $2, $3, 'event', true, $4)
      ON CONFLICT (name) DO UPDATE SET expires_at = $4
    `, [
      'Natal 2025',
      'Badge especial do evento de Natal 2025',
      'badgexmas25.png',
      xmasExpiration
    ]);
    console.log('✅ Badge de evento criada!\n');
    
    // 3. Badges de Missão
    console.log('3️⃣ Criando badges de missão...');
    
    const missionBadges = [
      { name: 'Conversador', desc: 'Envie 1000 mensagens', image: 'badge_mission_messages.png' },
      { name: 'Maratonista', desc: 'Fique 300 horas em voz', image: 'badge_mission_voice.png' },
      { name: 'Dedicado', desc: 'Colete daily por 30 dias seguidos', image: 'badge_mission_daily.png' },
      { name: 'Colecionador', desc: 'Complete 10 missões', image: 'badge_mission_collector.png' }
    ];
    
    for (const badge of missionBadges) {
      await client.query(`
        INSERT INTO badges (name, description, image_path, badge_type, is_active)
        VALUES ($1, $2, $3, 'mission', true)
        ON CONFLICT (name) DO NOTHING
      `, [badge.name, badge.desc, badge.image]);
    }
    console.log('✅ Badges de missão criadas!\n');
    
    // 4. Missões
    console.log('4️⃣ Criando missões...');
    
    // Buscar IDs das badges de missão
    const conversadorBadge = await client.query(`SELECT badge_id FROM badges WHERE name = 'Conversador'`);
    const maratonistaBadge = await client.query(`SELECT badge_id FROM badges WHERE name = 'Maratonista'`);
    const dedicadoBadge = await client.query(`SELECT badge_id FROM badges WHERE name = 'Dedicado'`);
    
    const missions = [
      {
        name: 'Envie 1000 Mensagens',
        description: 'Envie um total de 1000 mensagens no servidor',
        type: 'messages',
        target: 1000,
        badgeId: conversadorBadge.rows[0]?.badge_id,
        coins: 500
      },
      {
        name: 'Fique 300 Horas em Voz',
        description: 'Acumule 300 horas em canais de voz',
        type: 'voice_time',
        target: 1080000, // 300 horas em segundos
        badgeId: maratonistaBadge.rows[0]?.badge_id,
        coins: 1000
      },
      {
        name: 'Alcance o Nível 50',
        description: 'Alcance o nível 50 no servidor',
        type: 'level',
        target: 50,
        badgeId: null,
        coins: 1500
      }
    ];
    
    for (const mission of missions) {
      await client.query(`
        INSERT INTO missions (name, description, mission_type, target_value, reward_badge_id, reward_coins, is_active, is_repeatable)
        VALUES ($1, $2, $3, $4, $5, $6, true, false)
        ON CONFLICT DO NOTHING
      `, [
        mission.name,
        mission.description,
        mission.type,
        mission.target,
        mission.badgeId,
        mission.coins
      ]);
    }
    console.log('✅ Missões criadas!\n');
    
    console.log('✅ Seed de badges concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante seed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedBadges();
