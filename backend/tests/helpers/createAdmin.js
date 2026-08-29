const bcrypt = require('bcrypt');
const pool = require('../../src/database/db');

// The public register endpoint can never create an admin, so tests that
// need one insert directly into the database, bypassing the API.
async function createAdminUser({ name = 'Test Admin', email = 'admin.test@example.com', password = 'Admin1234' } = {}) {
  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'ADMIN')`,
    [name, email, passwordHash]
  );
  return { name, email, password };
}

module.exports = createAdminUser;