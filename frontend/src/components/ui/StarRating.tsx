import { Star } from 'lucide-react';
import clsx from 'clsx';

export function StarRating({
  value,
  onChange,
  size = 16,
  readOnly = true,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={clsx(!readOnly && 'cursor-pointer')}
          aria-label={`${star} sao`}
        >
          <Star
            size={size}
            className={star <= Math.round(value) ? 'fill-accent-500 text-accent-500' : 'fill-none text-gray-300'}
          />
        </button>
      ))}
    </div>
  );
}
