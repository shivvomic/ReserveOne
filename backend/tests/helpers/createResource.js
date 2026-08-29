const pool = require('../../src/database/db');

async function createResource(overrides = {}) {
  const resource = {
    name: 'Test Resource',
    category: 'Meeting Room',
    location: 'Test Block',
    capacity: 10,
    status: 'AVAILABLE',
    ...overrides,
  };
  const result = await pool.query(
    `INSERT INTO resources (name, category, location, capacity, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [resource.name, resource.category, resource.location, resource.capacity, resource.status]
  );
  return result.rows[0];
}

module.exports = createResource;