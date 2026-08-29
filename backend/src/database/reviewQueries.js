const pool = require('./db');

// The eligibility rule: an APPROVED booking for this exact resource whose
// end datetime has already passed. booking_date + end_time concatenates a
// DATE and a TIME into a full timestamp, which Postgres can compare
// directly against NOW(). PENDING and CANCELLED bookings never qualify —
// neither proves the resource was actually used.
async function findEligibleBooking(userId, resourceId) {
  const result = await pool.query(
    `SELECT id FROM bookings
     WHERE user_id = $1 AND resource_id = $2 AND status = 'APPROVED'
       AND (booking_date + end_time) < NOW()
     LIMIT 1`,
    [userId, resourceId]
  );
  return result.rows[0];
}

async function findReviewByUserAndResource(userId, resourceId) {
  const result = await pool.query(
    'SELECT * FROM reviews WHERE user_id = $1 AND resource_id = $2',
    [userId, resourceId]
  );
  return result.rows[0];
}

async function createReview({ userId, resourceId, rating, comment }) {
  const result = await pool.query(
    `INSERT INTO reviews (user_id, resource_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, resourceId, rating, comment || null]
  );
  return result.rows[0];
}

async function updateReview(id, { rating, comment }) {
  const result = await pool.query(
    `UPDATE reviews SET rating = $1, comment = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [rating, comment || null, id]
  );
  return result.rows[0];
}

async function getReviewsByResource(resourceId, { limit, offset }) {
  const result = await pool.query(
    `SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at,
            u.id AS user_id, u.name AS user_name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.resource_id = $1
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [resourceId, limit, offset]
  );
  return result.rows;
}

async function getReviewStatsByResource(resourceId) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS review_count, COALESCE(AVG(rating), 0)::numeric(3,2) AS average_rating
     FROM reviews WHERE resource_id = $1`,
    [resourceId]
  );
  return result.rows[0];
}

module.exports = {
  findEligibleBooking,
  findReviewByUserAndResource,
  createReview,
  updateReview,
  getReviewsByResource,
  getReviewStatsByResource,
};