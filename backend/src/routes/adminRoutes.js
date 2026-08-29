const express = require('express');
const router = express.Router();
const { listAuditLogs } = require('../controllers/auditLogController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/audit-logs', requireRole('ADMIN'), listAuditLogs);

module.exports = router;