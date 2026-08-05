import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpRequest } from '../types';
import { useApp } from '../context/AppContext';
import { Badge } from './Badge';
import { TrustScoreBadge } from './TrustScoreBadge';
import { MapPin, Clock, ArrowRight, Gift, Calendar, CheckCircle2, HeartHandshake, Sparkles } from 'lucide-react';

interface RequestCardProps {
  request: HelpRequest;
  explanation?: string;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, explanation }) => {
  const { currentUser, acceptRequest } = useApp();

  const isOwner = currentUser?.id === request.requesterId;
  const isPending = request.status === 'pending';
  const isAccepted = request.status === 'accepted';
  const isCompleted = request.status === 'completed';

  const urgencyVariants = {
    urgent: { label: 'Urgent', variant: 'rose' as const },
    high: { label: 'High Priority', variant: 'amber' as const },
    medium: { label: 'Flexible', variant: 'sky' as const },
    low: { label: 'Low Urgency', variant: 'slate' as const },
  };

  const currentUrgency = urgencyVariants[request.urgency] || urgencyVariants.medium;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all group flex flex-col justify-between"
    >
      <div>
        {/* Top Header info */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="indigo">{request.category}</Badge>
            <Badge variant={currentUrgency.variant}>{currentUrgency.label}</Badge>
          </div>

          <div>
            {isPending && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
                Seeking Helper
              </span>
            )}
            {isAccepted && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40">
                Accepted
              </span>
            )}
            {isCompleted && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <Link to={`/requests/${request.id}`} className="block group-hover:text-indigo-600 transition-colors">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 mb-2">
            {request.title}
          </h3>
        </Link>

        {/* AI Recommendation Explanation */}
        {explanation && (
          <div className="flex items-start gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 text-xs font-semibold mb-3 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <span className="leading-tight">{explanation}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {request.description}
        </p>

        {/* Offer / Reward */}
        {request.pointsOrOffer && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300 text-xs font-medium mb-4 border border-indigo-200/60 dark:border-indigo-800/40">
            <Gift className="w-3.5 h-3.5 text-indigo-600" />
            <span>Community Appreciation: {request.pointsOrOffer}</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        {/* Requester Profile Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={request.requesterAvatar}
              alt={request.requesterName}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {request.requesterName}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {request.distance}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {request.createdAt}
                </span>
              </div>
            </div>
          </div>

          <TrustScoreBadge score={request.requesterTrustScore} size="sm" showLabel={false} />
        </div>

        {/* Status Action */}
        <div className="flex items-center justify-between text-xs pt-2 gap-2 border-t border-slate-100 dark:border-slate-800/60 mt-1">
          <div className="flex items-center gap-1 text-slate-400 text-[11px] truncate">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Needed: {request.dateNeeded}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isPending && !isOwner && currentUser && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  acceptRequest(request.id);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Accept Request</span>
              </button>
            )}

            <Link
              to={`/requests/${request.id}`}
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

