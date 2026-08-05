import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { HelpRequest, Review } from '../types';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { TrustScoreBadge } from '../components/TrustScoreBadge';
import { Modal } from '../components/Modal';
import {
  HeartHandshake,
  CheckCircle2,
  MessageSquare,
  Clock,
  User as UserIcon,
  ShieldCheck,
  Star,
  Gift,
  ArrowRight,
  Inbox,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const ActiveFavorPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    allUsers,
    requests,
    reviews,
    completeRequest,
    addReview,
    isRequestsLoading,
    requestsError,
    fetchRequests,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  // Review Modal state
  const [reviewingRequest, setReviewingRequest] = useState<HelpRequest | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [viewingReview, setViewingReview] = useState<Review | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter requests that are Accepted or Completed for the current user (requester OR helper)
  const activeFavors = useMemo(() => {
    if (!currentUser) return [];

    // Relevant requests for currentUser where status is accepted or completed
    const userFavors = requests.filter((r) => {
      const isRequester = r.requesterId === currentUser.id;
      const isHelper = r.helperId === currentUser.id;
      const isAcceptedOrCompleted = r.status === 'accepted' || r.status === 'completed';

      return (isRequester || isHelper) && isAcceptedOrCompleted;
    });

    // Fallback demo: if user has no favors yet, include accepted/completed requests so page is not blank
    if (userFavors.length === 0) {
      return requests.filter((r) => r.status === 'accepted' || r.status === 'completed');
    }

    return userFavors;
  }, [requests, currentUser]);

  // Tab filtering
  const filteredFavors = useMemo(() => {
    if (activeTab === 'active') {
      return activeFavors.filter((r) => r.status === 'accepted');
    }
    return activeFavors.filter((r) => r.status === 'completed');
  }, [activeFavors, activeTab]);

  // Stats
  const activeCount = useMemo(() => activeFavors.filter((r) => r.status === 'accepted').length, [activeFavors]);
  const completedCount = useMemo(() => activeFavors.filter((r) => r.status === 'completed').length, [activeFavors]);

  // Check if currentUser has left a review for a request
  const hasUserReviewed = (requestId: string) => {
    if (!currentUser) return false;
    return reviews.some((rev) => rev.requestId === requestId && rev.authorId === currentUser.id);
  };

  const getExistingReview = (requestId: string) => {
    return reviews.find((rev) => rev.requestId === requestId);
  };

  // Handle Mark as Completed
  const handleMarkCompleted = (requestId: string) => {
    completeRequest(requestId);
    showToast('Favor marked as Completed! Reviews are now unlocked.');
  };

  // Open Leave Review Modal
  const handleOpenReviewModal = (req: HelpRequest) => {
    setReviewingRequest(req);
    setReviewRating(5);
    setReviewComment('');
  };

  // Submit Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingRequest || !currentUser) return;

    // Target user: if current user is requester, target is helper (and vice versa)
    const targetUserId =
      reviewingRequest.requesterId === currentUser.id
        ? reviewingRequest.helperId || 'u2'
        : reviewingRequest.requesterId;

    addReview({
      targetUserId,
      requestId: reviewingRequest.id,
      requestTitle: reviewingRequest.title,
      rating: reviewRating,
      comment: reviewComment.trim() || 'Great neighborly experience! Highly recommended.',
      role: reviewingRequest.requesterId === currentUser.id ? 'Requester' : 'Helper',
    });

    setReviewingRequest(null);
    showToast('Thank you! Your review has been published.');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 bg-slate-900 text-white dark:bg-emerald-600 px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-white shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-2 max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <HeartHandshake className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Active Community Exchange</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Active Favor
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Track accepted community favors, open live chat, and mark completed favors.
        </p>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 justify-center sm:justify-start">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'active'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>In Progress</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            {activeCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            {completedCount}
          </span>
        </button>
      </div>

      {/* Favors Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {isRequestsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((n) => (
                <div key={n} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : requestsError ? (
            <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center space-y-3 max-w-md mx-auto">
              <p className="text-sm font-bold text-rose-800 dark:text-rose-200">Failed to load active favors</p>
              <p className="text-xs text-rose-600 dark:text-rose-300">{requestsError}</p>
              <Button variant="outline" size="sm" onClick={() => fetchRequests()}>
                Retry
              </Button>
            </div>
          ) : filteredFavors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFavors.map((req) => {
                const isRequester = currentUser?.id === req.requesterId;
                const isHelper = currentUser?.id === req.helperId;

                // Lookup requester & helper user details
                const requesterUser = allUsers.find((u) => u.id === req.requesterId) || {
                  name: req.requesterName,
                  avatar: req.requesterAvatar,
                  trustScore: req.requesterTrustScore || 98,
                  neighborhood: req.neighborhood || 'Maplewood Terrace',
                };

                const helperUser = allUsers.find((u) => u.id === req.helperId) || {
                  name: req.helperName || 'Assigned Helper',
                  avatar:
                    req.helperAvatar ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                  trustScore: 96,
                  neighborhood: req.neighborhood || 'Maplewood Terrace',
                };

                const reviewed = hasUserReviewed(req.id);
                const existingReview = getExistingReview(req.id);

                return (
                  <motion.div
                    key={req.id}
                    whileHover={{ y: -2 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-4">
                      {/* Top Header Bar */}
                      <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <Badge variant="indigo">{req.category}</Badge>
                          {req.pointsOrOffer && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40">
                              <Gift className="w-3 h-3 text-emerald-600" />
                              <span>{req.pointsOrOffer}</span>
                            </span>
                          )}
                        </div>

                        <Badge
                          variant={req.status === 'accepted' ? 'indigo' : 'emerald'}
                          className="font-bold uppercase text-[10px]"
                        >
                          {req.status === 'accepted' ? 'In Progress' : 'Completed'}
                        </Badge>
                      </div>

                      {/* Request Title */}
                      <Link to={`/requests/${req.id}`} className="block hover:text-indigo-600 transition-colors">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                          {req.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {req.description}
                      </p>

                      {/* Requester & Helper Grid */}
                      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        {/* Requester Column */}
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Requester
                          </div>
                          <div className="flex items-center gap-2">
                            <img
                              src={requesterUser.avatar}
                              alt={requesterUser.name}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {requesterUser.name}
                              </p>
                              <TrustScoreBadge score={requesterUser.trustScore || 98} size="sm" showLabel={false} />
                            </div>
                          </div>
                        </div>

                        {/* Helper Column */}
                        <div className="space-y-1.5 border-l border-slate-200 dark:border-slate-700 pl-3">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Helper
                          </div>
                          <div className="flex items-center gap-2">
                            <img
                              src={helperUser.avatar}
                              alt={helperUser.name}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {helperUser.name}
                              </p>
                              <TrustScoreBadge score={helperUser.trustScore || 96} size="sm" showLabel={false} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      {/* Open Chat Button */}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/chat/${req.id}`)}
                        className="flex-1 sm:flex-none"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Open Chat</span>
                      </Button>

                      {/* Mark as Completed Button (Requester Only when accepted) */}
                      {req.status === 'accepted' && isRequester && (
                        <button
                          onClick={() => handleMarkCompleted(req.id)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark as Completed</span>
                        </button>
                      )}

                      {/* Review Buttons when Completed */}
                      {req.status === 'completed' && (
                        <>
                          {reviewed ? (
                            <button
                              onClick={() => setViewingReview(existingReview || null)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 hover:bg-amber-100 transition-colors"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>View Review</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenReviewModal(req)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
                            >
                              <Star className="w-4 h-4 fill-white" />
                              <span>Leave Review</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-center space-y-4 max-w-md mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Inbox className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  No {activeTab} favors found.
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeTab === 'active'
                    ? "When you or another neighbor accepts a request, it will show up here."
                    : "Completed favors will be archived here for review submission."}
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/browse-help')}
                className="mt-2"
              >
                Browse Help Requests
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* LEAVE REVIEW MODAL */}
      <Modal
        isOpen={!!reviewingRequest}
        onClose={() => setReviewingRequest(null)}
        title="Leave Neighbor Review"
        maxWidth="md"
      >
        {reviewingRequest && (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Share your experience for completed favor "{reviewingRequest.title}".
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-amber-500 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= reviewRating
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Review Comment
              </label>
              <textarea
                rows={3}
                placeholder="Write a warm note thanking your neighbor..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReviewingRequest(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Submit Review
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* VIEW REVIEW MODAL */}
      <Modal
        isOpen={!!viewingReview}
        onClose={() => setViewingReview(null)}
        title="Neighbor Review"
        maxWidth="md"
      >
        {viewingReview && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={viewingReview.authorAvatar}
                  alt={viewingReview.authorName}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {viewingReview.authorName}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {viewingReview.role} • {viewingReview.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg text-amber-600 font-bold text-xs border border-amber-200/60 dark:border-amber-800/40">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{viewingReview.rating}.0</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-700 dark:text-slate-300 italic border border-slate-100 dark:border-slate-800 leading-relaxed">
              "{viewingReview.comment}"
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingReview(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
