const asyncHandler = require('../utils/asyncHandler');
const { getDashboardStatistics } = require('../database/statsQueries');

const getStats = asyncHandler(async (req, res) => {
  const stats = await getDashboardStatistics();
  res.json({ success: true, message: 'Dashboard statistics retrieved', data: stats });
});

module.exports = { getStats };