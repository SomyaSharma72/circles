import React from 'react';
import { motion } from 'framer-motion';
import { ChatMessage } from '../types';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface ChatBubbleProps {
  message: ChatMessage;
  isOutgoing: boolean;
  showAvatar?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isOutgoing,
  showAvatar = true,
}) => {
  if (message.isSystemNotice) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-3"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium max-w-md text-center shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>{message.text}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2.5 my-2.5 ${
        isOutgoing ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isOutgoing && showAvatar && (
        <img
          src={
            message.senderAvatar ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
          }
          alt={message.senderName}
          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700 mb-1"
        />
      )}

      <div
        className={`max-w-[80%] sm:max-w-[70%] space-y-1 ${
          isOutgoing ? 'items-end text-right' : 'items-start text-left'
        }`}
      >
        {!isOutgoing && message.senderName && (
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1">
            {message.senderName}
          </p>
        )}

        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs break-words ${
            isOutgoing
              ? 'bg-emerald-600 text-white rounded-br-xs'
              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs'
          }`}
        >
          {message.text}
        </div>

        <p
          className={`text-[10px] font-medium text-slate-400 dark:text-slate-500 px-1 ${
            isOutgoing ? 'text-right' : 'text-left'
          }`}
        >
          {message.timestamp}
        </p>
      </div>
    </motion.div>
  );
};
