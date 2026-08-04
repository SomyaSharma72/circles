import React from 'react';
import { User } from '../types';
import { TrustScoreBadge } from './TrustScoreBadge';
import { MapPin, Calendar, HeartHandshake, Star } from 'lucide-react';

interface ProfileCardProps {
  user: User;
  compact?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, compact = false }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-start gap-4">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/20"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
              {user.name}
            </h3>
            <TrustScoreBadge score={user.trustScore} size="sm" />
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{user.neighborhood}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
            {user.bio}
          </p>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
              {user.completedFavors}
            </div>
            <div className="text-[11px] text-slate-500">Favors Completed</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {user.reviewsCount}
            </div>
            <div className="text-[11px] text-slate-500">Neighbor Reviews</div>
          </div>
        </div>
      )}
    </div>
  );
};
