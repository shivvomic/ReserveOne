const pool = require('./db');

// Includes password_hash — only used internally to verify login,
// never sent back in an API response.
async function findUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

async function findUserById(id) {
  const result = await pool.query(
    `SELECT id, name, email, role, roll_number, registration_type, club_name, created_at, updated_at
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

// New in Phase 13 — lets registration give a clean "already taken" error
// before the DB's unique constraint would otherwise reject the insert.
async function findUserByRollNumber(rollNumber) {
  const result = await pool.query('SELECT id FROM users WHERE roll_number = $1', [rollNumber]);
  return result.rows[0];
}

async function createUser({
  name,
  email,
  passwordHash,
  role = 'STUDENT',
  rollNumber = null,
  registrationType = null,
  clubName = null,
}) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, roll_number, registration_type, club_name)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, email, role, roll_number, registration_type, club_name, created_at, updated_at`,
    [name, email, passwordHash, role, rollNumber, registrationType, clubName]
  );
  return result.rows[0];
}

async function updateUserProfile(id, { name }) {
  const result = await pool.query(
    `UPDATE users SET name = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, email, role, roll_number, registration_type, club_name, created_at, updated_at`,
    [name, id]
  );
  return result.rows[0];
}

async function getAllUsers() {
  const result = await pool.query(
    'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
  );
  return result.rows;
}

module.exports = {
  findUserByEmail,
  findUserById,
  findUserByRollNumber,
  createUser,
  updateUserProfile,
  getAllUsers,
};