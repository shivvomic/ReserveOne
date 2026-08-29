const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/statsController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/stats', verifyToken, requireRole('ADMIN'), getStats);

module.exports = router;