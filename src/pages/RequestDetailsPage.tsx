import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getFavorRequestById,
  respondToFavorRequest,
  updateFavorStatus,
  sendMessage,
} from '../services/api';
import { FavorRequest, Message } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
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
} from 'lucide-react';

export const RequestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket } = useSocketContext();

  const [request, setRequest] = useState<FavorRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getFavorRequestById(id);
      setRequest(data);
      setMessages(data.messages || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time chat socket listener
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('joinRoom', { requestId: id });

    const handleNewMessage = (newMsg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
    };

    const handleStatusUpdate = (updatedReq: FavorRequest) => {
      setRequest(updatedReq);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('statusUpdated', handleStatusUpdate);

    return () => {
      socket.emit('leaveRoom', { requestId: id });
      socket.off('newMessage', handleNewMessage);
      socket.off('statusUpdated', handleStatusUpdate);
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
      const updated = await updateFavorStatus(id, 'Completed');
      setRequest(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to complete favor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !messageText.trim()) return;

    const text = messageText.trim();
    setMessageText('');

    const reqUserId = typeof request?.requester === 'object' ? request.requester?._id || request.requester?.id : request?.requester;
    const isMe = user && (user._id === reqUserId || user.id === reqUserId);
    const receiverId = isMe
      ? (typeof request?.helper === 'object' ? request.helper?._id : request?.helper) || 'user_aarav_2'
      : reqUserId || 'user_priya_1';

    const tempId = 'temp_' + Date.now();
    const optimisticMsg: Message = {
      _id: tempId,
      request: id,
      sender: user || { _id: 'user_priya_1', name: 'You' },
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
      console.error('Send message error:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading details & chat..." />;
  if (error || !request) return <ErrorMessage message={error || 'Request not found'} onRetry={fetchDetails} />;

  const isRequester = user && request.requester && user._id === request.requester._id;
  const isHelper = user && request.helper && user._id === request.helper._id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Neighborhood Feed</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Request Details Card */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-3xl border border-orange-200/80 p-6 shadow-xs space-y-5">
            {/* Category & Status Badges */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 font-bold">
                {request.category}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                  request.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : request.status === 'In Progress'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {request.status}
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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                  {request.requester?.name ? request.requester.name.charAt(0).toUpperCase() : 'N'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{request.requester?.name || 'Neighbor'}</h4>
                  <p className="text-[11px] text-orange-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Trust Score: {request.requester?.trustScore || '4.9'}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-medium space-y-1 pt-2 border-t border-orange-200/40">
                <p className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" /> Location: {request.locationName || 'Indiranagar'}
                </p>
                <p className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Posted 15m ago
                </p>
              </div>
            </div>

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

            {(isRequester || isHelper) && request.status === 'In Progress' && (
              <button
                onClick={handleCompleteFavor}
                disabled={actionLoading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Favor Completed</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: WhatsApp-like Neighborhood Chat */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-orange-200/80 shadow-xs flex flex-col h-[520px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 bg-orange-50/80 border-b border-orange-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-none">Neighbor Chat</h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Direct chat for coordinating favor details</p>
                </div>
              </div>
              <Link
                to={`/chats?request=${id}&user=${request.requester?._id || request.requester?.id || ''}`}
                className="text-[10px] font-extrabold px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition shadow-2xs"
              >
                Expand Chat
              </Link>
            </div>

            {/* Messages Feed — WhatsApp Bubble Style */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FFF7ED]/50">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-medium">
                  No messages yet. Send a greeting to coordinate help!
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const senderId = typeof msg.sender === 'object' ? msg.sender?._id || msg.sender?.id : msg.sender;
                  const isMe = user && Boolean(senderId && (senderId === user._id || senderId === user.id));
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
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
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
          </div>
        </div>
      </div>
    </div>
  );
};
