import { Star } from 'lucide-react';
import './StarRating.css';

/**
 * StarRating atom
 * @param {number}  value     - rating value (0-5, supports decimals)
 * @param {number}  count     - number of reviews
 * @param {string}  size      - 'sm' | 'md' | 'lg'
 * @param {boolean} interactive - enables click to set rating
 * @param {function} onChange - called with new rating when interactive
 */
const StarRating = ({
  value     = 0,
  count,
  size      = 'md',
  interactive = false,
  onChange,
  className = '',
}) => {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = value >= i + 1;
    const half   = !filled && value > i && value < i + 1;
    return { filled, half };
  });

  return (
    <div className={`star-rating star-rating--${size} ${className}`}>
      <div className="star-rating__stars">
        {stars.map(({ filled, half }, i) => (
          <button
            key={i}
            type="button"
            className={`star ${filled ? 'star--filled' : ''} ${half ? 'star--half' : ''} ${!interactive ? 'star--static' : ''}`}
            onClick={() => interactive && onChange?.(i + 1)}
            aria-label={`${i + 1} star${i > 0 ? 's' : ''}`}
            tabIndex={interactive ? 0 : -1}
          >
            <Star size={size === 'sm' ? 12 : size === 'lg' ? 20 : 15} />
          </button>
        ))}
      </div>
      {count !== undefined && (
        <span className="star-rating__count">({count.toLocaleString()})</span>
      )}
    </div>
  );
};

export default StarRating;
