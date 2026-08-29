const pool = require('./db');

// Always called with a transaction-scoped `client` (never the shared
// pool) — see bookingController.js for why: every audit row is written
// inside the same transaction as the booking change it describes.
async function createAuditLog(client, { adminId, action, bookingId, details }) {
  await client.query(
    `INSERT INTO audit_logs (admin_id, action, booking_id, details)
     VALUES ($1, $2, $3, $4)`,
    [adminId, action, bookingId, details || null]
  );
}

async function getAuditLogs({ action, limit, offset }) {
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (action) {
    conditions.push(`al.action = $${paramIndex}`);
    values.push(action);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitParam = paramIndex++;
  const offsetParam = paramIndex++;
  values.push(limit, offset);

  const result = await pool.query(
    `SELECT al.id, al.action, al.details, al.created_at, al.booking_id,
            al.admin_id, u.name AS admin_name
     FROM audit_logs al
     LEFT JOIN users u ON u.id = al.admin_id
     ${whereClause}
     ORDER BY al.created_at DESC
     LIMIT $${limitParam} OFFSET $${offsetParam}`,
    values
  );
  return result.rows;
}

async function getAuditLogCount({ action }) {
  const conditions = [];
  const values = [];
  if (action) {
    conditions.push('action = $1');
    values.push(action);
  }
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(`SELECT COUNT(*)::int AS count FROM audit_logs ${whereClause}`, values);
  return result.rows[0].count;
}

module.exports = { createAuditLog, getAuditLogs, getAuditLogCount };