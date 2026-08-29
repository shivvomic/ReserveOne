const express = require('express');
const router = express.Router();
const { listUsers } = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, requireRole('ADMIN'), listUsers);

module.exports = router;