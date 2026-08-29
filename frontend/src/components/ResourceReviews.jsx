import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { MessageSquare } from 'lucide-react';
import { fetchResourceReviews, submitResourceReview } from '../services/reviewService';
import StarRating from './StarRating';
import LoadingSpinner from './LoadingSpinner';
import Button from './Button';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString();
}

function ResourceReviews({ resourceId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(
    async (pageToLoad, append) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const data = await fetchResourceReviews(resourceId, pageToLoad);
        setAverageRating(data.averageRating);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
        setPage(data.page);
        setReviews((prev) => (append ? [...prev, ...data.reviews] : data.reviews));
      } catch (error) {
        console.error(error);
        toast.error('Could not load reviews.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [resourceId]
  );

  useEffect(() => {
    async function fetchInitialReviews() {
      await loadReviews(1, false);
    }
    fetchInitialReviews();
  }, [loadReviews]);

  function handleLoadMore() {
    loadReviews(page + 1, true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    try {
      await submitResourceReview(resourceId, { rating, comment: comment.trim() || null });
      toast.success('Review submitted. Thanks for the feedback!');
      setRating(0);
      setComment('');
      loadReviews(1, false);
    } catch (error) {
      const message = error.response?.data?.message || 'Could not submit your review.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-foreground">Reviews</h2>
        {totalCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <StarRating value={Math.round(averageRating)} readOnly size={14} />
            <span>
              {averageRating.toFixed(1)} ({totalCount} review{totalCount === 1 ? '' : 's'})
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 rounded-card border border-border bg-surface p-4">
        <p className="text-sm font-medium text-foreground">Write a review</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Only available if you have a completed, approved booking for this resource.
        </p>
        <div className="mt-3">
          <StarRating value={rating} onChange={setRating} size={26} />
        </div>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this resource (optional)"
          className="input-field mt-3"
        />
        <Button type="submit" variant="primary" size="sm" loading={submitting} className="mt-3">
          Submit review
        </Button>
      </form>

      <div className="mt-4">
        {loading ? (
          <LoadingSpinner label="Loading reviews..." />
        ) : reviews.length === 0 ? (
          <p className="flex items-center justify-center gap-2 rounded-card border border-dashed border-border py-8 text-center text-sm text-muted">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            No reviews yet. Be the first to share your experience.
          </p>
        ) : (
          <>
            <ul className="space-y-3">
              {reviews.map((review) => (
                <li key={review.id} className="rounded-card border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{review.user_name}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                  </div>
                  <div className="mt-1.5">
                    <StarRating value={review.rating} readOnly size={14} />
                  </div>
                  {review.comment && <p className="mt-2 text-sm text-muted">{review.comment}</p>}
                </li>
              ))}
            </ul>

            {page < totalPages && (
              <Button variant="secondary" onClick={handleLoadMore} loading={loadingMore} className="mt-4 w-full">
                Load more reviews
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ResourceReviews;