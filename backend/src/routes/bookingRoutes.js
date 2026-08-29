const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookingsHandler,
  updateBookingStatusHandler,
  modifyBookingHandler,
  cancelBooking,
  downloadUndertakingPdf,
} = require('../controllers/bookingController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/', requireRole('ADMIN'), getAllBookingsHandler);
router.put('/:id/status', requireRole('ADMIN'), updateBookingStatusHandler);
router.put('/:id', requireRole('ADMIN'), modifyBookingHandler);
router.get('/:id/undertaking/pdf', downloadUndertakingPdf);
router.delete('/:id', cancelBooking);

module.exports = router;