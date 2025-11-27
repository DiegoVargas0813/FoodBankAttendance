async function periodicCleanup({ days = 30 } = {}) {
  try {
    // require lazily to avoid forcing a DB connect at module load time
    const loginModel = require('../models/loginModel');

    const result = await loginModel.deleteUnconfirmedOlderThanDays(days);
    console.log(`[cleanup] removed ${result.affectedRows || 0} unconfirmed accounts older than ${days} days`);
  } catch (err) {
    // If DB host is unreachable (ENOTFOUND) or other DB errors happen, log and continue
    console.error('[cleanup] error running periodic cleanup', err && err.message ? err.message : err);
  }
}

module.exports = { periodicCleanup };
// ...existing code...