import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuração do pool de conexões PostgreSQL
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

// Inicializar tabelas
async function initDatabase() {
  const client = await pool.connect();
  try {
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

      CREATE TABLE IF NOT EXISTS items (
        item_id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        price INTEGER NOT NULL,
        emoji TEXT DEFAULT '📦',
        type TEXT DEFAULT 'consumable',
        hidden BOOLEAN DEFAULT FALSE,
        created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
      );

      CREATE TABLE IF NOT EXISTS user_inventory (
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        item_id INTEGER NOT NULL REFERENCES items(item_id),
        quantity INTEGER DEFAULT 1,
        acquired_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
        PRIMARY KEY (user_id, guild_id, item_id)
      );

      CREATE INDEX IF NOT EXISTS idx_inventory_user ON user_inventory(user_id, guild_id);

      CREATE TABLE IF NOT EXISTS user_boosts (
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        boost_type TEXT NOT NULL,
        multiplier FLOAT NOT NULL,
        expires_at BIGINT NOT NULL,
        created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
        PRIMARY KEY (user_id, guild_id, boost_type)
      );

      CREATE INDEX IF NOT EXISTS idx_boosts_expiry ON user_boosts(user_id, guild_id, expires_at);

      CREATE TABLE IF NOT EXISTS user_vips (
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        tier TEXT NOT NULL,
        multiplier INTEGER NOT NULL,
        expires_at BIGINT NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
        PRIMARY KEY (user_id, guild_id, tier)
      );

      CREATE INDEX IF NOT EXISTS idx_vips_expiry ON user_vips(user_id, guild_id, expires_at);
    `);
    console.log('✅ Tabelas do banco de dados criadas/verificadas');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Inicializar ao importar
await initDatabase();

export async function getUser(userId, guildId) {
  const result = await pool.query(
    'SELECT * FROM users WHERE user_id = $1 AND guild_id = $2',
    [userId, guildId]
  );
  return result.rows[0] || null;
}

export async function createUser(userId, username, guildId) {
  await pool.query(
    `INSERT INTO users (user_id, username, guild_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, guild_id) DO UPDATE SET username = EXCLUDED.username`,
    [userId, username, guildId]
  );
  return getUser(userId, guildId);
}

export async function addMessageXP(userId, username, guildId, xpGain) {
  let user = await getUser(userId, guildId);
  
  if (!user) {
    user = await createUser(userId, username, guildId);
  }
  
  // Aplicar multiplicador total (VIP + Boost combinados)
  const { multiplier, hasVip, hasBoost } = await getTotalMultiplier(userId, guildId);
  const finalXpGain = Math.floor(xpGain * multiplier);
  
  const newXP = user.xp + finalXpGain;
  const newLevel = calculateLevel(newXP);
  const now = Date.now();
  
  // Calcular coins ganhos (1 coin a cada 100 XP) - também com multiplicador
  const oldCoinsFromXp = Math.floor(user.xp / 100);
  const newCoinsFromXp = Math.floor(newXP / 100);
  const coinsGained = Math.floor((newCoinsFromXp - oldCoinsFromXp) * multiplier);
  
  // Se os coins que forem acima de 25 (devido a boosts), limitar a 25
  const limitedCoinsGained = Math.min(coinsGained, 25);

  await pool.query(
    `UPDATE users 
     SET xp = xp + $1, level = $2, messages = messages + 1, last_message_at = $3, coins = coins + $4
     WHERE user_id = $5 AND guild_id = $6`,
    [finalXpGain, newLevel, now, limitedCoinsGained, userId, guildId]
  );
  
  return {
    levelUp: newLevel > user.level,
    oldLevel: user.level,
    newLevel: newLevel,
    xp: newXP,
    coinsGained: coinsGained,
    xpGained: finalXpGain,
    multiplier: multiplier,
    hasVip: hasVip,
    hasBoost: hasBoost
  };
}

export async function addVoiceTime(userId, username, guildId, seconds) {
  let user = await getUser(userId, guildId);
  
  if (!user) {
    user = await createUser(userId, username, guildId);
  }
  
  // 1 XP por minuto de voz
  const baseXpGain = Math.floor(seconds / 60);
  
  // Aplicar multiplicador total (VIP + Boost combinados)
  const { multiplier, hasVip, hasBoost } = await getTotalMultiplier(userId, guildId);
  const finalXpGain = Math.floor(baseXpGain * multiplier);
  
  const newXP = user.xp + finalXpGain;
  const newLevel = calculateLevel(newXP);
  
  // Calcular coins ganhos (1 coin a cada 100 XP) - também com multiplicador
  const oldCoinsFromXp = Math.floor(user.xp / 100);
  const newCoinsFromXp = Math.floor(newXP / 100);
  const coinsGained = Math.floor((newCoinsFromXp - oldCoinsFromXp) * multiplier);
  
  await pool.query(
    `UPDATE users 
     SET voice_time = voice_time + $1, xp = xp + $2, level = $3, coins = coins + $4
     WHERE user_id = $5 AND guild_id = $6`,
    [seconds, finalXpGain, newLevel, coinsGained, userId, guildId]
  );
  
  return {
    levelUp: newLevel > user.level,
    oldLevel: user.level,
    newLevel: newLevel,
    coinsGained: coinsGained,
    xpGained: finalXpGain,
    multiplier: multiplier,
    hasVip: hasVip,
    hasBoost: hasBoost
  };
}

export async function getRanking(guildId, limit = 10) {
  const result = await pool.query(
    `SELECT * FROM users 
     WHERE guild_id = $1 
     ORDER BY xp DESC 
     LIMIT $2`,
    [guildId, limit]
  );
  return result.rows;
}

export async function getUserRank(userId, guildId) {
  const result = await pool.query(
    `SELECT COUNT(*) + 1 as rank
     FROM users
     WHERE guild_id = $1 AND xp > (
       SELECT xp FROM users WHERE user_id = $2 AND guild_id = $3
     )`,
    [guildId, userId, guildId]
  );
  return result.rows[0]?.rank || null;
}

export async function recalculateAllUsersLevels() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT user_id, guild_id, xp, level FROM users');
    const updates = [];
    for (const row of res.rows) {
      const newLevel = calculateLevel(row.xp || 0);
      if (newLevel !== row.level) {
        updates.push({ user_id: row.user_id, guild_id: row.guild_id, newLevel });
      }
    }

    if (updates.length === 0) return 0;

    // Atualizar cada usuário em uma transação
    await client.query('BEGIN');
    for (const u of updates) {
      await client.query(
        `UPDATE users SET level = $1 WHERE user_id = $2 AND guild_id = $3`,
        [u.newLevel, u.user_id, u.guild_id]
      );
    }
    await client.query('COMMIT');

    return updates.length;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (e) {}
    throw err;
  } finally {
    client.release();
  }
}

export function calculateLevel(xp) {
  // Fórmula: level = floor(sqrt(xp / 100))
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getXPForLevel(level) {
  // XP necessário para alcançar um nível
  return Math.pow(level - 1, 2) * 100;
}

export function getXPProgress(xp) {
  const currentLevel = calculateLevel(xp);
  const currentLevelXP = getXPForLevel(currentLevel);
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  
  return {
    current: xp - currentLevelXP,
    needed: nextLevelXP - currentLevelXP,
    percentage: ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
  };
}

/**
 * Force set user level (updates xp accordingly)
 */
export async function forceSetLevel(userId, guildId, newLevel) {
  const newXP = getXPForLevel(newLevel);
  await pool.query(
    'UPDATE users SET xp = $1, level = $2 WHERE user_id = $3 AND guild_id = $4',
    [newXP, newLevel, userId, guildId]
  );
  return getUser(userId, guildId);
}

// ============= BOOST FUNCTIONS =============

/**
 * Obtém o multiplicador de XP ativo de um usuário
 * Remove boosts expirados automaticamente
 */
export async function getActiveBoost(userId, guildId) {
  const now = Date.now();
  
  // Remover boosts expirados
  await pool.query(
    'DELETE FROM user_boosts WHERE user_id = $1 AND guild_id = $2 AND expires_at <= $3',
    [userId, guildId, now]
  );
  
  // Buscar boost ativo (se existir)
  const result = await pool.query(
    'SELECT * FROM user_boosts WHERE user_id = $1 AND guild_id = $2 AND expires_at > $3 ORDER BY multiplier DESC LIMIT 1',
    [userId, guildId, now]
  );
  
  return result.rows[0] || null;
}

/**
 * Adiciona um boost de XP para um usuário
 */
export async function addBoost(userId, guildId, boostType, multiplier, durationMinutes) {
  const expiresAt = Date.now() + (durationMinutes * 60 * 1000);
  
  await pool.query(
    `INSERT INTO user_boosts (user_id, guild_id, boost_type, multiplier, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, guild_id, boost_type) 
     DO UPDATE SET multiplier = EXCLUDED.multiplier, expires_at = EXCLUDED.expires_at`,
    [userId, guildId, boostType, multiplier, expiresAt]
  );
  
  return {
    boostType,
    multiplier,
    expiresAt,
    durationMinutes
  };
}

// ============= ECONOMY FUNCTIONS =============

export async function addCoins(userId, guildId, amount) {
  await pool.query(
    `UPDATE users SET coins = coins + $1 WHERE user_id = $2 AND guild_id = $3`,
    [amount, userId, guildId]
  );
}

export async function removeCoins(userId, guildId, amount) {
  const result = await pool.query(
    `UPDATE users SET coins = GREATEST(0, coins - $1) WHERE user_id = $2 AND guild_id = $3 RETURNING coins`,
    [amount, userId, guildId]
  );
  return result.rows[0]?.coins || 0;
}

export async function transferCoins(fromUserId, toUserId, guildId, amount) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Verificar se o remetente tem coins suficientes
    const sender = await client.query(
      'SELECT coins FROM users WHERE user_id = $1 AND guild_id = $2',
      [fromUserId, guildId]
    );
    
    if (!sender.rows[0] || sender.rows[0].coins < amount) {
      await client.query('ROLLBACK');
      return { success: false, reason: 'insufficient_funds' };
    }
    
    // Remover coins do remetente
    await client.query(
      'UPDATE users SET coins = coins - $1 WHERE user_id = $2 AND guild_id = $3',
      [amount, fromUserId, guildId]
    );
    
    // Adicionar coins ao destinatário
    await client.query(
      'UPDATE users SET coins = coins + $1 WHERE user_id = $2 AND guild_id = $3',
      [amount, toUserId, guildId]
    );
    
    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function claimDaily(userId, guildId) {
  const user = await getUser(userId, guildId);
  if (!user) return { success: false, reason: 'user_not_found' };
  
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const lastClaim = user.last_daily_claim || 0;
  
  if (now - lastClaim < oneDayMs) {
    const timeLeft = oneDayMs - (now - lastClaim);
    return { success: false, reason: 'already_claimed', timeLeft };
  }
  
  const dailyAmount = Math.floor(Math.random() * 3) + 3; // 3 a 5 PityCoins por dia
  
  await pool.query(
    `UPDATE users SET coins = coins + $1, last_daily_claim = $2 WHERE user_id = $3 AND guild_id = $4`,
    [dailyAmount, now, userId, guildId]
  );
  
  return { success: true, amount: dailyAmount };
}

// ============= SHOP & INVENTORY FUNCTIONS =============

export async function createItem(name, description, price, emoji = '📦', type = 'consumable', hidden = false) {
  const result = await pool.query(
    `INSERT INTO items (name, description, price, emoji, type, hidden) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     ON CONFLICT (name) DO UPDATE SET description = $2, price = $3, emoji = $4, type = $5, hidden = $6
     RETURNING *`,
    [name, description, price, emoji, type, hidden]
  );
  return result.rows[0];
}

export async function getAllItems() {
  const result = await pool.query('SELECT * FROM items WHERE hidden = FALSE ORDER BY price ASC');
  return result.rows;
}

export async function getItem(itemId) {
  const result = await pool.query('SELECT * FROM items WHERE item_id = $1', [itemId]);
  return result.rows[0] || null;
}

export async function getItemByName(name) {
  const result = await pool.query('SELECT * FROM items WHERE LOWER(name) = LOWER($1)', [name]);
  return result.rows[0] || null;
}

export async function buyItem(userId, guildId, itemId, quantity = 1) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const item = await getItem(itemId);
    if (!item) {
      await client.query('ROLLBACK');
      return { success: false, reason: 'item_not_found' };
    }
    
    const totalCost = item.price * quantity;
    const user = await client.query(
      'SELECT coins FROM users WHERE user_id = $1 AND guild_id = $2',
      [userId, guildId]
    );
    
    if (!user.rows[0] || user.rows[0].coins < totalCost) {
      await client.query('ROLLBACK');
      return { success: false, reason: 'insufficient_funds', cost: totalCost };
    }
    
    // Remover coins
    await client.query(
      'UPDATE users SET coins = coins - $1 WHERE user_id = $2 AND guild_id = $3',
      [totalCost, userId, guildId]
    );
    
    // Adicionar ao inventário
    await client.query(
      `INSERT INTO user_inventory (user_id, guild_id, item_id, quantity) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (user_id, guild_id, item_id) 
       DO UPDATE SET quantity = user_inventory.quantity + $4`,
      [userId, guildId, itemId, quantity]
    );
    
    await client.query('COMMIT');
    return { success: true, item, quantity, totalCost };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getUserInventory(userId, guildId) {
  const result = await pool.query(
    `SELECT ui.*, i.name, i.description, i.emoji, i.type 
     FROM user_inventory ui 
     JOIN items i ON ui.item_id = i.item_id 
     WHERE ui.user_id = $1 AND ui.guild_id = $2 
     ORDER BY ui.acquired_at DESC`,
    [userId, guildId]
  );
  return result.rows;
}

export async function useItem(userId, guildId, itemId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const inventory = await client.query(
      'SELECT * FROM user_inventory WHERE user_id = $1 AND guild_id = $2 AND item_id = $3',
      [userId, guildId, itemId]
    );
    
    if (!inventory.rows[0] || inventory.rows[0].quantity <= 0) {
      await client.query('ROLLBACK');
      return { success: false, reason: 'item_not_in_inventory' };
    }
    
    const item = await getItem(itemId);
    if (!item) {
      await client.query('ROLLBACK');
      return { success: false, reason: 'item_not_found' };
    }
    
    // Aplicar efeitos do item baseado no nome/tipo
    let effect = {};
    
    // VIPs - Accept both "Boost VIP" and legacy "VIP" names (duração: 30 dias)
    if (item.name.includes('Boost VIP Gold') || item.name.includes('VIP Gold')) {
      const vip = await activateVip(userId, guildId, 'gold', 2, 30);
      effect = { type: 'vip', tier: 'gold', ...vip };
    } else if (item.name.includes('Boost VIP Platinum') || item.name.includes('VIP Platinum')) {
      const vip = await activateVip(userId, guildId, 'platinum', 3, 30);
      effect = { type: 'vip', tier: 'platinum', ...vip };
    } else if (item.name.includes('Boost VIP Ruby') || item.name.includes('VIP Ruby')) {
      const vip = await activateVip(userId, guildId, 'ruby', 5, 30);
      effect = { type: 'vip', tier: 'ruby', ...vip };
    }
    // XP Boosts (duração: 1 hora = 60 minutos)
    else if (item.name.includes('XP Boost 2x')) {
      const boost = await addBoost(userId, guildId, 'xp_boost', 0.2, 60);
      effect = { type: 'boost', ...boost };
    } else if (item.name.includes('XP Boost 3x')) {
      const boost = await addBoost(userId, guildId, 'xp_boost', 0.3, 60);
      effect = { type: 'boost', ...boost };
    } else if (item.name.includes('XP Boost 5x')) {
      const boost = await addBoost(userId, guildId, 'xp_boost', 0.5, 60);
      effect = { type: 'boost', ...boost };
    }
    // Pacotes de Experiência
    else if (item.name.includes('Pacote de Experiência Tier 1')) {
      // +150 XP + 10 coins
      const user = await getUser(userId, guildId);
      const newXP = user.xp + 150;
      const newLevel = calculateLevel(newXP);
      await client.query(
        'UPDATE users SET xp = xp + 150, level = $1, coins = coins + 10 WHERE user_id = $2 AND guild_id = $3',
        [newLevel, userId, guildId]
      );
      effect = { type: 'xp_pack', xp: 150, coins: 10 };
    } else if (item.name.includes('Pacote de Experiência Tier 2')) {
      // +250 XP + 20 coins
      const user = await getUser(userId, guildId);
      const newXP = user.xp + 250;
      const newLevel = calculateLevel(newXP);
      await client.query(
        'UPDATE users SET xp = xp + 250, level = $1, coins = coins + 20 WHERE user_id = $2 AND guild_id = $3',
        [newLevel, userId, guildId]
      );
      effect = { type: 'xp_pack', xp: 250, coins: 20 };
    } else if (item.name.includes('Pacote de Experiência Tier 3')) {
      // +350 XP + 40 coins
      const user = await getUser(userId, guildId);
      const newXP = user.xp + 350;
      const newLevel = calculateLevel(newXP);
      await client.query(
        'UPDATE users SET xp = xp + 350, level = $1, coins = coins + 40 WHERE user_id = $2 AND guild_id = $3',
        [newLevel, userId, guildId]
      );
      effect = { type: 'xp_pack', xp: 350, coins: 40 };
    }
    
    // Reduzir quantidade no inventário
    const newQuantity = inventory.rows[0].quantity - 1;
    if (newQuantity <= 0) {
      await client.query(
        'DELETE FROM user_inventory WHERE user_id = $1 AND guild_id = $2 AND item_id = $3',
        [userId, guildId, itemId]
      );
    } else {
      await client.query(
        'UPDATE user_inventory SET quantity = $1 WHERE user_id = $2 AND guild_id = $3 AND item_id = $4',
        [newQuantity, userId, guildId, itemId]
      );
    }
    
    await client.query('COMMIT');
    return { success: true, item, effect };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ==================== FUNÇÕES VIP ====================

/**
 * Verifica se usuário tem VIP ativo
 */
export async function getActiveVip(userId, guildId) {
  const now = Date.now();
  
  // Deletar VIPs expirados primeiro
  await pool.query(
    'DELETE FROM user_vips WHERE user_id = $1 AND guild_id = $2 AND expires_at <= $3',
    [userId, guildId, now]
  );
  
  // Buscar VIP ativo
  const result = await pool.query(
    'SELECT * FROM user_vips WHERE user_id = $1 AND guild_id = $2 AND expires_at > $3',
    [userId, guildId, now]
  );
  
  return result.rows[0] || null;
}

/**
 * Ativa um VIP para o usuário
 */
export async function activateVip(userId, guildId, tier, multiplier, durationDays, roleId = null) {
  const now = Date.now();
  const expiresAt = now + (durationDays * 24 * 60 * 60 * 1000);
  
  // Primeiro, remover qualquer VIP existente para este usuário neste servidor
  await pool.query(
    `DELETE FROM user_vips WHERE user_id = $1 AND guild_id = $2`,
    [userId, guildId]
  );
  
  // Depois, inserir o novo VIP
  await pool.query(
    `INSERT INTO user_vips (user_id, guild_id, tier, multiplier, expires_at, active, created_at)
     VALUES ($1, $2, $3, $4, $5, true, $6)`,
    [userId, guildId, tier, multiplier, expiresAt, now]
  );
  
  // IMPORTANTE: Também criar o boost na tabela user_boosts para que getActiveBoost() funcione
  await pool.query(
    `INSERT INTO user_boosts (user_id, guild_id, boost_type, multiplier, expires_at)
     VALUES ($1, $2, 'vip_boost', $3, $4)
     ON CONFLICT (user_id, guild_id, boost_type)
     DO UPDATE SET multiplier = EXCLUDED.multiplier, expires_at = EXCLUDED.expires_at`,
    [userId, guildId, multiplier, expiresAt]
  );
  
  return {
    success: true,
    tier: tier,
    multiplier,
    expires_at: expiresAt
  };
}

/**
 * Busca VIPs expirados
 */
export async function getExpiredVips() {
  const now = Date.now();
  
  const result = await pool.query(
    'SELECT * FROM user_vips WHERE expires_at <= $1',
    [now]
  );
  
  return result.rows;
}

/**
 * Desativa um VIP
 */
export async function deactivateVip(userId, guildId) {
  // Remover da tabela user_vips
  await pool.query(
    'DELETE FROM user_vips WHERE user_id = $1 AND guild_id = $2',
    [userId, guildId]
  );
  
  // Também remover o boost da tabela user_boosts
  await pool.query(
    `DELETE FROM user_boosts WHERE user_id = $1 AND guild_id = $2 AND boost_type = 'vip_boost'`,
    [userId, guildId]
  );
  
  return { success: true };
}

/**
 * Admin dá item VIP para usuário
 */
export async function giveVipItem(userId, guildId, tier) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Buscar item VIP
    const tierNames = {
      gold: 'Boost VIP Gold',
      platinum: 'Boost VIP Platinum',
      ruby: 'Boost VIP Ruby'
    };
    
    const legacyNames = {
      gold: 'VIP Gold',
      platinum: 'VIP Platinum',
      ruby: 'VIP Ruby'
    };

    const itemResult = await client.query(
      'SELECT * FROM items WHERE name = $1 OR name = $2',
      [tierNames[tier], legacyNames[tier]]
    );
    
    if (itemResult.rows.length === 0) {
      throw new Error(`Item ${tierNames[tier]} não encontrado. Execute npm run seed primeiro.`);
    }
    
    const item = itemResult.rows[0];
    
    // Adicionar ao inventário
    await client.query(
      `INSERT INTO user_inventory (user_id, guild_id, item_id, quantity)
       VALUES ($1, $2, $3, 1)
       ON CONFLICT (user_id, guild_id, item_id)
       DO UPDATE SET quantity = user_inventory.quantity + 1`,
      [userId, guildId, item.item_id]
    );
    
    await client.query('COMMIT');
    
    return {
      success: true,
      item,
      message: `${item.emoji} ${item.name} adicionado ao inventário!`
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    return {
      success: false,
      message: error.message
    };
  } finally {
    client.release();
  }
}

/**
 * Obter multiplicador total (VIP + Boost)
 */
export async function getTotalMultiplier(userId, guildId) {
  let totalMultiplier = 1;
  
  // Verificar VIP ativo
  const vip = await getActiveVip(userId, guildId);
  if (vip) {
    totalMultiplier = vip.multiplier;
  }
  
  // Verificar boost ativo (se houver, multiplica com VIP)
  const boost = await getActiveBoost(userId, guildId);
  if (boost) {
    totalMultiplier *= boost.multiplier;
  }
  
  return { multiplier: totalMultiplier, hasVip: !!vip, hasBoost: !!boost };
}

export default pool;
