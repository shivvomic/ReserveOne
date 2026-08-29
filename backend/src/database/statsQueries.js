const pool = require('./db');

// "Most booked" counts all booking requests ever made for a resource,
// regardless of status (PENDING/APPROVED/REJECTED/CANCELLED) — it's meant
// to reflect demand for that resource, not just successful bookings.
async function getDashboardStatistics() {
  const [resourceCount, bookingCount, userCount, pendingCount, mostBooked] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM resources'),
    pool.query('SELECT COUNT(*) FROM bookings'),
    pool.query('SELECT COUNT(*) FROM users'),
    pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'PENDING'"),
    pool.query(`
      SELECT r.id, r.name, r.category, COUNT(b.id)::int AS booking_count
      FROM resources r
      LEFT JOIN bookings b ON b.resource_id = r.id
      GROUP BY r.id, r.name, r.category
      ORDER BY booking_count DESC, r.name ASC
      LIMIT 5
    `),
  ]);

  return {
    totalResources: Number(resourceCount.rows[0].count),
    totalBookings: Number(bookingCount.rows[0].count),
    totalUsers: Number(userCount.rows[0].count),
    pendingBookings: Number(pendingCount.rows[0].count),
    mostBookedResources: mostBooked.rows,
  };
}

module.exports = { getDashboardStatistics };