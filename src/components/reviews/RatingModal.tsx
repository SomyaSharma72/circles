import React, { useState } from 'react';
import { Star, X, ShieldCheck, HeartHandshake, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitReview } from '../../services/api';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  requestTitle: string;
  reviewee: {
    _id?: string;
    id?: string;
    name: string;
    avatarUrl?: string;
    neighborhood?: string;
    trustScore?: number;
  };
  onSuccess?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor Experience',
  2: 'Fair Experience',
  3: 'Good & Helpful',
  4: 'Great Neighbor!',
  5: 'Outstanding & Highly Recommended! 🌟',
};

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  requestId,
  requestTitle,
  reviewee,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const revieweeId = reviewee._id || reviewee.id || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setError('Please select a star rating between 1 and 5');
      return;
    }
    if (!comment.trim()) {
      setError('Please share a few words about your neighborly experience');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await submitReview({
        requestId,
        revieweeId,
        rating,
        comment: comment.trim(),
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. You may have already reviewed this favor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-orange-100 overflow-hidden relative">
        {/* Header decoration */}
        <div className="bg-linear-to-r from-orange-500 to-amber-500 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 mx-auto rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mb-2 shadow-inner">
            <HeartHandshake className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-black">Rate & Review Neighbor</h2>
          <p className="text-xs text-orange-100 mt-1 font-medium line-clamp-1">
            Favor: {requestTitle}
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Review Submitted!</h3>
            <p className="text-xs text-slate-500 font-medium">
              Thank you for strengthening our neighborhood trust network!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Reviewee Info */}
            <div className="flex items-center gap-3 p-3 bg-orange-50/60 rounded-2xl border border-orange-100">
              <div className="w-11 h-11 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-sm overflow-hidden shrink-0">
                {reviewee.avatarUrl ? (
                  <img src={reviewee.avatarUrl} alt={reviewee.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{reviewee.name?.charAt(0) || 'N'}</span>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{reviewee.name}</h4>
                <p className="text-[11px] text-slate-500 truncate">{reviewee.neighborhood || 'Local Neighbor'}</p>
                <div className="flex items-center gap-1 text-[10px] text-orange-600 font-semibold mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Trust Score: {reviewee.trustScore ?? 100}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Star Rating */}
            <div className="text-center space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                How would you rate this neighbor's help?
              </label>
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-2xl transition transform hover:scale-125 focus:outline-hidden"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          isFilled
                            ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                            : 'text-slate-300 fill-slate-100'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs font-semibold text-orange-600 min-h-4">
                {RATING_LABELS[hoverRating || rating] || ''}
              </p>
            </div>

            {/* Comment Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Neighbor Review / Feedback
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share how helpful they were, promptness, care, etc..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:outline-hidden resize-none font-medium"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !rating}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-1.5"
              >
                {loading ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
