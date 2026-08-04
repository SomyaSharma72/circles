import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { HelpRequest, User, ChatMessage } from '../types';
import { ChatBubble } from '../components/ChatBubble';
import { TrustScoreBadge } from '../components/TrustScoreBadge';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Search,
  MoreVertical,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Briefcase,
  Phone,
  HeartHandshake,
  X,
  ExternalLink,
  FileText,
  AlertCircle,
} from 'lucide-react';

// Map of user professions / titles for realistic display
const USER_PROFESSIONS: Record<string, string> = {
  u1: 'High School Math Teacher',
  u2: 'Software Engineer & Woodworker',
  u3: 'Retired Nurse & Plant Specialist',
  u4: 'Handyman & DIY Enthusiast',
};

export const ChatPage: React.FC = () => {
  const { requestId } = useParams<{ requestId?: string }>();
  const navigate = useNavigate();

  const {
    currentUser,
    allUsers,
    requests,
    sendMessage,
    getChatMessages,
  } = useApp();

  // State
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(requestId || null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>(requestId ? 'chat' : 'list');

  // Modal States
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [requestDetailModal, setRequestDetailModal] = useState<HelpRequest | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync route param with state
  useEffect(() => {
    if (requestId) {
      setSelectedRequestId(requestId);
      setMobileView('chat');
    }
  }, [requestId]);

  // Construct conversation list from requests
  const conversations = useMemo(() => {
    if (!currentUser) return [];

    // Requests where current user is requester or helper, or accepted/completed requests
    const relevantRequests = requests.filter((r) => {
      const isParticipant =
        r.requesterId === currentUser.id || r.helperId === currentUser.id;
      const isAcceptedOrCompleted = r.status === 'accepted' || r.status === 'completed';
      return isParticipant || isAcceptedOrCompleted;
    });

    // Fallback: if no active requests, show all accepted requests as demo
    const displayRequests =
      relevantRequests.length > 0
        ? relevantRequests
        : requests.filter((r) => r.status === 'accepted' || r.status === 'completed');

    return displayRequests.map((req) => {
      const isHelper = req.helperId === currentUser.id;
      const partnerId = isHelper ? req.requesterId : req.helperId || 'u2';
      const partnerUser = allUsers.find((u) => u.id === partnerId) || {
        id: partnerId,
        name: isHelper ? req.requesterName : req.helperName || 'Marcus Chen',
        avatar:
          (isHelper ? req.requesterAvatar : req.helperAvatar) ||
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        trustScore: isHelper ? req.requesterTrustScore : 96,
        neighborhood: req.neighborhood,
      };

      const msgs = getChatMessages(req.id);
      const lastMsgObj = msgs.length > 0 ? msgs[msgs.length - 1] : null;

      return {
        requestId: req.id,
        requestTitle: req.title,
        category: req.category,
        status: req.status,
        partner: partnerUser,
        profession: USER_PROFESSIONS[partnerUser.id] || 'Neighbor Volunteer',
        lastMessage: lastMsgObj
          ? lastMsgObj.text
          : 'Conversation started. Say hello!',
        time: lastMsgObj ? lastMsgObj.timestamp : req.createdAt,
        unread: req.id === 'req-102' ? 1 : 0,
        isOnline: true,
        requestData: req,
      };
    });
  }, [requests, allUsers, currentUser, getChatMessages]);

  // Auto-select first conversation if on desktop and none selected
  useEffect(() => {
    if (!selectedRequestId && conversations.length > 0 && window.innerWidth >= 768) {
      setSelectedRequestId(conversations[0].requestId);
    }
  }, [conversations, selectedRequestId]);

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.partner.name.toLowerCase().includes(q) ||
        c.requestTitle.toLowerCase().includes(q) ||
        c.profession.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  // Selected conversation data
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.requestId === selectedRequestId) || null;
  }, [conversations, selectedRequestId]);

  // Messages for selected conversation
  const currentMessages = useMemo(() => {
    if (!selectedRequestId) return [];
    const msgs = getChatMessages(selectedRequestId);

    // If no custom messages exist yet for req-102, return mock messages
    if (msgs.length === 0 && selectedRequestId === 'req-102') {
      return [
        {
          id: 'msg-1',
          requestId: 'req-102',
          senderId: 'u2',
          senderName: 'Marcus Chen',
          senderAvatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          text: 'Hi Elena! Thanks so much for accepting to water my plants. The front door keypad code is 4829.',
          timestamp: 'Yesterday 4:15 PM',
        },
        {
          id: 'msg-2',
          requestId: 'req-102',
          senderId: 'u3',
          senderName: 'Elena Rostova',
          senderAvatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          text: 'Got it, Marcus! I will swing by Saturday around 10 AM. Have a safe trip!',
          timestamp: 'Yesterday 4:20 PM',
        },
      ];
    }

    return msgs;
  }, [selectedRequestId, getChatMessages]);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, selectedRequestId]);

  // Handle Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedRequestId) return;

    sendMessage(selectedRequestId, inputText);
    setInputText('');
  };

  const handleSelectChat = (reqId: string) => {
    setSelectedRequestId(reqId);
    setMobileView('chat');
    navigate(`/chat/${reqId}`, { replace: true });
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 h-[calc(100vh-5rem)] flex flex-col">
      {/* Container Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex-1 flex overflow-hidden">
        {/* ==================== LEFT SIDEBAR: CHAT LIST ==================== */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200/80 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Active Favor</span>
              </h2>
              <Badge variant="indigo" className="font-bold">
                {conversations.length} Active
              </Badge>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search neighbor or favor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 dark:text-slate-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-1">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const isSelected = conv.requestId === selectedRequestId;
                return (
                  <button
                    key={conv.requestId}
                    onClick={() => handleSelectChat(conv.requestId)}
                    className={`w-full p-3 rounded-2xl text-left transition-all duration-200 flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs'
                        : 'hover:bg-white dark:hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    {/* Partner Avatar with Online Indicator */}
                    <div className="relative shrink-0">
                      <img
                        src={
                          conv.partner.avatar ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={conv.partner.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                      />
                      {conv.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {conv.partner.name}
                        </h3>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {conv.time}
                        </span>
                      </div>

                      <p className="text-[11px] font-medium text-indigo-700 dark:text-indigo-400 truncate">
                        {conv.profession}
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate line-clamp-1 pt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>

                    {/* Unread Badge if present */}
                    {conv.unread > 0 && !isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs text-slate-400 font-medium">
                  No conversations found.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ==================== RIGHT MAIN: CONVERSATION WINDOW ==================== */}
        <div
          className={`flex-1 flex flex-col bg-white dark:bg-slate-900 ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* 1. Header */}
              <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Partner Avatar */}
                  <div
                    onClick={() => setProfileUser(activeConversation.partner as User)}
                    className="relative cursor-pointer group shrink-0"
                  >
                    <img
                      src={
                        activeConversation.partner.avatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={activeConversation.partner.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 group-hover:ring-indigo-500 transition-all"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </div>

                  {/* Partner Meta */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        onClick={() => setProfileUser(activeConversation.partner as User)}
                        className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                      >
                        {activeConversation.partner.name}
                      </h3>
                      <TrustScoreBadge
                        score={activeConversation.partner.trustScore || 98}
                        size="sm"
                      />
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                      {activeConversation.profession} •{' '}
                      <span className="text-emerald-600 dark:text-emerald-400">Online</span>
                    </p>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2 relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProfileUser(activeConversation.partner as User)}
                    className="hidden sm:inline-flex"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </Button>

                  <div className="relative">
                    <button
                      onClick={() => setShowOptionsMenu((prev) => !prev)}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showOptionsMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 5 }}
                          className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs font-semibold"
                        >
                          <button
                            onClick={() => {
                              setShowOptionsMenu(false);
                              if (activeConversation.requestData) {
                                setRequestDetailModal(activeConversation.requestData);
                              }
                            }}
                            className="w-full text-left px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 flex items-center gap-2"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            <span>View Favor Details</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowOptionsMenu(false);
                              setProfileUser(activeConversation.partner as User);
                            }}
                            className="w-full text-left px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 flex items-center gap-2 sm:hidden"
                          >
                            <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                            <span>View Profile</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Favor Context Ribbon Banner */}
              <div className="px-4 py-2 bg-indigo-50/70 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
                <div className="flex items-center gap-2 truncate">
                  <HeartHandshake className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="font-semibold truncate">
                    Favor: {activeConversation.requestTitle}
                  </span>
                </div>
                <button
                  onClick={() => setRequestDetailModal(activeConversation.requestData)}
                  className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:underline shrink-0 ml-2"
                >
                  Details
                </button>
              </div>

              {/* 2. Messages List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1">
                {/* System Intro Banner */}
                <div className="text-center py-3 mb-2 space-y-1">
                  <p className="text-xs text-slate-400">
                    This is a secure, private chat between neighbors in{' '}
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {activeConversation.partner.neighborhood || 'Maplewood Terrace'}
                    </span>
                  </p>
                </div>

                {/* Render Messages */}
                {currentMessages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg}
                    isOutgoing={msg.senderId === currentUser?.id}
                  />
                ))}

                <div ref={messagesEndRef} />
              </div>

              {/* 3. Bottom Input */}
              <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all"
                >
                  <input
                    type="text"
                    placeholder={`Message ${activeConversation.partner.name}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!inputText.trim()}
                    className="rounded-xl px-4 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </form>
              </div>
            </>
          ) : (
            /* EMPTY STATE: NO CHAT SELECTED */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-sm">
                💬
              </div>

              <div className="space-y-1 max-w-sm">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Select a conversation to start chatting.
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Connect with neighbors who have accepted or requested community favors.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIEW PROFILE MODAL */}
      <Modal
        isOpen={!!profileUser}
        onClose={() => setProfileUser(null)}
        title="Neighbor Profile"
        maxWidth="md"
      >
        {profileUser && (
          <div className="space-y-5">
            {/* User Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <img
                src={
                  profileUser.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                }
                alt={profileUser.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {profileUser.name}
                  </h3>
                  {profileUser.verifiedNeighbor && (
                    <Badge variant="emerald" className="text-[10px]">
                      Verified Neighbor
                    </Badge>
                  )}
                </div>

                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {USER_PROFESSIONS[profileUser.id] || 'Community Volunteer'}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {profileUser.neighborhood || 'Maplewood Terrace'}
                  </span>
                  <TrustScoreBadge score={profileUser.trustScore || 98} size="sm" />
                </div>
              </div>
            </div>

            {/* Bio */}
            {profileUser.bio && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  About
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  "{profileUser.bio}"
                </p>
              </div>
            )}

            {/* Skills */}
            {profileUser.skills && profileUser.skills.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Skills Offered
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {profileUser.skills.map((s) => (
                    <Badge key={s} variant="indigo">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setProfileUser(null)}>
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* FAVOR DETAILS MODAL */}
      <Modal
        isOpen={!!requestDetailModal}
        onClose={() => setRequestDetailModal(null)}
        title="Favor Request Details"
        maxWidth="md"
      >
        {requestDetailModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="indigo">{requestDetailModal.category}</Badge>
              <Badge
                variant={
                  requestDetailModal.status === 'accepted'
                    ? 'indigo'
                    : requestDetailModal.status === 'completed'
                    ? 'emerald'
                    : 'amber'
                }
              >
                {requestDetailModal.status}
              </Badge>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {requestDetailModal.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              {requestDetailModal.description}
            </p>

            {requestDetailModal.pointsOrOffer && (
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Gratitude Offer: {requestDetailModal.pointsOrOffer}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRequestDetailModal(null)}
              >
                Close Details
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
