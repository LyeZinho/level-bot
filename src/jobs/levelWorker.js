import { recalculateAllUsersLevels } from '../database.js';

/**
 * Start a background worker that periodically recalculates user levels based on XP.
 * @param {object} client - discord client (optional, used for logging)
 * @param {number} intervalMs - interval in ms (default 5 minutes)
 */
export function startLevelWorker(client, intervalMs = 5 * 60 * 1000) {
  async function runRecalc() {
    try {
      const updated = await recalculateAllUsersLevels();
      if (updated && updated > 0) {
        console.log(`🔁 Recalculated levels for ${updated} users`);
      } else {
        console.log('🔁 Recalculated levels: no changes');
      }
    } catch (error) {
      console.error('❌ Error recalculating levels:', error);
    }
  }

  // Run once immediately, then at interval
  runRecalc();
  const id = setInterval(runRecalc, intervalMs);

  // Provide a way to stop the worker
  const stop = () => clearInterval(id);
  return { stop };
}
