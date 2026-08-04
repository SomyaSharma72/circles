import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { RequestCard } from '../components/RequestCard';
import { Badge } from '../components/Badge';
import { TrustScoreBadge } from '../components/TrustScoreBadge';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  HeartHandshake,
  MessageSquare,
  Phone,
  Mail,
  Share2,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Gift,
  Star,
  User as UserIcon,
  Sparkles,
  Briefcase,
  Check,
  AlertCircle
} from 'lucide-react';
import { User, Review } from '../types';

export const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    requests,
    allUsers,
    reviews,
    currentUser,
    acceptRequest
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [offeredSuccess, setOfferedSuccess] = useState(false);

  // Find target request
  const request = requests.find((r) => r.id === id) || requests[0];

  // If request doesn't exist
  if (!request) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Help Request Not Found
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The requested favor may have been removed or fulfilled by another neighbor.
        </p>
        <Link
          to="/browse-help"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse All Requests
        </Link>
      </div>
    );
  }

  // Requester profile details lookup
  const requesterUser: User = allUsers.find((u) => u.id === request.requesterId) || {
    id: request.requesterId,
    name: request.requesterName,
    email: 'neighbor@example.com',
    avatar: request.requesterAvatar,
    neighborhood: request.neighborhood,
    address: 'Local Neighborhood',
    bio: 'Active community member passionate about mutual aid, neighborly support, and sustainable living.',
    trustScore: request.requesterTrustScore,
    verifiedNeighbor: true,
    joinedDate: 'Jan 2024',
    skills: ['Community Support', 'Gardening', 'Pet Sitting', 'Tech Assistance'],
    completedFavors: 14,
    reviewsCount: 11,
    phone: '(555) 234-5678',
    preferredContact: 'chat'
  };

  // Reviews for neighbor
  const neighborReviews: Review[] = reviews.filter(
    (rev) => rev.targetUserId === requesterUser.id || rev.authorId === requesterUser.id
  );

  // Fallback reviews preview if none in state
  const displayReviews: Review[] = neighborReviews.length > 0
    ? neighborReviews
    : [
        {
          id: 'fb-rev-1',
          targetUserId: requesterUser.id,
          authorId: 'u2',
          authorName: 'Marcus Chen',
          authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          rating: 5,
          comment: `${requesterUser.name} is super reliable, friendly, and punctual! Great neighbor.`,
          date: 'July 24, 2026',
          role: 'Helper'
        },
        {
          id: 'fb-rev-2',
          targetUserId: requesterUser.id,
          authorId: 'u3',
          authorName: 'Elena Rostova',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          rating: 5,
          comment: 'Extremely polite and helpful. Left everything neat and tidy. Highly recommend!',
          date: 'June 18, 2026',
          role: 'Requester'
        }
      ];

  // Related requests (same category or recent, excluding current)
  const relatedRequests = requests
    .filter((r) => r.id !== request.id)
    .sort((a, b) => (a.category === request.category ? -1 : 1))
    .slice(0, 3);

  const isOwner = currentUser?.id === request.requesterId;
  const isAccepted = request.status === 'accepted' || request.status === 'completed';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleOfferHelp = () => {
    acceptRequest(request.id);
    setOfferedSuccess(true);
    setTimeout(() => setOfferedSuccess(false), 4000);
  };

  const urgencyVariants = {
    urgent: { label: 'Urgent', variant: 'rose' as const },
    high: { label: 'High Priority', variant: 'amber' as const },
    medium: { label: 'Flexible', variant: 'sky' as const },
    low: { label: 'Low Urgency', variant: 'slate' as const },
  };

  const currentUrgency = urgencyVariants[request.urgency] || urgencyVariants.medium;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/browse-help"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse Requests</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alert banner if user just accepted */}
      <AnimatePresence>
        {offeredSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs sm:text-sm">
                <span className="font-bold">Favor Accepted!</span> You are now listed as the helper for this request.
              </div>
            </div>
            <Link
              to={`/chat/${request.id}`}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              Start Chat
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 1. MAIN REQUEST CARD ==================== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6"
      >
        {/* Badges & Status Row */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="indigo" className="text-xs px-3 py-1">
              {request.category}
            </Badge>
            <Badge variant={currentUrgency.variant} className="text-xs px-3 py-1">
              {currentUrgency.label}
            </Badge>
          </div>

          <div>
            {request.status === 'pending' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Seeking Helper
              </span>
            )}
            {request.status === 'accepted' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Accepted / In Progress
              </span>
            )}
            {request.status === 'completed' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Favor Completed
              </span>
            )}
            {request.status === 'cancelled' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400">
                Cancelled
              </span>
            )}
          </div>
        </div>

        {/* Request Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
          {request.title}
        </h1>

        {/* Requester Profile & Meta Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <img
              src={request.requesterAvatar}
              alt={request.requesterName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {request.requesterName}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  • {request.neighborhood}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  {request.distance}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Posted {request.createdAt}
                </span>
              </div>
            </div>
          </div>

          <TrustScoreBadge score={request.requesterTrustScore} size="md" />
        </div>

        {/* Required Date & Time & Reward Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Required Date
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {request.dateNeeded}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Time Frame
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {request.timeNeeded || 'Flexible / Any time'}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Neighbor Appreciation
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {request.pointsOrOffer || 'Neighborly Gratitude'}
              </div>
            </div>
          </div>
        </div>

        {/* Full Description */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Full Favor Description
          </h3>
          <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
            {request.description}
          </p>
        </div>

        {/* Action Buttons Bar */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
            {/* Contact Button */}
            <button
              onClick={() => setShowContactModal(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition-all shadow-xs"
            >
              <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Contact Neighbor</span>
            </button>

            {/* Offer Help Button */}
            {!isAccepted && !isOwner && (
              <button
                onClick={handleOfferHelp}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 active:scale-[0.98]"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Offer Help</span>
              </button>
            )}

            {/* Chat Button (if accepted or in progress) */}
            {isAccepted && (
              <Link
                to={`/chat/${request.id}`}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Chat & Coordinate</span>
              </Link>
            )}
          </div>

          {/* Helper info badge if assigned */}
          {request.helperName && (
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span>Assigned Helper:</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <img
                  src={request.helperAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={request.helperName}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span>{request.helperName}</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ==================== 2. ABOUT THE NEIGHBOR ==================== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                About the Neighbor
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Community profile & trust verification
              </p>
            </div>
          </div>

          <TrustScoreBadge score={requesterUser.trustScore} size="md" />
        </div>

        {/* Neighbor Main Info Box */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-4">
            <img
              src={requesterUser.avatar}
              alt={requesterUser.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {requesterUser.name}
                </h3>
                {requesterUser.verifiedNeighbor && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Neighbor
                  </span>
                )}
              </div>

              {/* Profession */}
              <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                <Briefcase className="w-3.5 h-3.5" />
                <span>
                  {requesterUser.bio?.split('.')[0] || 'Community Volunteer & Neighbor'}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
                {requesterUser.bio || 'Loves helping out nearby neighbors and building local community trust.'}
              </p>
            </div>
          </div>

          {/* Neighbor Stats */}
          <div className="flex items-center gap-4 text-center border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-around md:justify-start">
            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {requesterUser.completedFavors || 12}
              </div>
              <div className="text-[10px] font-semibold uppercase text-slate-400">
                Favors Done
              </div>
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {requesterUser.reviewsCount || 8}
              </div>
              <div className="text-[10px] font-semibold uppercase text-slate-400">
                Reviews
              </div>
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {requesterUser.joinedDate || '2023'}
              </div>
              <div className="text-[10px] font-semibold uppercase text-slate-400">
                Joined
              </div>
            </div>
          </div>
        </div>

        {/* Skills List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Skills & Services Offered
          </h4>
          <div className="flex flex-wrap gap-2">
            {(requesterUser.skills || ['Gardening', 'Pet Care', 'Handyman']).map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Reviews Preview */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Reviews Preview ({displayReviews.length})
            </h4>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>5.0 / 5 Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={rev.authorAvatar}
                      alt={rev.authorName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                        {rev.authorName}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {rev.role} • {rev.date}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-500" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ==================== 3. RELATED HELP REQUESTS ==================== */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Related Help Requests
            </h2>
          </div>
          <Link
            to="/browse-help"
            className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            View All Requests →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedRequests.map((rel) => (
            <RequestCard key={rel.id} request={rel} />
          ))}
        </div>
      </div>

      {/* ==================== CONTACT MODAL ==================== */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={requesterUser.avatar}
                    alt={requesterUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Contact {requesterUser.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {requesterUser.neighborhood}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {/* Chat Option */}
                <Link
                  to={`/chat/${request.id}`}
                  onClick={() => setShowContactModal(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all text-indigo-900 dark:text-indigo-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Send Direct Chat</div>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400">
                        In-app instant messaging (Recommended)
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold">Open Chat →</span>
                </Link>

                {/* Phone Option */}
                <a
                  href={`tel:${requesterUser.phone || '555-234-5678'}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all text-slate-900 dark:text-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Phone Number</div>
                      <div className="text-[11px] text-slate-500">
                        {requesterUser.phone || '(555) 234-5678'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">Call Now</span>
                </a>

                {/* Email Option */}
                <a
                  href={`mailto:${requesterUser.email}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all text-slate-900 dark:text-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Email Address</div>
                      <div className="text-[11px] text-slate-500">
                        {requesterUser.email}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-600">Send Email</span>
                </a>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
