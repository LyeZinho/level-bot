import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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

// ==================== BADGES ====================

/**
 * Buscar badge por ID
 */
export async function getBadgeById(badgeId) {
  const result = await pool.query(
    'SELECT * FROM badges WHERE badge_id = $1',
    [badgeId]
  );
  return result.rows[0] || null;
}

/**
 * Buscar badge por nome
 */
export async function getBadgeByName(name) {
  const result = await pool.query(
    'SELECT * FROM badges WHERE name = $1',
    [name]
  );
  return result.rows[0] || null;
}

/**
 * Listar todas as badges ativas
 */
export async function getAllBadges() {
  const result = await pool.query(
    'SELECT * FROM badges WHERE is_active = true ORDER BY badge_type, tier, name'
  );
  return result.rows;
}

/**
 * Buscar badges de um usuário
 */
export async function getUserBadges(userId, guildId) {
  const result = await pool.query(`
    SELECT b.*, ub.earned_at, ub.expires_at as user_expires_at
    FROM user_badges ub
    JOIN badges b ON ub.badge_id = b.badge_id
    WHERE ub.user_id = $1 AND ub.guild_id = $2
    AND (ub.expires_at IS NULL OR ub.expires_at > $3)
    ORDER BY b.badge_type, b.tier DESC, ub.earned_at DESC
  `, [userId, guildId, Date.now()]);
  
  return result.rows;
}

/**
 * Dar uma badge a um usuário
 */
export async function giveUserBadge(userId, guildId, badgeId, expiresAt = null) {
  try {
    await pool.query(`
      INSERT INTO user_badges (user_id, guild_id, badge_id, expires_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, guild_id, badge_id) DO NOTHING
    `, [userId, guildId, badgeId, expiresAt]);
    return true;
  } catch (error) {
    console.error('Erro ao dar badge:', error);
    return false;
  }
}

/**
 * Remover badge de um usuário
 */
export async function removeUserBadge(userId, guildId, badgeId) {
  await pool.query(
    'DELETE FROM user_badges WHERE user_id = $1 AND guild_id = $2 AND badge_id = $3',
    [userId, guildId, badgeId]
  );
}

/**
 * Verificar e atualizar badge de rank baseado no nível
 */
export async function updateRankBadge(userId, guildId, level) {
  // Determinar qual rank badge o usuário deve ter
  let targetTier = 1;
  if (level >= 151) targetTier = 6;
  else if (level >= 101) targetTier = 5;
  else if (level >= 61) targetTier = 4;
  else if (level >= 31) targetTier = 3;
  else if (level >= 11) targetTier = 2;
  else targetTier = 1;
  
  // Buscar a badge correta
  const targetBadge = await pool.query(
    'SELECT badge_id FROM badges WHERE badge_type = $1 AND tier = $2',
    ['rank', targetTier]
  );
  
  if (targetBadge.rows.length === 0) return;
  
  const targetBadgeId = targetBadge.rows[0].badge_id;
  
  // Buscar badge de rank atual do usuário
  const currentBadge = await pool.query(`
    SELECT ub.badge_id, b.tier
    FROM user_badges ub
    JOIN badges b ON ub.badge_id = b.badge_id
    WHERE ub.user_id = $1 AND ub.guild_id = $2 AND b.badge_type = 'rank'
  `, [userId, guildId]);
  
  // Se já tem a badge correta, não faz nada
  if (currentBadge.rows.length > 0 && currentBadge.rows[0].badge_id === targetBadgeId) {
    return;
  }
  
  // Remover badge de rank antiga
  if (currentBadge.rows.length > 0) {
    await pool.query(
      'DELETE FROM user_badges WHERE user_id = $1 AND guild_id = $2 AND badge_id = $3',
      [userId, guildId, currentBadge.rows[0].badge_id]
    );
  }
  
  // Adicionar nova badge de rank
  await giveUserBadge(userId, guildId, targetBadgeId);
  
  return targetTier;
}

// ==================== MISSÕES ====================

/**
 * Buscar todas as missões ativas
 */
export async function getActiveMissions() {
  const now = Date.now();
  const result = await pool.query(`
    SELECT * FROM missions 
    WHERE is_active = true 
    AND (expires_at IS NULL OR expires_at > $1)
    ORDER BY mission_id
  `, [now]);
  return result.rows;
}

/**
 * Buscar missão por ID
 */
export async function getMissionById(missionId) {
  const result = await pool.query(
    'SELECT * FROM missions WHERE mission_id = $1',
    [missionId]
  );
  return result.rows[0] || null;
}

/**
 * Buscar progresso das missões de um usuário
 */
export async function getUserMissions(userId, guildId) {
  const result = await pool.query(`
    SELECT m.*, um.current_value, um.completed, um.completed_at, um.started_at
    FROM missions m
    LEFT JOIN user_missions um ON m.mission_id = um.mission_id 
      AND um.user_id = $1 AND um.guild_id = $2
    WHERE m.is_active = true
    AND (m.expires_at IS NULL OR m.expires_at > $3)
    ORDER BY m.mission_id
  `, [userId, guildId, Date.now()]);
  
  return result.rows.map(row => ({
    ...row,
    progress_percentage: Math.min(100, (row.current_value || 0) / row.target_value * 100)
  }));
}

/**
 * Atualizar progresso de uma missão
 */
export async function updateMissionProgress(userId, guildId, missionType, value) {
  try {
    // Buscar missões ativas desse tipo
    const missions = await pool.query(`
      SELECT * FROM missions 
      WHERE mission_type = $1 AND is_active = true
      AND (expires_at IS NULL OR expires_at > $2)
    `, [missionType, Date.now()]);
    
    for (const mission of missions.rows) {
      // Verificar se o usuário já tem progresso
      const userMission = await pool.query(`
        SELECT * FROM user_missions 
        WHERE user_id = $1 AND guild_id = $2 AND mission_id = $3
      `, [userId, guildId, mission.mission_id]);
      
      if (userMission.rows.length === 0) {
        // Criar novo progresso
        await pool.query(`
          INSERT INTO user_missions (user_id, guild_id, mission_id, current_value)
          VALUES ($1, $2, $3, $4)
        `, [userId, guildId, mission.mission_id, value]);
      } else if (!userMission.rows[0].completed) {
        // Atualizar progresso existente
        const newValue = value;
        await pool.query(`
          UPDATE user_missions 
          SET current_value = $1
          WHERE user_id = $2 AND guild_id = $3 AND mission_id = $4
        `, [newValue, userId, guildId, mission.mission_id]);
        
        // Verificar se completou
        if (newValue >= mission.target_value) {
          await completeMission(userId, guildId, mission.mission_id);
        }
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar progresso de missão:', error);
  }
}

/**
 * Completar uma missão
 */
async function completeMission(userId, guildId, missionId) {
  const mission = await getMissionById(missionId);
  if (!mission) return null;
  
  // Marcar como completa
  await pool.query(`
    UPDATE user_missions 
    SET completed = true, completed_at = $1
    WHERE user_id = $2 AND guild_id = $3 AND mission_id = $4
  `, [Date.now(), userId, guildId, missionId]);
  
  // Dar recompensas
  const rewards = {
    coins: 0,
    badge: null
  };
  
  // Dar coins
  if (mission.reward_coins > 0) {
    await pool.query(
      'UPDATE users SET coins = coins + $1 WHERE user_id = $2 AND guild_id = $3',
      [mission.reward_coins, userId, guildId]
    );
    rewards.coins = mission.reward_coins;
  }
  
  // Dar badge
  if (mission.reward_badge_id) {
    await giveUserBadge(userId, guildId, mission.reward_badge_id);
    const badge = await getBadgeById(mission.reward_badge_id);
    rewards.badge = badge;
  }
  
  return rewards;
}

/**
 * Incrementar progresso de missão
 */
export async function incrementMissionProgress(userId, guildId, missionType, increment = 1) {
  try {
    const missions = await pool.query(`
      SELECT * FROM missions 
      WHERE mission_type = $1 AND is_active = true
      AND (expires_at IS NULL OR expires_at > $2)
    `, [missionType, Date.now()]);
    
    for (const mission of missions.rows) {
      const userMission = await pool.query(`
        SELECT * FROM user_missions 
        WHERE user_id = $1 AND guild_id = $2 AND mission_id = $3
      `, [userId, guildId, mission.mission_id]);
      
      if (userMission.rows.length === 0) {
        await pool.query(`
          INSERT INTO user_missions (user_id, guild_id, mission_id, current_value)
          VALUES ($1, $2, $3, $4)
        `, [userId, guildId, mission.mission_id, increment]);
      } else if (!userMission.rows[0].completed) {
        const newValue = userMission.rows[0].current_value + increment;
        await pool.query(`
          UPDATE user_missions 
          SET current_value = $1
          WHERE user_id = $2 AND guild_id = $3 AND mission_id = $4
        `, [newValue, userId, guildId, mission.mission_id]);
        
        if (newValue >= mission.target_value) {
          return await completeMission(userId, guildId, mission.mission_id);
        }
      }
    }
  } catch (error) {
    console.error('Erro ao incrementar progresso:', error);
  }
  
  return null;
}

// ==================== UTILITÁRIOS ====================

/**
 * Carregar imagem de badge como data URI
 */
export function loadBadgeImageAsDataUri(imagePath) {
  try {
    const fullPath = path.join(process.cwd(), 'src', 'assets', imagePath);
    if (!fs.existsSync(fullPath)) return null;
    
    const buffer = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
    const base64 = buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Erro ao carregar badge:', error);
    return null;
  }
}

/**
 * Remover badges expiradas
 */
export async function cleanExpiredBadges() {
  const now = Date.now();
  const result = await pool.query(
    'DELETE FROM user_badges WHERE expires_at IS NOT NULL AND expires_at < $1',
    [now]
  );
  return result.rowCount;
}
