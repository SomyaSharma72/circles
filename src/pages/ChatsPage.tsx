import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import {
  getUserConversations,
  getRequestMessages,
  sendMessage,
  getFavorRequestById,
  getUserById,
} from '../services/api';
import { Conversation, Message } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import {
  MessageSquare,
  Send,
  Search,
  ShieldCheck,
  MapPin,
  ExternalLink,
  User,
  Clock,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Heart,
  PlusCircle,
  Circle,
} from 'lucide-react';

export const ChatsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { socket } = useSocketContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedReqId, setSelectedReqId] = useState<string | null>(
    searchParams.get('request') || null
  );
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Fetch Conversations List & Handle Query Params (request / user)
  const fetchConversations = async () => {
    if (!user) return;
    try {
      setLoadingConvos(true);
      setError(null);
      const data = await getUserConversations();
      let convosList: Conversation[] = data || [];

      const initialReqId = searchParams.get('request');
      const initialUserId = searchParams.get('user');

      if (initialReqId) {
        let found = convosList.find((c: Conversation) => c.requestId === initialReqId);
        if (found) {
          setSelectedReqId(initialReqId);
          setActiveConversation(found);
        } else {
          try {
            const reqData = await getFavorRequestById(initialReqId);
            if (reqData) {
              const reqUserId =
                typeof reqData.requester === 'object'
                  ? reqData.requester?._id || reqData.requester?.id
                  : reqData.requester;
              const isMe = user && (user._id === reqUserId || user.id === reqUserId);
              let otherUserObj = isMe ? reqData.helper : reqData.requester;

              if (!otherUserObj && initialUserId) {
                try {
                  const fetchedUser = await getUserById(initialUserId);
                  if (fetchedUser) otherUserObj = fetchedUser;
                } catch (e) {
                  // Fallback demo user
                }
              }

              if (!otherUserObj) {
                otherUserObj = {
                  _id: initialUserId || 'user_priya_1',
                  name: searchParams.get('name') || 'Neighbor',
                  avatarUrl:
                    searchParams.get('avatar') ||
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
                  trustScore: 98,
                  neighborhood: 'Sector 62, Noida',
                  distance: '120 m away',
                  activeStatus: 'Online now',
                };
              }

              const newConvo: Conversation = {
                requestId: reqData._id,
                requestTitle: reqData.title,
                requestCategory: reqData.category || 'General',
                requestStatus: reqData.status,
                otherUser: typeof otherUserObj === 'object' ? otherUserObj : { _id: otherUserObj, name: 'Neighbor', trustScore: 95 },
                lastMessage: {
                  _id: 'init_' + reqData._id,
                  text: 'Conversation started on request.',
                  sender: otherUserObj,
                  createdAt: new Date().toISOString(),
                  read: true,
                },
                unreadCount: 0,
              };

              convosList = [newConvo, ...convosList.filter((c) => c.requestId !== reqData._id)];
              setSelectedReqId(initialReqId);
              setActiveConversation(newConvo);
            } else if (convosList.length > 0) {
              setSelectedReqId(convosList[0].requestId);
              setActiveConversation(convosList[0]);
            }
          } catch (e) {
            if (convosList.length > 0) {
              setSelectedReqId(convosList[0].requestId);
              setActiveConversation(convosList[0]);
            }
          }
        }
      } else if (initialUserId) {
        let found = convosList.find(
          (c) =>
            (c.otherUser?._id === initialUserId || c.otherUser?.id === initialUserId)
        );
        if (found) {
          setSelectedReqId(found.requestId);
          setActiveConversation(found);
        } else {
          try {
            const fetchedUser = await getUserById(initialUserId);
            const userObj = fetchedUser || {
              _id: initialUserId,
              name: searchParams.get('name') || 'Neighbor',
              avatarUrl:
                searchParams.get('avatar') ||
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
              trustScore: 98,
              neighborhood: 'Sector 62, Noida',
              distance: '120 m away',
              activeStatus: 'Online now',
            };

            const directReqId = 'req_direct_' + initialUserId;
            const newConvo: Conversation = {
              requestId: directReqId,
              requestTitle: 'Direct Neighbor Connection',
              requestCategory: 'Direct Chat',
              requestStatus: 'Open',
              otherUser: userObj,
              lastMessage: {
                _id: 'init_' + directReqId,
                text: 'Direct conversation started.',
                sender: userObj,
                createdAt: new Date().toISOString(),
                read: true,
              },
              unreadCount: 0,
            };

            convosList = [newConvo, ...convosList];
            setSelectedReqId(directReqId);
            setActiveConversation(newConvo);
          } catch (e) {
            if (convosList.length > 0) {
              setSelectedReqId(convosList[0].requestId);
              setActiveConversation(convosList[0]);
            }
          }
        }
      } else if (convosList.length > 0 && !selectedReqId) {
        setSelectedReqId(convosList[0].requestId);
        setActiveConversation(convosList[0]);
      }

      setConversations(convosList);
    } catch (err: any) {
      console.error('Fetch conversations error:', err);
      setError(err.message || 'Failed to load neighborhood chats');
    } finally {
      setLoadingConvos(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, searchParams.get('request'), searchParams.get('user')]);

  // Fetch Messages for Selected Conversation
  const fetchMessages = async (reqId: string) => {
    try {
      setLoadingMsgs(true);
      const data = await getRequestMessages(reqId);
      setMessages(data || []);
    } catch (err: any) {
      console.error('Fetch messages error:', err);
    } finally {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    if (selectedReqId) {
      fetchMessages(selectedReqId);
      const found = conversations.find((c) => c.requestId === selectedReqId);
      if (found) setActiveConversation(found);
    }
  }, [selectedReqId, conversations]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket Room Join & Listener
  useEffect(() => {
    if (!socket || !selectedReqId) return;

    socket.emit('joinRoom', { requestId: selectedReqId });

    const handleNewMessage = (newMsg: Message) => {
      const msgReqId = typeof newMsg.request === 'object' ? (newMsg.request as any)?._id : newMsg.request;
      if (msgReqId === selectedReqId || newMsg.request === selectedReqId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.requestId === selectedReqId) {
            return {
              ...c,
              lastMessage: {
                _id: newMsg._id,
                text: newMsg.text,
                sender: newMsg.sender,
                createdAt: newMsg.createdAt,
              },
            };
          }
          return c;
        })
      );
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('chat:message', handleNewMessage);

    return () => {
      socket.emit('leaveRoom', { requestId: selectedReqId });
      socket.off('newMessage', handleNewMessage);
      socket.off('chat:message', handleNewMessage);
    };
  }, [socket, selectedReqId]);

  const handleSelectConversation = (convo: Conversation) => {
    setSelectedReqId(convo.requestId);
    setActiveConversation(convo);
    setSearchParams({ request: convo.requestId });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqId || !messageText.trim()) return;

    const text = messageText.trim();
    setMessageText('');

    const receiverId = activeConversation?.otherUser?._id || activeConversation?.otherUser?.id;
    const tempId = 'temp_' + Date.now();

    const optimisticMsg: Message = {
      _id: tempId,
      request: selectedReqId,
      sender: user || { _id: 'user_priya_1', name: 'You' },
      receiver: activeConversation?.otherUser,
      text,
      createdAt: new Date().toISOString(),
      read: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    setConversations((prev) =>
      prev.map((c) =>
        c.requestId === selectedReqId
          ? {
              ...c,
              lastMessage: {
                _id: tempId,
                text,
                sender: user,
                createdAt: new Date().toISOString(),
              },
            }
          : c
      )
    );

    try {
      setSendingMsg(true);
      const sentMsg = await sendMessage(selectedReqId, text, receiverId);

      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? sentMsg : m))
      );

      setConversations((prev) =>
        prev.map((c) =>
          c.requestId === selectedReqId
            ? {
                ...c,
                lastMessage: {
                  _id: sentMsg._id,
                  text: sentMsg.text,
                  sender: sentMsg.sender,
                  createdAt: sentMsg.createdAt,
                },
              }
            : c
        )
      );
    } catch (err: any) {
      console.error('Send message error:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const q = searchTerm.toLowerCase();
    const otherName = c.otherUser?.name?.toLowerCase() || '';
    const reqTitle = c.requestTitle?.toLowerCase() || '';
    const msgText = c.lastMessage?.text?.toLowerCase() || '';
    return otherName.includes(q) || reqTitle.includes(q) || msgText.includes(q);
  });

  if (authLoading || (loadingConvos && conversations.length === 0)) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-orange-200/80 shadow-xs animate-pulse flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-orange-100 rounded-full"></div>
            <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
        <div className="bg-white border border-orange-200/80 rounded-3xl p-8 min-h-[400px] flex items-center justify-center">
          <LoadingSpinner label="Loading neighborhood chat profiles & history..." />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchConversations} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-orange-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-800 border border-orange-200 rounded-full text-xs font-bold">
            <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
            <span>Direct Neighbor Messages</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Neighborhood Chats</h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Coordinate tool loans, pickup times, and favor details directly with verified local neighbors.
          </p>
        </div>

        <Link
          to="/create-request"
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ask for Help</span>
        </Link>
      </div>

      {/* Main Chat Layout: Split view */}
      {conversations.length === 0 ? (
        <div className="bg-white border border-orange-200/80 rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto border border-orange-200">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">No Chat Conversations Yet</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              When you offer help or create a favor request, your direct chat with neighbors will appear right here!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
            >
              Browse Nearby Favors
            </Link>
            <Link
              to="/create-request"
              className="w-full sm:w-auto px-5 py-2.5 bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200 text-xs font-extrabold rounded-xl transition"
            >
              Ask for Help
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-orange-200/80 rounded-3xl shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          {/* Left Column: Conversations List (Cols 5) */}
          <div
            className={`lg:col-span-5 border-r border-orange-100 flex flex-col bg-orange-50/30 ${
              selectedReqId && 'hidden lg:flex'
            }`}
          >
            {/* Search Input */}
            <div className="p-3.5 border-b border-orange-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search chats by neighbor or favor..."
                  className="w-full pl-9 pr-4 py-2 bg-orange-50/50 border border-orange-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-orange-100/60">
              {filteredConversations.map((convo) => {
                const isSelected = convo.requestId === selectedReqId;
                const otherName = convo.otherUser?.name || 'Neighbor';
                const avatar =
                  convo.otherUser?.avatarUrl ||
                  convo.otherUser?.avatar ||
                  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200';

                return (
                  <button
                    key={convo.requestId}
                    type="button"
                    onClick={() => handleSelectConversation(convo)}
                    className={`w-full p-4 text-left transition flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-orange-100/80 font-semibold border-l-4 border-orange-500'
                        : 'hover:bg-orange-50/80'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={avatar}
                        alt={otherName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200';
                        }}
                        className="w-11 h-11 rounded-2xl object-cover border border-orange-300 shadow-2xs"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-extrabold text-slate-900 text-xs truncate">
                          {otherName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                          {convo.lastMessage?.createdAt
                            ? new Date(convo.lastMessage.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>

                      <p className="text-[11px] font-bold text-orange-700 truncate mb-1">
                        {convo.requestTitle}
                      </p>

                      <p className="text-xs text-slate-500 truncate font-medium">
                        {convo.lastMessage?.text || 'No messages yet'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Chat Panel (Cols 7) */}
          <div
            className={`lg:col-span-7 flex flex-col h-[600px] bg-white ${
              !selectedReqId && 'hidden lg:flex'
            }`}
          >
            {activeConversation ? (
              <>
                {/* Chat Header with Complete Requester & Request Info */}
                <div className="p-4 bg-[#FAF3E9] border-b border-[#EADBC8] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => setSelectedReqId(null)}
                      className="lg:hidden p-1 text-slate-500 hover:text-[#2B2B2B]"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="relative shrink-0">
                      <img
                        src={
                          activeConversation.otherUser?.avatarUrl ||
                          activeConversation.otherUser?.avatar ||
                          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
                        }
                        alt={activeConversation.otherUser?.name || 'Neighbor'}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200';
                        }}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-[#2F5233] shadow-xs"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-[#2B2B2B] text-sm truncate">
                          {activeConversation.otherUser?.name || 'Neighbor'}
                        </h3>
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-[#2F5233]/10 text-[#2F5233] rounded-full text-[10px] font-extrabold shrink-0">
                          <ShieldCheck className="w-3 h-3 text-[#2F5233]" />
                          <span>★ {activeConversation.otherUser?.trustScore || 98} Trust</span>
                        </span>
                      </div>

                      {/* Request Title & Category Link */}
                      <div className="flex items-center gap-2 text-xs truncate">
                        <Link
                          to={`/request/${activeConversation.requestId}`}
                          className="font-bold text-[#D97B4F] hover:underline truncate flex items-center gap-1"
                        >
                          <span>{activeConversation.requestTitle}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </Link>
                        <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-800 rounded-md font-bold shrink-0">
                          {activeConversation.requestCategory || 'General'}
                        </span>
                      </div>

                      {/* Distance & Last Active Status */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1 text-[#2F5233] font-bold">
                          <MapPin className="w-3 h-3 text-[#2F5233]" />
                          {activeConversation.otherUser?.distance ||
                            activeConversation.otherUser?.neighborhood ||
                            '120 m away'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {activeConversation.otherUser?.activeStatus || 'Active now'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold shrink-0 ${
                      activeConversation.requestStatus === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : activeConversation.requestStatus === 'In Progress'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-[#D97B4F]/10 text-[#D97B4F] border border-[#D97B4F]/20'
                    }`}
                  >
                    {activeConversation.requestStatus || 'Open'}
                  </span>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF3E9]/60">
                  {loadingMsgs ? (
                    <div className="py-12 flex justify-center">
                      <LoadingSpinner label="Loading chat history..." />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-medium space-y-2">
                      <MessageSquare className="w-8 h-8 text-orange-300 mx-auto" />
                      <p>No messages in this chat yet. Send a greeting to coordinate!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const senderId =
                        typeof msg.sender === 'object' ? msg.sender?._id || msg.sender?.id : msg.sender;
                      const isMe = user && Boolean(senderId && (senderId === user._id || senderId === user.id));

                      const senderName = isMe
                        ? user?.name || 'You'
                        : typeof msg.sender === 'object' && msg.sender?.name
                        ? msg.sender.name
                        : activeConversation.otherUser?.name || 'Neighbor';

                      return (
                        <div
                          key={msg._id || idx}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[10px] text-slate-400 font-bold mb-1 px-1">
                            {senderName}
                          </span>

                          <div
                            className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs font-medium shadow-2xs leading-relaxed ${
                              isMe
                                ? 'bg-[#D97B4F] text-white rounded-tr-none'
                                : 'bg-white text-[#2B2B2B] border border-[#EADBC8] rounded-tl-none'
                            }`}
                          >
                            <p>{msg.text}</p>
                            <span
                              className={`text-[9px] block text-right mt-1 ${
                                isMe ? 'text-[#FAF3E9]/80' : 'text-slate-400'
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
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-white border-t border-[#EADBC8] flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Message ${activeConversation.otherUser?.name || 'neighbor'}...`}
                    className="flex-1 px-4 py-2.5 bg-[#FAF3E9] border border-[#EADBC8] rounded-2xl text-xs text-[#2B2B2B] placeholder:text-slate-400 focus:outline-hidden focus:border-[#D97B4F] focus:bg-white font-medium"
                  />
                  <button
                    type="submit"
                    disabled={sendingMsg || !messageText.trim()}
                    className="px-4 py-2.5 bg-[#D97B4F] hover:bg-[#c2683d] disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-xs transition flex items-center gap-1 shrink-0"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
                <MessageSquare className="w-10 h-10 text-orange-300" />
                <p className="text-xs font-bold text-slate-600">Select a chat to start messaging</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
