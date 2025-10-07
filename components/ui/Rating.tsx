
import React, { useState } from 'react';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

interface RatingProps {
  count: number;
  value: number;
  onChange: (value: number) => void;
  size?: number;
  color?: string;
}

const Rating: React.FC<RatingProps> = ({ count, value, onChange, size = 8, color = 'text-yellow-400' }) => {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);

  return (
    <div className="flex space-x-1" onMouseLeave={() => setHoverValue(undefined)}>
      {[...Array(count)].map((_, i) => {
        const ratingValue = i + 1;
        return (
          <button
            type="button"
            key={i}
            className={`${color} transition-transform duration-100 hover:scale-110`}
            onClick={() => onChange(ratingValue)}
            onMouseOver={() => setHoverValue(ratingValue)}
          >
            {(hoverValue || value) >= ratingValue ? 
                <StarSolid className={`h-${size} w-${size}`} /> : 
                <StarOutline className={`h-${size} w-${size}`} />
            }
          </button>
        );
      })}
    </div>
  );
};

export default Rating;
