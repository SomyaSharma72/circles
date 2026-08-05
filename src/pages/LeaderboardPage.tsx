import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { getLeaderboard } from '../services/api';
import { getReputationTier } from '../utils/reputation';
import { TrustScoreBadge } from '../components/TrustScoreBadge';
import { Trophy, Award, HeartHandshake, Star, ShieldCheck, User as UserIcon } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const { allUsers } = useApp();
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchBoard = async () => {
      try {
        const data = await getLeaderboard();
        if (isMounted && data && data.length > 0) {
          setTopUsers(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch backend leaderboard, using local fallback:', err);
      }

      // Fallback sorting from local context users
      if (isMounted) {
        const sorted = [...allUsers]
          .sort((a, b) => {
            if (b.trustScore !== a.trustScore) {
              return b.trustScore - a.trustScore;
            }
            return (b.completedFavors || 0) - (a.completedFavors || 0);
          })
          .slice(0, 10);

        setTopUsers(sorted);
        setLoading(false);
      }
    };

    fetchBoard();
    return () => {
      isMounted = false;
    };
  }, [allUsers]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { label: '1st', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300', icon: '🏆' };
    if (rank === 2) return { label: '2nd', bg: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300', icon: '🥈' };
    if (rank === 3) return { label: '3rd', bg: 'bg-amber-900/10 text-amber-900 dark:bg-amber-950/40 dark:text-amber-400 border-amber-800/20', icon: '🥉' };
    return { label: `${rank}th`, bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200', icon: `#${rank}` };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Page Header */}
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

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Top Trusted Neighbors Leaderboard
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Recognizing neighbors who build community trust through exceptional support, prompt favor fulfillment, and outstanding neighbor reviews.
          </p>
        </div>

        {/* Background icon decoration */}
        <Trophy className="absolute right-4 -bottom-6 w-56 h-56 text-amber-500/10 pointer-events-none" />
      </motion.div>

      {/* Leaderboard Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Top 10 Community Neighbors
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Sorted by Trust Score & Completed Favors
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Calculating neighbor rankings...</p>
          </div>
        ) : topUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No active neighbors found on the leaderboard.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {topUsers.map((user, index) => {
              const rank = index + 1;
              const rankBadge = getRankBadge(rank);
              const tier = getReputationTier(user.trustScore);
              const avgRatingStr = (user.averageRating !== undefined ? user.averageRating : 5.0).toFixed(1);

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                    rank === 1
                      ? 'bg-amber-50/40 dark:bg-amber-950/10'
                      : rank === 2
                      ? 'bg-slate-50/60 dark:bg-slate-800/20'
                      : rank === 3
                      ? 'bg-amber-950/5 dark:bg-amber-950/10'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Left: Rank & User Info */}
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Rank Indicator */}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm border shrink-0 ${rankBadge.bg}`}>
                      {rankBadge.icon}
                    </div>

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                          <UserIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Name & Badge */}
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                          {user.name}
                        </h3>
                        {user.verifiedNeighbor && (
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        )}
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${tier.colorClass}`}>
                          {tier.badge}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.neighborhood || 'Neighbor'} • {user.profession || 'Community Member'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Stats (Trust Score, Favors, Rating) */}
                  <div className="flex items-center gap-6 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                    {/* Trust Score */}
                    <div className="text-center">
                      <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                        {user.trustScore} / 100
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Trust Score
                      </div>
                    </div>

                    {/* Completed Favors */}
                    <div className="text-center">
                      <div className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1">
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>{user.completedFavors || 0}</span>
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Completed
                      </div>
                    </div>

                    {/* Average Rating */}
                    <div className="text-center min-w-[60px]">
                      <div className="text-sm sm:text-base font-black text-amber-500 dark:text-amber-400 flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{avgRatingStr}</span>
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Avg Rating
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
