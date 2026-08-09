import React from 'react';
import { HeartHandshake, LucideIcon } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = HeartHandshake,
  title,
  description,
  actionText,
  actionLink,
  onActionClick,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center shadow-sm max-w-lg mx-auto my-6">
      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">{description}</p>
      
      {actionText && actionLink && (
        <RouterLink
          to={actionLink}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 text-white font-medium text-sm rounded-xl shadow-sm hover:bg-emerald-700 transition"
        >
          {actionText}
        </RouterLink>
      )}

      {actionText && !actionLink && onActionClick && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 text-white font-medium text-sm rounded-xl shadow-sm hover:bg-emerald-700 transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
