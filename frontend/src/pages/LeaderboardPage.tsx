import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { User } from '../types';
import { Button } from '../components/Button';
import { TrustScoreBadge } from '../components/TrustScoreBadge';
import { Trophy, ShieldCheck, User as UserIcon, Star } from 'lucide-react';

const mapBackendUser = (user: any): User => ({
  id: String(user._id || user.id),
  name: user.fullName || user.name || 'Neighborly Neighbor',
  email: user.email || '',
  avatar:
    user.avatar ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  neighborhood: user.neighborhood || 'Community',
  address: user.address || '',
  bio: user.bio || '',
  trustScore: user.trustScore ?? 0,
  verifiedNeighbor: true,
  joinedDate:
    user.createdAt && !Number.isNaN(new Date(user.createdAt).getTime())
      ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : user.joinedDate || '',
  skills: Array.isArray(user.skills) ? user.skills : [],
  completedFavors: user.completedFavors ?? 0,
  reviewsCount: user.totalReviews ?? user.reviewsCount ?? 0,
  phone: user.phone || '',
  preferredContact: user.preferredContact || 'chat',
});

export const LeaderboardPage: React.FC = () => {
  const [topNeighbors, setTopNeighbors] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;

    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get('/api/users/leaderboard?limit=10');
        const rawList = response.data?.data || response.data || [];
        if (!Array.isArray(rawList)) {
          throw new Error('Unexpected leaderboard response');
        }

        if (!canceled) {
          setTopNeighbors(rawList.map(mapBackendUser));
        }
      } catch (err: any) {
        console.error('Failed to load leaderboard:', err);
        if (!canceled) {
          setError(err?.response?.data?.message || err?.message || 'Unable to load leaderboard');
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    fetchLeaderboard();

    return () => {
      canceled = true;
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-indigo-800/40"
      >
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Community Reputation Ranking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Top Trusted Neighbors
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed">
            This leaderboard reflects the current community members who are building trust through help, reviews, and favor completion.
          </p>
        </div>
        <Trophy className="absolute right-4 -bottom-6 w-56 h-56 text-amber-500/10 pointer-events-none" />
      </motion.div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Leaderboard
            </h2>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Based on trust score and completed favors
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Loading community leaderboard...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-4">
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              Unable to load leaderboard.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : topNeighbors.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300">
              <UserIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No community members yet.
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              The leaderboard is empty until neighbors create profiles and start helping one another.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topNeighbors.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="w-7 h-7" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </h3>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        #{index + 1}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user.neighborhood || 'Community member'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full sm:w-auto text-center">
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-3 py-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.18em] font-semibold">
                      Trust Score
                    </p>
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      {user.trustScore}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-3 py-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.18em] font-semibold">
                      Favors
                    </p>
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      {user.completedFavors}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-3 py-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.18em] font-semibold">
                      Rating
                    </p>
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      {Number((user.reviewsCount > 0 ? user.trustScore / 20 : 5).toFixed(1))}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="text-right">
        <Link to="/browse-help">
          <Button variant="outline" size="md">
            Browse current requests
          </Button>
        </Link>
      </div>
    </div>
  );
};
