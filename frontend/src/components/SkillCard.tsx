import React from 'react';
import { SkillOffer } from '../types';
import { Badge } from './Badge';
import { TrustScoreBadge } from './TrustScoreBadge';
import { MapPin, Star, Calendar, MessageSquare, Edit3, Trash2, Navigation } from 'lucide-react';
import { Button } from './Button';

interface SkillCardProps {
  skill: SkillOffer;
  onContact?: (skill: SkillOffer) => void;
  onEdit?: (skill: SkillOffer) => void;
  onDelete?: (skill: SkillOffer) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill, onContact, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="indigo">{skill.category}</Badge>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{skill.rating}</span>
            <span className="text-slate-400 font-normal">({skill.reviewCount})</span>
          </div>
        </div>

        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug mb-2">
          {skill.title}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
          {skill.description}
        </p>

        {skill.skills && skill.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {skill.skills.map((s, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                #{s}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={skill.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={skill.userName}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {skill.userName}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{skill.neighborhood}</span>
              </div>
            </div>
          </div>

          <TrustScoreBadge score={skill.userTrustScore || 98} size="sm" showLabel={false} />
        </div>

        <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate"><strong className="font-semibold text-slate-700 dark:text-slate-300">Availability:</strong> {skill.availability}</span>
          </div>

          {skill.serviceRadius && (
            <div className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate"><strong className="font-semibold text-slate-700 dark:text-slate-300">Radius:</strong> {skill.serviceRadius}</span>
            </div>
          )}
        </div>

        {(onContact || onEdit || onDelete) && (
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50 dark:border-slate-800/60">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(skill)}>
                <Edit3 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                Edit
              </Button>
            )}

            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(skill)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            )}

            {onContact && (
              <Button variant="outline" size="sm" onClick={() => onContact(skill)}>
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                Request Help
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
