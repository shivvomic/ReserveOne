const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getResourceById } = require('../database/resourceQueries');
const {
  findEligibleBooking,
  findReviewByUserAndResource,
  createReview,
  updateReview,
  getReviewsByResource,
  getReviewStatsByResource,
} = require('../database/reviewQueries');

const PAGE_SIZE = 5;

function isValidRating(rating) {
  const num = Number(rating);
  return Number.isInteger(num) && num >= 1 && num <= 5;
}

const submitReview = asyncHandler(async (req, res) => {
  const resourceId = req.params.id;
  const { rating, comment } = req.body;

  if (!isValidRating(rating)) {
    throw new AppError('Rating must be a whole number between 1 and 5', 400);
  }
  if (comment !== undefined && comment !== null && typeof comment !== 'string') {
    throw new AppError('Comment must be text', 400);
  }

  const resource = await getResourceById(resourceId);
  if (!resource) {
    throw new AppError('Resource not found', 404);
  }

  const eligibleBooking = await findEligibleBooking(req.user.id, resourceId);
  if (!eligibleBooking) {
    throw new AppError(
      'You can only review resources you have an approved, completed booking for',
      403
    );
  }

  // Upsert behavior: a student who already reviewed this resource updates
  // their existing review instead of creating a duplicate row (enforced
  // at the DB level too, via the unique constraint from the migration).
  const existingReview = await findReviewByUserAndResource(req.user.id, resourceId);

  const review = existingReview
    ? await updateReview(existingReview.id, { rating: Number(rating), comment })
    : await createReview({ userId: req.user.id, resourceId, rating: Number(rating), comment });

  res.status(existingReview ? 200 : 201).json({
    success: true,
    message: existingReview ? 'Review updated successfully' : 'Review submitted successfully',
    data: review,
  });
});

const listResourceReviews = asyncHandler(async (req, res) => {
  const resourceId = req.params.id;

  const resource = await getResourceById(resourceId);
  if (!resource) {
    throw new AppError('Resource not found', 404);
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [reviews, stats] = await Promise.all([
    getReviewsByResource(resourceId, { limit: PAGE_SIZE, offset }),
    getReviewStatsByResource(resourceId),
  ]);

  const totalPages = Math.max(1, Math.ceil(stats.review_count / PAGE_SIZE));

  res.json({
    success: true,
    message: 'Reviews retrieved',
    data: {
      reviews,
      averageRating: Number(stats.average_rating),
      totalCount: stats.review_count,
      page,
      totalPages,
    },
  });
});

module.exports = { submitReview, listResourceReviews };