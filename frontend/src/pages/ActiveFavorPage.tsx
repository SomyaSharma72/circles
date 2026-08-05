import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { HelpRequest, User } from '../types';
import { Button } from '../components/Button';
import { Activity, Clock3, ClipboardList, HeartHandshake, Star } from 'lucide-react';

const mapRequest = (request: any): HelpRequest => ({
  id: String(request._id || request.id),
  title: request.title || 'Help request',
  description: request.description || 'No details provided yet.',
  category: request.category || 'Other',
  urgency: request.urgency || 'medium',
  neighborhood: request.neighborhood || request.location || 'Your community',
  distance: request.distance || 'Nearby',
  requesterId: request.requesterId || request.userId || request.user?._id || '',
  requesterName: request.requesterName || request.requester?.name || 'Neighbor',
  requesterAvatar: request.requesterAvatar || request.requester?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  requesterTrustScore: request.requesterTrustScore ?? request.requester?.trustScore ?? 0,
  helperId: request.acceptedBy || request.helperId || null,
  helperName: request.helperName || request.acceptedBy?.name || undefined,
  helperAvatar: request.helperAvatar || undefined,
  status: String(request.status || 'pending').toLowerCase() as HelpRequest['status'],
  createdAt:
    request.createdAt && !Number.isNaN(new Date(request.createdAt).getTime())
      ? new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : request.createdAt || '',
  dateNeeded: request.requiredDate || request.dateNeeded || 'Flexible',
  timeNeeded: request.timeNeeded || 'Flexible',
  pointsOrOffer: request.pointsOrOffer || request.reward || '',
  savedByUsers: request.savedByUsers || [],
  commentsCount: request.commentsCount ?? 0,
});

const mapBackendUser = (user: any): User => ({
  id: String(user._id || user.id),
  name: user.fullName || user.name || 'Neighbor',
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

export const ActiveFavorPage: React.FC = () => {
  const [activeRequests, setActiveRequests] = useState<HelpRequest[]>([]);
  const [requester, setRequester] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;

    const fetchActiveFavor = async () => {
      setLoading(true);
      setError(null);

      try {
        const [requestsRes, usersRes] = await Promise.all([
          apiClient.get('/api/requests?status=active&limit=6'),
          apiClient.get('/api/users?limit=1'),
        ]);

        const rawRequests = requestsRes.data?.data || requestsRes.data || [];
        const rawUsers = usersRes.data?.data || usersRes.data || [];
        const active = Array.isArray(rawRequests) ? rawRequests.map(mapRequest) : [];
        const firstUser = Array.isArray(rawUsers) && rawUsers.length > 0 ? mapBackendUser(rawUsers[0]) : null;

        if (!canceled) {
          setActiveRequests(active);
          setRequester(firstUser);
        }
      } catch (err: any) {
        console.error('Failed to load active favors:', err);
        if (!canceled) {
          setError(err?.response?.data?.message || err?.message || 'Unable to load active favors');
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    fetchActiveFavor();

    return () => {
      canceled = true;
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-800/80 overflow-hidden"
      >
        <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/20 text-cyan-200 text-xs font-semibold">
              <HeartHandshake className="w-4 h-4 text-cyan-300" />
              <span>Active community requests</span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Active Favor Board
              </h1>
              <p className="mt-1 text-sm sm:text-base text-slate-300 leading-relaxed">
                See the latest neighborly tasks that need support. Accept a favor, connect with the requester, and build trust locally.
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 text-sm text-slate-300 shadow-sm">
            <p className="font-semibold text-slate-100">Next step</p>
            <p className="mt-2 text-slate-400 text-xs leading-5">
              Pick a request and help a neighbor. The faster you act, the more trust you build in the community.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <Activity className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Current active favors</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time help requests from your community.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading active favors...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center space-y-4">
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Unable to load favors.</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : activeRequests.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <ClipboardList className="mx-auto w-12 h-12 text-slate-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No active favors right now</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                  Once neighbors post a new request, it will appear here for you to offer help.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.22em] text-cyan-600 font-semibold">
                          {request.category}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white truncate">
                          {request.title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                          {request.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3 items-center justify-start md:justify-end">
                        <div className="rounded-3xl bg-slate-50 dark:bg-slate-950/50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                          {request.status}
                        </div>
                        <div className="rounded-3xl bg-cyan-50 dark:bg-cyan-900/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200 border border-cyan-100 dark:border-cyan-800">
                          {request.createdAt}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                      <span>{request.neighborhood}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="w-4 h-4" />
                        {request.dateNeeded || 'Flexible timing'}
                      </span>
                      {request.pointsOrOffer && (
                        <span className="inline-flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {request.pointsOrOffer}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-2xl bg-cyan-500/10 text-cyan-500 p-2">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Stay involved</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Keep your profile up to date and respond quickly to requests.</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <p>Accepted favors help increase your trust score.</p>
              <p>Connect using the community messaging tools after accepting a request.</p>
              <p>Only commit to what you can deliver on time.</p>
            </div>
          </div>

          {requester ? (
            <div className="bg-slate-950/95 rounded-3xl border border-slate-800 p-6 text-slate-100 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <img src={requester.avatar} alt={requester.name} className="h-12 w-12 rounded-3xl object-cover" />
                <div>
                  <p className="text-sm font-semibold">Featured neighbor</p>
                  <p className="text-xs text-slate-400">{requester.name}</p>
                </div>
              </div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300 font-semibold mb-2">Fast response</p>
              <p className="text-sm leading-6 text-slate-300">
                {requester.bio || 'A neighbor who is active in the community and ready to support local favors.'}
              </p>
              <div className="mt-5 grid gap-3 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-300" />
                  <span>Trust score: {requester.trustScore}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-300" />
                  <span>{requester.completedFavors ?? 0} completed favors</span>
                </div>
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          These are active requests pulled from the live database. Keep checking for new help opportunities.
        </p>
        <Link to="/browse-help">
          <Button variant="solid" size="md">
            Browse all requests
          </Button>
        </Link>
      </div>
    </div>
  );
};
