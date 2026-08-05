import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface TrustScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1 font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40 ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
      title="Neighborly Verified Trust Score"
    >
      <ShieldCheck className={size === 'sm' ? 'w-3.5 h-3.5 text-emerald-600' : 'w-4 h-4 text-emerald-600'} />
      <span>{score}%</span>
      {showLabel && <span className="text-emerald-600/80 font-medium">Trust</span>}
    </div>
  );
};
