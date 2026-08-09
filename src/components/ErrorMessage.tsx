import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Unable to Load Data',
  message,
  onRetry,
}) => {
  return (
    <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-5 my-4 shadow-sm flex items-start gap-4">
      <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-semibold text-rose-900 text-base mb-1">{title}</h4>
        <p className="text-sm text-rose-700 leading-relaxed">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        )}
      </div>
    </div>
  );
};
