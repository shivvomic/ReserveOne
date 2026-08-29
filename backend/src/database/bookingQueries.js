const pool = require('./db');

async function getBookingById(id) {
  const result = await pool.query(
    `SELECT id, user_id, resource_id, booking_date::text AS booking_date,
            start_time, end_time, status, reason, undertaking_accepted,
            created_at, updated_at
     FROM bookings WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

async function getBookingsByUser(userId) {
  const result = await pool.query(
    `SELECT b.id, b.user_id, b.resource_id, b.booking_date::text AS booking_date,
            b.start_time, b.end_time, b.status, b.reason, b.undertaking_accepted,
            b.created_at, b.updated_at,
            r.name AS resource_name, r.category AS resource_category
     FROM bookings b
     JOIN resources r ON r.id = b.resource_id
     WHERE b.user_id = $1
     ORDER BY b.booking_date DESC, b.start_time DESC`,
    [userId]
  );
  return result.rows;
}

async function getAllBookings({ status }) {
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (status) {
    conditions.push(`b.status = $${paramIndex}`);
    values.push(status);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT b.id, b.user_id, b.resource_id, b.booking_date::text AS booking_date,
            b.start_time, b.end_time, b.status, b.reason,
            b.created_at, b.updated_at,
            r.name AS resource_name, u.name AS user_name, u.email AS user_email
     FROM bookings b
     JOIN resources r ON r.id = b.resource_id
     JOIN users u ON u.id = b.user_id
     ${whereClause}
     ORDER BY b.created_at DESC`,
    values
  );
  return result.rows;
}

async function findOverlappingBooking(
  client,
  { resourceId, bookingDate, startTime, endTime, excludeBookingId = null, statuses = ['PENDING', 'APPROVED'] }
) {
  const result = await client.query(
    `SELECT id FROM bookings
     WHERE resource_id = $1
       AND booking_date = $2
       AND status = ANY($3::text[])
       AND (booking_date + start_time) < (booking_date + $5::time + INTERVAL '30 minutes')
       AND (booking_date + end_time + INTERVAL '30 minutes') > (booking_date + $4::time)
       AND ($6::int IS NULL OR id != $6)
     LIMIT 1`,
    [resourceId, bookingDate, statuses, startTime, endTime, excludeBookingId]
  );
  return result.rows[0];
}

async function insertBooking(client, { userId, resourceId, bookingDate, startTime, endTime, reason, undertakingAccepted }) {
  const result = await client.query(
    `INSERT INTO bookings
       (user_id, resource_id, booking_date, start_time, end_time, status, reason, undertaking_accepted)
     VALUES ($1, $2, $3, $4, $5, 'PENDING', $6, $7)
     RETURNING id, user_id, resource_id, booking_date::text AS booking_date,
               start_time, end_time, status, reason, undertaking_accepted,
               created_at, updated_at`,
    [userId, resourceId, bookingDate, startTime, endTime, reason, undertakingAccepted]
  );
  return result.rows[0];
}

async function approveBooking(client, id) {
  const result = await client.query(
    `UPDATE bookings SET status = 'APPROVED', updated_at = NOW()
     WHERE id = $1
     RETURNING id, user_id, resource_id, booking_date::text AS booking_date,
               start_time, end_time, status, reason, undertaking_accepted,
               created_at, updated_at`,
    [id]
  );
  return result.rows[0];
}

// Phase 19 — now takes a transaction-scoped `client` (previously used the
// shared pool directly) so the REJECTED path in bookingController.js can
// wrap the status update and its audit log row in one atomic transaction,
// same as APPROVE and MODIFY already do.
async function updateBookingStatus(client, id, status) {
  const result = await client.query(
    `UPDATE bookings SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, user_id, resource_id, booking_date::text AS booking_date,
               start_time, end_time, status, reason, undertaking_accepted,
               created_at, updated_at`,
    [status, id]
  );
  return result.rows[0];
}

async function modifyBooking(client, id, { resourceId, bookingDate, startTime, endTime }) {
  const result = await client.query(
    `UPDATE bookings
     SET resource_id = $1, booking_date = $2, start_time = $3, end_time = $4,
         status = 'PENDING', updated_at = NOW()
     WHERE id = $5
     RETURNING id, user_id, resource_id, booking_date::text AS booking_date,
               start_time, end_time, status, reason, undertaking_accepted,
               created_at, updated_at`,
    [resourceId, bookingDate, startTime, endTime, id]
  );
  return result.rows[0];
}

async function cancelBookingById(id) {
  const result = await pool.query(
    `UPDATE bookings
     SET status = 'CANCELLED', updated_at = NOW()
     WHERE id = $1 AND status IN ('PENDING', 'APPROVED')
     RETURNING id, user_id, resource_id, booking_date::text AS booking_date,
               start_time, end_time, status, reason, undertaking_accepted,
               created_at, updated_at`,
    [id]
  );
  return result.rows[0];
}

async function getBookedRanges(resourceId, bookingDate) {
  const result = await pool.query(
    `SELECT start_time, end_time, status
     FROM bookings
     WHERE resource_id = $1 AND booking_date = $2 AND status IN ('PENDING', 'APPROVED')
     ORDER BY start_time ASC`,
    [resourceId, bookingDate]
  );
  return result.rows;
}

module.exports = {
  getBookingById,
  getBookingsByUser,
  getAllBookings,
  findOverlappingBooking,
  insertBooking,
  approveBooking,
  updateBookingStatus,
  modifyBooking,
  cancelBookingById,
  getBookedRanges,
};