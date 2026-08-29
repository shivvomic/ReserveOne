const pool = require('./db');

async function getAllResources({ search, category, status }) {
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
    values.push(`%${search}%`);
    paramIndex++;
  }
  if (category) {
    conditions.push(`category = $${paramIndex}`);
    values.push(category);
    paramIndex++;
  }
  if (status) {
    conditions.push(`status = $${paramIndex}`);
    values.push(status);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // SELECT * automatically picks up image_url now that it's a real column —
  // no query change needed here beyond what already existed.
  const result = await pool.query(
    `SELECT * FROM resources ${whereClause} ORDER BY created_at DESC`,
    values
  );
  return result.rows;
}

async function getResourceById(id) {
  const result = await pool.query('SELECT * FROM resources WHERE id = $1', [id]);
  return result.rows[0];
}

async function createResource({ name, category, description, location, capacity, status, image_url }) {
  const result = await pool.query(
    `INSERT INTO resources (name, category, description, location, capacity, status, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [name, category, description || null, location, capacity || null, status || 'AVAILABLE', image_url || null]
  );
  return result.rows[0];
}

async function updateResource(id, { name, category, description, location, capacity, status, image_url }) {
  const result = await pool.query(
    `UPDATE resources
     SET name = $1, category = $2, description = $3, location = $4,
         capacity = $5, status = $6, image_url = $7, updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [name, category, description || null, location, capacity || null, status, image_url || null, id]
  );
  return result.rows[0];
}

async function deleteResource(id) {
  const result = await pool.query('DELETE FROM resources WHERE id = $1 RETURNING id', [id]);
  return result.rows[0];
}

module.exports = { getAllResources, getResourceById, createResource, updateResource, deleteResource };