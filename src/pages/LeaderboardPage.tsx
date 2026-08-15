import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User, CommunityMetrics } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useLocationContext } from '../context/LocationContext';
import {
  Trophy,
  ShieldCheck,
  CheckCircle2,
  Users,
  Sparkles,
  MapPin,
  Star,
} from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const { location } = useLocationContext();
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [metrics, setMetrics] = useState<CommunityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/leaderboard');
      setLeaderboard(res.data?.leaderboard || []);
      setMetrics(res.data?.metrics || null);
    } catch (err: any) {
      console.error('Leaderboard fetch error:', err);
      setError(err.message || 'Failed to load community leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FBFAF7] rounded-[2.5rem] p-6 sm:p-8 border border-[#E6DFD3] shadow-2xs space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#355E3B]/10 border border-[#355E3B]/20 text-[#355E3B] rounded-full text-xs font-extrabold">
          <Trophy className="w-3.5 h-3.5 text-[#355E3B]" />
          <span>Circles Trust Leaderboard</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#2F2F2F] tracking-tight font-heading">
          Most Helpful Neighbors
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
          Verified neighbors who lend tools, offer tutoring, share pet care, and build real community trust in {location.neighborhood || 'your circle'} & surrounding blocks.
        </p>
      </div>

      {/* Stats Strip */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#FBFAF7] p-4 rounded-3xl border border-[#E6DFD3] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#355E3B]/10 text-[#355E3B] flex items-center justify-center font-extrabold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-[#2F2F2F] leading-none font-heading">{metrics.totalNeighbors}</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">Verified Neighbors</p>
            </div>
          </div>

          <div className="bg-[#FBFAF7] p-4 rounded-3xl border border-[#E6DFD3] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-[#2F2F2F] leading-none font-heading">{metrics.completedFavors}</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">Favors Completed</p>
            </div>
          </div>

          <div className="bg-[#FBFAF7] p-4 rounded-3xl border border-[#E6DFD3] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C96C4A]/10 text-[#C96C4A] flex items-center justify-center font-extrabold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-[#2F2F2F] leading-none font-heading">{metrics.uniqueSkillsShared}</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">Skills Shared</p>
            </div>
          </div>

          <div className="bg-[#FBFAF7] p-4 rounded-3xl border border-[#E6DFD3] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-extrabold">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-[#2F2F2F] leading-none font-heading">{metrics.averageCommunityRating} / 5.0</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">Trust Rating</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      {loading ? (
        <LoadingSpinner label="Calculating trusted neighbor rankings..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchLeaderboard} />
      ) : leaderboard.length === 0 ? (
        <div className="bg-[#FBFAF7] border border-[#E6DFD3] rounded-3xl p-8 text-center text-slate-500 text-xs font-medium">
          No neighbors registered yet. Be the first to join!
        </div>
      ) : (
        <div className="bg-[#FBFAF7] border border-[#E6DFD3] rounded-[2rem] overflow-hidden shadow-2xs">
          <div className="p-5 border-b border-[#E6DFD3] flex items-center justify-between">
            <h2 className="font-extrabold text-[#2F2F2F] text-base font-heading">Circle of Trust Honor Roll</h2>
            <span className="text-xs text-slate-500 font-medium">Ranked by Trust Score & Favors</span>
          </div>

          <div className="divide-y divide-[#E6DFD3]">
            {leaderboard.map((user, rank) => (
              <div key={user._id || user.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#F5F1E8] transition">
                <div className="flex items-center gap-3.5">
                  {/* Rank Badge */}
                  <div
                    className={`w-8 h-8 rounded-full font-extrabold text-xs flex items-center justify-center shrink-0 ${
                      rank === 0
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : rank === 1
                        ? 'bg-[#355E3B]/10 text-[#355E3B] border border-[#355E3B]/20'
                        : rank === 2
                        ? 'bg-[#C96C4A]/10 text-[#C96C4A] border border-[#C96C4A]/20'
                        : 'bg-[#F5F1E8] text-slate-600'
                    }`}
                  >
                    #{rank + 1}
                  </div>

                  {/* Avatar & Name */}
                  <div className="w-10 h-10 rounded-full bg-[#355E3B] text-white font-extrabold flex items-center justify-center text-sm shrink-0 border border-[#355E3B]">
                    {user.name.charAt(0)}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-[#2F2F2F] text-sm flex items-center gap-2 font-heading">
                      <span>{user.name}</span>
                      {rank === 0 && <span className="text-[10px] text-[#355E3B] bg-[#355E3B]/10 px-2.5 py-0.5 rounded-full font-bold">🏆 Circle Host</span>}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C96C4A]" /> {user.neighborhood || location.neighborhood || 'Local Circle'} • {user.profession}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1 text-xs font-extrabold text-[#355E3B] bg-[#355E3B]/10 px-3 py-1 rounded-full border border-[#355E3B]/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#355E3B]" />
                    <span>{user.trustScore} Trust</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">
                    {user.completedFavors} Favors
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
