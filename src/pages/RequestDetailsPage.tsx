import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getFavorRequestById,
  respondToFavorRequest,
  completeFavorRequest,
  sendMessage,
  getReviewsByRequest,
  blockUser,
  unblockUser,
} from '../services/api';
import { FavorRequest, Message, Review } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { RatingModal } from '../components/reviews/RatingModal';
import { UserAvatar } from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { useLocationContext } from '../context/LocationContext';
import {
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  User,
  Heart,
  MessageSquare,
  Star,
  Ban,
  Unlock,
  Check,
} from 'lucide-react';

export const RequestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, login } = useAuth();
  const { socket } = useSocketContext();
  const { location } = useLocationContext();

  const [request, setRequest] = useState<FavorRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  // Rating Modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [confirmBlockOpen, setConfirmBlockOpen] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const getEntityId = (entity: any): string => {
    if (!entity) return '';
    if (typeof entity === 'string') return entity;
    return String(entity._id || entity.id || '');
  };

  const isOutgoingMessage = (
    msg: Message,
    currentUser: any,
    otherUser?: any
  ): boolean => {
    if (!msg) return false;

    const currentId = currentUser ? String(currentUser._id || currentUser.id || '').trim() : '';
    const currentEmail = currentUser?.email ? currentUser.email.toLowerCase().trim() : '';
    const currentName = currentUser?.name ? currentUser.name.toLowerCase().trim() : '';

    const otherId = otherUser ? String(otherUser._id || otherUser.id || '').trim() : '';
    const otherEmail = otherUser?.email ? otherUser.email.toLowerCase().trim() : '';
    const otherName = otherUser?.name ? otherUser.name.toLowerCase().trim() : '';

    let senderId = '';
    let senderEmail = '';
    let senderName = '';

    if (typeof msg.sender === 'string') {
      senderId = msg.sender.trim();
    } else if (msg.sender && typeof msg.sender === 'object') {
      senderId = String(msg.sender._id || msg.sender.id || (msg.sender as any).userId || '').trim();
      senderEmail = msg.sender.email ? msg.sender.email.toLowerCase().trim() : '';
      senderName = msg.sender.name ? msg.sender.name.toLowerCase().trim() : '';
    }

    if (otherId && senderId && otherId === senderId) return false;
    if (otherEmail && senderEmail && otherEmail === senderEmail) return false;
    if (otherName && senderName && otherName === senderName && otherName !== currentName) return false;

    if (currentId && senderId && currentId === senderId) return true;
    if (currentEmail && senderEmail && currentEmail === senderEmail) return true;
    if (currentName && senderName && currentName === senderName && senderName !== otherName) return true;

    let receiverId = '';
    let receiverEmail = '';
    if (typeof msg.receiver === 'string') {
      receiverId = msg.receiver.trim();
    } else if (msg.receiver && typeof msg.receiver === 'object') {
      receiverId = String(msg.receiver._id || msg.receiver.id || (msg.receiver as any).userId || '').trim();
      receiverEmail = msg.receiver.email ? msg.receiver.email.toLowerCase().trim() : '';
    }

    if (otherId && receiverId && otherId === receiverId) return true;
    if (otherEmail && receiverEmail && otherEmail === receiverEmail) return true;
    if (currentId && receiverId && currentId === receiverId) return false;
    if (currentEmail && receiverEmail && currentEmail === receiverEmail) return false;

    return false;
  };

  const scrollChatToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      if (smooth) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      } else {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }
  };

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getFavorRequestById(id);
      setRequest(data);
      setMessages(data.messages || []);

      // Fetch reviews
      try {
        const revData = await getReviewsByRequest(id);
        setReviews(revData || []);
      } catch (revErr) {
        console.warn('Reviews fetch notice:', revErr);
      }

      setTimeout(() => scrollChatToBottom(false), 50);
    } catch (err: any) {
      setError(err.message || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollChatToBottom(true);
    }
  }, [messages.length]);

  // Real-time socket events
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('joinRoom', { requestId: id });
    socket.emit('request:join', { requestId: id });

    const handleNewMessage = (newMsg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
    };

    const handleStatusUpdate = (updatedReq: FavorRequest) => {
      setRequest(updatedReq);
    };

    const handleReviewCreated = (newReview: Review) => {
      setReviews((prev) => {
        if (prev.some((r) => r._id === newReview._id)) return prev;
        return [newReview, ...prev];
      });
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('chat:message', handleNewMessage);
    socket.on('request:completed', handleStatusUpdate);
    socket.on('request:accepted', handleStatusUpdate);
    socket.on('review:created', handleReviewCreated);

    return () => {
      socket.emit('leaveRoom', { requestId: id });
      socket.emit('request:leave', { requestId: id });
      socket.off('newMessage', handleNewMessage);
      socket.off('chat:message', handleNewMessage);
      socket.off('request:completed', handleStatusUpdate);
      socket.off('request:accepted', handleStatusUpdate);
      socket.off('review:created', handleReviewCreated);
    };
  }, [socket, id]);

  const handleOfferHelp = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      const updated = await respondToFavorRequest(id);
      setRequest(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to offer help');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteFavor = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      const updated = await completeFavorRequest(id);
      setRequest(updated);
      setShowRatingModal(true);
    } catch (err: any) {
      alert(err.message || 'Failed to complete favor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    const currentUserId = getEntityId(user);
    const reqUserId = getEntityId(request?.requester);
    const helperUserId = getEntityId(request?.helper);
    const otherUserId = currentUserId === reqUserId ? helperUserId : reqUserId;

    if (!otherUserId) return;

    const isCurrentlyBlocked = user?.blockedUsers?.includes(otherUserId);

    try {
      setBlockLoading(true);
      if (isCurrentlyBlocked) {
        await unblockUser(otherUserId);
        const updatedBlocked = (user?.blockedUsers || []).filter((b) => b !== otherUserId);
        if (user) {
          login(localStorage.getItem('neighborly_token') || '', {
            ...user,
            blockedUsers: updatedBlocked,
          });
        }
      } else {
        await blockUser(otherUserId);
        const updatedBlocked = [...(user?.blockedUsers || []), otherUserId];
        if (user) {
          login(localStorage.getItem('neighborly_token') || '', {
            ...user,
            blockedUsers: updatedBlocked,
          });
        }
      }
      setConfirmBlockOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update user block status');
    } finally {
      setBlockLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !messageText.trim()) return;

    const text = messageText.trim();
    setMessageText('');

    const currentUserId = getEntityId(user);
    const reqUserId = getEntityId(request?.requester);
    const helperId = getEntityId(request?.helper);

    const isRequesterUser = Boolean(currentUserId && reqUserId && currentUserId === reqUserId);
    const receiverId = isRequesterUser
      ? (helperId || 'user_aarav_2')
      : (reqUserId || 'user_priya_1');

    const tempId = 'temp_' + Date.now();
    const optimisticMsg: Message = {
      _id: tempId,
      request: id,
      sender: user ? { ...user, _id: currentUserId, id: currentUserId } : { _id: currentUserId, id: currentUserId, name: 'You' },
      receiver: receiverId,
      text,
      createdAt: new Date().toISOString(),
      read: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      setSendingMsg(true);
      const sent = await sendMessage(id, text, receiverId);
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? sent : m))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading favor details & chat..." />;
  if (error || !request) return <ErrorMessage message={error || 'Request not found'} onRetry={fetchDetails} />;

  const currentUserId = getEntityId(user);
  const reqUserId = getEntityId(request.requester);
  const helperUserId = getEntityId(request.helper);

  const isRequester = Boolean(currentUserId && reqUserId && currentUserId === reqUserId);
  const isHelper = Boolean(currentUserId && helperUserId && currentUserId === helperUserId);
  const isParticipant = isRequester || isHelper;

  const otherUser = isRequester ? request.helper : request.requester;
  const otherUserId = getEntityId(otherUser);
  const isUserBlocked = Boolean(otherUserId && user?.blockedUsers?.includes(otherUserId));

  const hasUserReviewed = reviews.some(
    (r) => getEntityId(r.reviewer) === currentUserId
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Neighborhood Feed</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Request Details & Participant Info */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-3xl border border-orange-200/80 p-6 shadow-xs space-y-5">
            {/* Category & Status Badges */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 font-bold">
                {request.category}
              </span>
              <span
                className={`px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1 ${
                  request.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : request.status === 'In Progress'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {request.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{request.status}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl font-extrabold text-slate-900 leading-snug">
              {request.title}
            </h1>

            {/* Description */}
            <p className="text-slate-600 text-xs font-medium leading-relaxed">
              {request.description}
            </p>

            {/* Requester Info */}
            <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-200/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    userId={request.requester?._id || request.requester?.id}
                    name={request.requester?.name || 'Neighbor'}
                    size="md"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{request.requester?.name || 'Neighbor'}</h4>
                    <p className="text-[11px] text-orange-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Trust Score: {request.requester?.trustScore ?? 100}
                    </p>
                  </div>
                </div>

                {!isRequester && otherUserId && (
                  <button
                    onClick={() => setConfirmBlockOpen(true)}
                    className="text-[11px] text-slate-400 hover:text-red-600 font-semibold p-1.5 rounded-lg hover:bg-red-50 transition"
                    title={isUserBlocked ? 'Unblock User' : 'Block User'}
                  >
                    {isUserBlocked ? <Unlock className="w-4 h-4 text-red-500" /> : <Ban className="w-4 h-4" />}
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-500 font-medium space-y-1 pt-2 border-t border-orange-200/40">
                <p className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" /> Location: {request.locationName || location.fullAddress || location.neighborhood || 'Local Circle'}
                </p>
                <p className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Posted {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Helper Info (if assigned) */}
            {request.helper && (
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/60 space-y-2">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                  Assigned Neighbor Helper
                </span>
                <div className="flex items-center gap-3">
                  <UserAvatar
                    userId={request.helper._id || request.helper.id}
                    name={request.helper.name || 'Helper'}
                    size="sm"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{request.helper.name}</h5>
                    <p className="text-[10px] text-emerald-700 font-semibold">Trust Score: {request.helper.trustScore ?? 100}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!isRequester && request.status === 'Open' && (
              <button
                onClick={handleOfferHelp}
                disabled={actionLoading}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>{actionLoading ? 'Connecting...' : 'Offer Help Now'}</span>
              </button>
            )}

            {isParticipant && request.status === 'In Progress' && (
              <button
                onClick={handleCompleteFavor}
                disabled={actionLoading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{actionLoading ? 'Updating...' : 'Mark Request Complete'}</span>
              </button>
            )}

            {request.status === 'Completed' && otherUser && !hasUserReviewed && (
              <button
                onClick={() => setShowRatingModal(true)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <Star className="w-4 h-4 fill-white" />
                <span>Rate & Review Neighbor</span>
              </button>
            )}

            {request.status === 'Completed' && hasUserReviewed && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl text-center font-bold flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>You submitted a review for this favor!</span>
              </div>
            )}
          </div>

          {/* Reviews List */}
          {reviews.length > 0 && (
            <div className="bg-white rounded-3xl border border-orange-200/80 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Favor Ratings & Reviews ({reviews.length})</span>
              </h3>
              <div className="space-y-2.5">
                {reviews.map((rev) => (
                  <div key={rev._id} className="p-3 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{rev.reviewer?.name || 'Neighbor'}</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">"{rev.comment}"</p>
                    <span className="text-[10px] text-slate-400 block">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Direct Chat */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-orange-200/80 shadow-xs flex flex-col h-[560px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 bg-orange-50/80 border-b border-orange-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-orange-500 text-white font-bold flex items-center justify-center text-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-none">
                    {otherUser?.name ? `Chat with ${otherUser.name}` : 'Neighbor Request Chat'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    {isUserBlocked ? '⚠️ You have blocked this user' : 'Direct channel for coordinating favor details'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isParticipant && request.status === 'In Progress' && (
                  <button
                    onClick={handleCompleteFavor}
                    disabled={actionLoading}
                    className="text-[11px] font-bold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-2xs flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Complete</span>
                  </button>
                )}
                <Link
                  to={`/chats?request=${id}&user=${otherUserId}`}
                  className="text-[10px] font-extrabold px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition shadow-2xs"
                >
                  Full View
                </Link>
              </div>
            </div>

            {/* Messages Feed */}
            <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FFF7ED]/50">
              {messages.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs font-medium space-y-1">
                  <p className="font-bold">No messages yet.</p>
                  <p>Send a message to coordinate timing, location, and tools!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = isOutgoingMessage(msg, user, otherUser);
                  const senderName = isMe
                    ? (user?.name || 'You')
                    : (typeof msg.sender === 'object' && msg.sender?.name ? msg.sender.name : 'Neighbor');

                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-slate-400 font-bold mb-1 px-1">
                        {senderName}
                      </span>
                      <div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs font-medium shadow-2xs leading-relaxed ${
                          isMe
                            ? 'bg-orange-500 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <span
                          className={`text-[9px] block text-right mt-1 ${
                            isMe ? 'text-orange-100' : 'text-slate-400'
                          }`}
                        >
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input or Block Notice */}
            {isUserBlocked ? (
              <div className="p-3 bg-red-50 border-t border-red-200 text-center text-xs text-red-700 font-semibold flex items-center justify-center gap-2">
                <Ban className="w-4 h-4" />
                <span>You have blocked this neighbor. Unblock them to send and receive messages.</span>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-orange-200/60 flex items-center gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message to your neighbor..."
                  className="flex-1 px-4 py-2.5 bg-orange-50/50 border border-orange-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500 focus:bg-white font-medium"
                />
                <button
                  type="submit"
                  disabled={sendingMsg || !messageText.trim()}
                  className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-xs transition flex items-center gap-1 shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Rating & Review Modal */}
      {otherUser && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          requestId={id || ''}
          requestTitle={request.title}
          reviewee={otherUser}
          onSuccess={() => {
            fetchDetails();
          }}
        />
      )}

      {/* Block/Unblock Confirmation Dialog */}
      {confirmBlockOpen && otherUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-orange-100 space-y-4 text-center">
            <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${isUserBlocked ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {isUserBlocked ? <Unlock className="w-6 h-6" /> : <Ban className="w-6 h-6" />}
            </div>
            <h3 className="text-base font-black text-slate-900">
              {isUserBlocked ? `Unblock ${otherUser.name}?` : `Block ${otherUser.name}?`}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {isUserBlocked
                ? 'Unblocking will allow this neighbor to message you and coordinate on requests.'
                : 'Blocked users cannot send you direct messages or interact in your circles.'}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmBlockOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleBlock}
                disabled={blockLoading}
                className={`flex-1 py-2.5 text-white font-extrabold text-xs rounded-2xl shadow-xs transition ${
                  isUserBlocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {blockLoading ? 'Updating...' : isUserBlocked ? 'Unblock' : 'Block User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
