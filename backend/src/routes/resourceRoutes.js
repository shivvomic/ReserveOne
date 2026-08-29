const express = require('express');
const router = express.Router();
const {
  listResources,
  getResource,
  addResource,
  editResource,
  removeResource,
} = require('../controllers/resourceController');
const { submitReview, listResourceReviews } = require('../controllers/reviewController');
const { getResourceAvailability } = require('../controllers/bookingController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', listResources);
router.get('/:id', getResource);

router.post('/', requireRole('ADMIN'), addResource);
router.put('/:id', requireRole('ADMIN'), editResource);
router.delete('/:id', requireRole('ADMIN'), removeResource);

router.get('/:id/reviews', listResourceReviews);
router.post('/:id/reviews', submitReview);

router.get('/:id/availability', getResourceAvailability);

module.exports = router;