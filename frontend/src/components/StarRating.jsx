import { Star } from 'lucide-react';

// size is now a numeric pixel value (Lucide's own size prop) instead of a
// Tailwind text-size class — callers updated accordingly in ResourceReviews.
function StarRating({ value, onChange, readOnly = false, size = 16 }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => {
        const filled = star <= value;
        const starEl = (
          <Star
            size={size}
            className={filled ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-muted-foreground'}
          />
        );
        if (readOnly) {
          return <span key={star}>{starEl}</span>;
        }
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            {starEl}
          </button>
        );
      })}
    </div>
  );
}

export default StarRating;