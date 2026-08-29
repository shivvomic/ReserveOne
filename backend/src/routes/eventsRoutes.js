const express = require('express');
const router = express.Router();
const { streamEvents } = require('../controllers/eventsController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/stream', verifyToken, streamEvents);

module.exports = router;