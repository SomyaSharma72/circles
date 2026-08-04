import React from 'react';
import { Review } from '../types';
import { Star } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={review.authorAvatar}
            alt={review.authorName}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {review.authorName}
            </div>
            <div className="text-[10px] text-slate-400">{review.role} • {review.date}</div>
          </div>
        </div>

        <div className="flex items-center gap-0.5 text-amber-500">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star
              key={idx}
              className={`w-3.5 h-3.5 ${
                idx < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
        "{review.comment}"
      </p>

      {review.requestTitle && (
        <div className="text-[11px] text-slate-400 pt-1">
          Favor: <span className="font-medium text-slate-600 dark:text-slate-300">{review.requestTitle}</span>
        </div>
      )}
    </div>
  );
};
