const asyncHandler = require('../utils/asyncHandler');
const { getAllUsers } = require('../database/userQueries');

const listUsers = asyncHandler(async (req, res) => {
  const users = await getAllUsers();
  res.json({ success: true, message: 'Users retrieved', data: users });
});

module.exports = { listUsers };