const pool = require('../../src/database/db');

// Wipes all tables and restarts auto-increment ids, so every test
// starts from an identical, predictable, empty state.
async function resetDatabase() {
  await pool.query('TRUNCATE TABLE bookings, resources, users RESTART IDENTITY CASCADE');
}

module.exports = resetDatabase;