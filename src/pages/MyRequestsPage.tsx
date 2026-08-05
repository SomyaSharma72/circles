import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { HelpRequest, RequestCategory, Review } from '../types';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { TrustScoreBadge } from '../components/TrustScoreBadge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import {
  HeartHandshake,
  Clock,
  UserCheck,
  CheckCircle2,
  Award,
  Edit3,
  XCircle,
  MessageSquare,
  ArrowRight,
  Star,
  MapPin,
  Calendar,
  Inbox,
  Sparkles,
  Gift,
  Layers,
  AlertCircle,
  Check,
} from 'lucide-react';

type TabType = 'pending' | 'accepted' | 'completed';

const CATEGORIES: RequestCategory[] = [
  'Gardening',
  'Pet Care',
  'Handyman',
  'Tech Support',
  'Tutoring',
  'Errands',
  'Borrow Items',
  'Moving',
  'Elderly Care',
  'Other',
];

export const MyRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    requests,
    reviews,
    cancelRequest,
    updateRequest,
    completeRequest,
    addReview,
    isRequestsLoading,
    requestsError,
    fetchRequests,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('pending');

  // Modal States
  const [editingRequest, setEditingRequest] = useState<HelpRequest | null>(null);
  const [reviewingRequest, setReviewingRequest] = useState<HelpRequest | null>(null);
  const [viewingReview, setViewingReview] = useState<Review | null>(null);
  const [cancelConfirmRequest, setCancelConfirmRequest] = useState<HelpRequest | null>(null);

  // Edit Form State
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<RequestCategory>('Gardening');
  const [editDescription, setEditDescription] = useState('');
  const [editUrgency, setEditUrgency] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [editDateNeeded, setEditDateNeeded] = useState('');
  const [editPointsOrOffer, setEditPointsOrOffer] = useState('');

  // Review Form State
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');

  // Filter requests relevant to currentUser
  const myFavors = useMemo(() => {
    if (!currentUser) return requests;
    const filtered = requests.filter(
      (r) => r.requesterId === currentUser.id || r.helperId === currentUser.id
    );
    // Fallback if current user has no associated favors yet in demo
    return filtered.length > 0 ? filtered : requests;
  }, [requests, currentUser]);

  // Statistics
  const stats = useMemo(() => {
    const total = myFavors.length;
    const pending = myFavors.filter((r) => r.status === 'pending').length;
    const accepted = myFavors.filter((r) => r.status === 'accepted').length;
    const completed = myFavors.filter((r) => r.status === 'completed').length;
    return { total, pending, accepted, completed };
  }, [myFavors]);

  // Filter by active tab
  const tabFavors = useMemo(() => {
    return myFavors.filter((r) => r.status === activeTab);
  }, [myFavors, activeTab]);

  // Helper to open Edit Modal
  const handleOpenEditModal = (req: HelpRequest) => {
    setEditingRequest(req);
    setEditTitle(req.title);
    setEditCategory(req.category);
    setEditDescription(req.description);
    setEditUrgency(req.urgency);
    setEditDateNeeded(req.dateNeeded);
    setEditPointsOrOffer(req.pointsOrOffer || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;

    updateRequest(editingRequest.id, {
      title: editTitle.trim(),
      category: editCategory,
      description: editDescription.trim(),
      urgency: editUrgency,
      dateNeeded: editDateNeeded.trim(),
      pointsOrOffer: editPointsOrOffer.trim(),
    });

    setEditingRequest(null);
  };

  // Helper to handle Cancel Request
  const handleConfirmCancel = () => {
    if (!cancelConfirmRequest) return;
    cancelRequest(cancelConfirmRequest.id);
    setCancelConfirmRequest(null);
  };

  // Helper to open Leave Review Modal
  const handleOpenReviewModal = (req: HelpRequest) => {
    setReviewingRequest(req);
    setReviewRating(5);
    setReviewComment('');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingRequest || !currentUser) return;

    // Determine target user (if current user was requester, target is helper, and vice versa)
    const targetUserId =
      reviewingRequest.requesterId === currentUser.id
        ? reviewingRequest.helperId || 'u2'
        : reviewingRequest.requesterId;

    addReview({
      targetUserId,
      requestId: reviewingRequest.id,
      requestTitle: reviewingRequest.title,
      rating: reviewRating,
      comment: reviewComment.trim() || 'Great experience working with this neighbor!',
      role: reviewingRequest.requesterId === currentUser.id ? 'Requester' : 'Helper',
    });

    setReviewingRequest(null);
  };

  // Helper to check if a request has a review
  const getExistingReview = (requestId: string) => {
    return reviews.find((rev) => rev.requestId === requestId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* 1. Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-2 max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <HeartHandshake className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Community Exchange Dashboard</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          My Favors
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Track every favor you've requested or completed.
        </p>
      </motion.div>

      {/* 2. Statistics Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Requests Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Requests
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {stats.total}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Pending Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Pending
            </p>
            <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {stats.pending}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Accepted Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-200/60 dark:border-blue-900/40 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              Accepted
            </p>
            <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
              {stats.accepted}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Completed Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Completed
            </p>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.completed}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      {/* 3. Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {(['pending', 'accepted', 'completed'] as TabType[]).map((tab) => {
          const isActive = activeTab === tab;
          const count =
            tab === 'pending'
              ? stats.pending
              : tab === 'accepted'
              ? stats.accepted
              : stats.completed;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold capitalize transition-all flex items-center gap-2 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Content / Grid / Empty State */}
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
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : requestsError ? (
            <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center space-y-3 max-w-md mx-auto">
              <p className="text-sm font-bold text-rose-800 dark:text-rose-200">Failed to load favors</p>
              <p className="text-xs text-rose-600 dark:text-rose-300">{requestsError}</p>
              <Button variant="outline" size="sm" onClick={() => fetchRequests()}>
                Retry
              </Button>
            </div>
          ) : tabFavors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tabFavors.map((req) => {
                const existingReview = getExistingReview(req.id);
                const isHelper = req.helperId === currentUser?.id;
                const otherPartyName = isHelper ? req.requesterName : req.helperName;
                const otherPartyAvatar = isHelper
                  ? req.requesterAvatar
                  : req.helperAvatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

                return (
                  <motion.div
                    key={req.id}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Badge variant="indigo">{req.category}</Badge>
                          {req.urgency === 'urgent' && <Badge variant="rose">Urgent</Badge>}
                          {req.urgency === 'high' && <Badge variant="amber">High Priority</Badge>}
                        </div>

                        {/* Status Badge */}
                        <Badge
                          variant={
                            req.status === 'pending'
                              ? 'amber'
                              : req.status === 'accepted'
                              ? 'indigo'
                              : 'emerald'
                          }
                          className="capitalize font-bold"
                        >
                          {req.status}
                        </Badge>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                          {req.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {req.description}
                        </p>
                      </div>

                      {/* Reward / Offer if present */}
                      {req.pointsOrOffer && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40">
                          <Gift className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Offer: {req.pointsOrOffer}</span>
                        </div>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {req.distance || '0.3 miles away'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {req.dateNeeded}
                        </span>
                      </div>

                      {/* Neighbor Helping Info (if assigned) */}
                      {req.status !== 'pending' && otherPartyName && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={otherPartyAvatar}
                              alt={otherPartyName}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                            />
                            <div>
                              <p className="text-[11px] font-medium text-slate-400">
                                {isHelper ? 'Requested by' : 'Neighbor assisting'}
                              </p>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {otherPartyName}
                              </p>
                            </div>
                          </div>
                          <TrustScoreBadge
                            score={req.requesterTrustScore || 98}
                            size="sm"
                            showLabel={false}
                          />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons based on Tab */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                      {/* PENDING TAB ACTIONS */}
                      {req.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditModal(req)}
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCancelConfirmRequest(req)}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/40"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Cancel
                          </Button>
                        </>
                      )}

                      {/* ACCEPTED TAB ACTIONS */}
                      {req.status === 'accepted' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/chat/${req.id}`)}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Open Chat
                          </Button>

                          {req.requesterId === currentUser?.id && (
                            <button
                              onClick={() => completeRequest(req.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark as Completed</span>
                            </button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/requests/${req.id}`)}
                          >
                            View Details
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}

                      {/* COMPLETED TAB ACTIONS */}
                      {req.status === 'completed' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/requests/${req.id}`)}
                          >
                            View Details
                          </Button>

                          {existingReview ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingReview(existingReview)}
                              className="text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950/30"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              View Review
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenReviewModal(req)}
                            >
                              <Star className="w-3.5 h-3.5" />
                              Leave Review
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* 5. Empty State */
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-center space-y-4 max-w-md mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Inbox className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  No favors found.
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You don't have any favors under the <span className="font-semibold text-emerald-600 capitalize">{activeTab}</span> tab right now.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/browse-help')}
                className="mt-2"
              >
                Browse Help
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* EDIT FAVOR MODAL */}
      <Modal
        isOpen={!!editingRequest}
        onClose={() => setEditingRequest(null)}
        title="Edit Favor Request"
        maxWidth="lg"
      >
        {editingRequest && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Input
              label="Request Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="e.g. Need help moving heavy table..."
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as RequestCategory)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Priority Urgency
                </label>
                <select
                  value={editUrgency}
                  onChange={(e) =>
                    setEditUrgency(e.target.value as 'low' | 'medium' | 'high' | 'urgent')
                  }
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date Needed"
                value={editDateNeeded}
                onChange={(e) => setEditDateNeeded(e.target.value)}
                placeholder="e.g. Today (6:00 PM)"
              />

              <Input
                label="Reward / Gratitude Offer"
                value={editPointsOrOffer}
                onChange={(e) => setEditPointsOrOffer(e.target.value)}
                placeholder="e.g. Homemade Cookies 🍪"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingRequest(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* CONFIRM CANCEL MODAL */}
      <Modal
        isOpen={!!cancelConfirmRequest}
        onClose={() => setCancelConfirmRequest(null)}
        title="Cancel Favor Request"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to cancel "
            <span className="font-semibold text-slate-900 dark:text-white">
              {cancelConfirmRequest?.title}
            </span>
            "? This request will be marked as cancelled.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelConfirmRequest(null)}
            >
              Keep Request
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmCancel}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Yes, Cancel Favor
            </Button>
          </div>
        </div>
      </Modal>

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
              Share your experience for favor "{reviewingRequest.title}".
            </p>

            {/* Star Rating Selection */}
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

            {/* Comment Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Review Comment
              </label>
              <textarea
                rows={3}
                placeholder="Write a warm note thanking your neighbor..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
