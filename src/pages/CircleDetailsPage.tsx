import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getCircleById,
  joinCircle,
  leaveCircle,
  deleteCircle,
  getCircleMessages,
  sendCircleMessage,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { UserAvatar } from '../components/UserAvatar';
import { CircleIconBadge, getCircleTheme } from '../components/CircleIcons';
import {
  Users,
  MapPin,
  ArrowLeft,
  Send,
  ShieldCheck,
  Star,
  CheckCircle2,
  Trash2,
  Lock,
  Globe,
  MessageSquare,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';

export const CircleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket } = useSocketContext();
  const navigate = useNavigate();

  const [circle, setCircle] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'members' | 'about'>('chat');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchCircleData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [circleData, messagesData] = await Promise.all([
        getCircleById(id),
        getCircleMessages(id).catch(() => []),
      ]);
      setCircle(circleData);
      setMessages(messagesData || []);
    } catch (err) {
      console.warn('Failed to load circle details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCircleData();
  }, [id]);

  // Socket room join and message stream
  useEffect(() => {
    if (!socket || !id) return;

    // Join room
    socket.emit('group:join_room', { groupId: id });
    socket.emit('circle:join_room', { circleId: id });

    const handleMessage = (msg: any) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };

    const handleMemberJoined = ({ circleId, user: joinedUser }: any) => {
      if (circleId === id && joinedUser) {
        setCircle((prev: any) => {
          if (!prev) return prev;
          const has = prev.members?.some((m: any) =>
            typeof m === 'object' ? m._id === joinedUser.id || m._id === joinedUser._id : m === joinedUser.id
          );
          if (!has) {
            return {
              ...prev,
              members: [...(prev.members || []), joinedUser],
            };
          }
          return prev;
        });
      }
    };

    const handleCircleDeleted = ({ circleId }: { circleId: string }) => {
      if (circleId === id) {
        alert('This circle has been deleted by its creator.');
        navigate('/circles');
      }
    };

    socket.on('group:message', handleMessage);
    socket.on('circle:message', handleMessage);
    socket.on('group:member_joined', handleMemberJoined);
    socket.on('circle:member_joined', handleMemberJoined);
    socket.on('group:deleted', handleCircleDeleted);
    socket.on('circle:deleted', handleCircleDeleted);

    return () => {
      socket.emit('group:leave_room', { groupId: id });
      socket.emit('circle:leave_room', { circleId: id });
      socket.off('group:message', handleMessage);
      socket.off('circle:message', handleMessage);
      socket.off('group:member_joined', handleMemberJoined);
      socket.off('circle:member_joined', handleMemberJoined);
      socket.off('group:deleted', handleCircleDeleted);
      socket.off('circle:deleted', handleCircleDeleted);
    };
  }, [socket, id, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id || !user) return;

    const textToSend = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      const savedMsg = await sendCircleMessage(id, textToSend);
      setMessages((prev) => {
        if (prev.some((m) => m._id === savedMsg._id)) return prev;
        return [...prev, savedMsg];
      });
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.warn('Failed to send circle message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleJoinToggle = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!id || !circle) return;

    const isMember = circle.members?.some((m: any) =>
      typeof m === 'object' ? m._id === user._id || m._id === user.id : m === user._id || m === user.id
    );

    setIsJoining(true);
    try {
      if (isMember) {
        await leaveCircle(id);
      } else {
        await joinCircle(id);
      }
      await fetchCircleData();
    } catch (err) {
      console.warn('Failed to update membership:', err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this circle? All chat history will be removed.')) {
      return;
    }

    try {
      await deleteCircle(id);
      navigate('/circles');
    } catch (err: any) {
      alert(err.message || 'Failed to delete circle');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-8 h-8 border-3 border-[#355E3B] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <div className="text-xs font-bold text-slate-500">Loading circle details...</div>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-4">
        <h2 className="text-xl font-extrabold text-[#2F2F2F]">Circle Not Found</h2>
        <p className="text-xs text-slate-500">This community group may have been removed.</p>
        <Link
          to="/circles"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#355E3B] text-white text-xs font-bold rounded-2xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Circles</span>
        </Link>
      </div>
    );
  }

  const isMember = user
    ? circle.members?.some((m: any) =>
        typeof m === 'object' ? m._id === user._id || m._id === user.id : m === user._id || m === user.id
      )
    : false;

  const creatorId = typeof circle.creator === 'object' ? circle.creator?._id : circle.creator;
  const creatorName = typeof circle.creator === 'object' ? circle.creator?.name : 'Neighbor Creator';
  const isCreator = user && (user._id === creatorId || user.id === creatorId);
  const memberList: any[] = circle.members || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/circles"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#2F2F2F] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Circles</span>
        </Link>

        {isCreator && (
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Circle</span>
          </button>
        )}
      </div>

      {/* Circle Header Hero Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E6DFD3] shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <CircleIconBadge
              iconKey={circle.icon}
              category={circle.category}
              size="lg"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200">
                  {circle.category}
                </span>
                {circle.privacy === 'Approval Required' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Approval Required
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Public Circle
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-extrabold text-[#2F2F2F] font-heading">
                {circle.name}
              </h1>
              <p className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-2 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C96C4A]" />
                  {circle.neighborhood || 'Local Circle'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-indigo-700 font-bold">
                  <Users className="w-3.5 h-3.5" />
                  {memberList.length} Active {memberList.length === 1 ? 'Neighbor' : 'Neighbors'}
                </span>
                <span>•</span>
                <span>Created by {creatorName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleJoinToggle}
              disabled={isJoining}
              className={`px-5 py-2.5 text-xs font-bold rounded-2xl transition cursor-pointer flex items-center gap-2 shadow-2xs ${
                isMember
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                  : 'bg-[#355E3B] text-white hover:bg-[#2A4B2F]'
              }`}
            >
              {isJoining ? (
                <span>Updating...</span>
              ) : isMember ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Member (Leave)</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  <span>Join Circle</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-[#E6DFD3] pt-3">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-[#2F2F2F] text-white shadow-2xs'
                : 'bg-[#F5F1E8] text-slate-700 hover:bg-[#EAE4D9]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Circle Chat & Feed ({messages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'members'
                ? 'bg-[#2F2F2F] text-white shadow-2xs'
                : 'bg-[#F5F1E8] text-slate-700 hover:bg-[#EAE4D9]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Active Members ({memberList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'about'
                ? 'bg-[#2F2F2F] text-white shadow-2xs'
                : 'bg-[#F5F1E8] text-slate-700 hover:bg-[#EAE4D9]'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>About Circle</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-[#E6DFD3] shadow-2xs overflow-hidden flex flex-col h-[560px]">
          {/* Chat Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#FDFBF7]/50 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-extrabold text-[#2F2F2F]">Welcome to {circle.name}!</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Be the first neighbor to post a greeting, coordinate tools, or plan a meetup in this circle.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                const senderName = typeof msg.sender === 'object' ? msg.sender?.name : 'Neighbor';
                const isMine = user && (user._id === senderId || user.id === senderId);

                return (
                  <div
                    key={msg._id}
                    className={`flex items-start gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <UserAvatar userId={senderId} name={senderName} size="sm" />

                    <div className={`max-w-[75%] ${isMine ? 'items-end text-right' : 'items-start text-left'}`}>
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[11px] font-bold text-slate-700">{senderName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed font-medium shadow-2xs ${
                          isMine
                            ? 'bg-[#355E3B] text-white rounded-tr-none'
                            : 'bg-white text-[#2F2F2F] border border-[#E6DFD3] rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Message Input */}
          <div className="p-4 bg-white border-t border-[#E6DFD3]">
            {!user ? (
              <div className="p-3 bg-[#F5F1E8] rounded-2xl text-center text-xs font-bold text-slate-700">
                <span>Please </span>
                <Link to="/auth" className="text-[#355E3B] underline">
                  log in
                </Link>
                <span> to chat with neighbors in this circle.</span>
              </div>
            ) : !isMember ? (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-center text-xs font-bold text-indigo-900 flex items-center justify-between">
                <span>Join this circle to post messages and participate in discussions.</span>
                <button
                  onClick={handleJoinToggle}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                >
                  Join Circle
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message #${circle.name}...`}
                  className="flex-1 px-4 py-2.5 bg-[#FDFBF7] border border-[#E6DFD3] rounded-2xl text-xs font-semibold text-[#2F2F2F] focus:outline-none focus:ring-2 focus:ring-[#355E3B]"
                />
                <button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="px-4 py-2.5 bg-[#355E3B] hover:bg-[#2A4B2F] text-white text-xs font-bold rounded-2xl transition shadow-md disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E6DFD3] shadow-2xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#2F2F2F] uppercase tracking-wider">
            Connected Members ({memberList.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {memberList.map((m: any, idx: number) => {
              const memId = typeof m === 'object' ? m._id : m;
              const memName = typeof m === 'object' ? m.name : `Neighbor ${idx + 1}`;
              const trustScore = typeof m === 'object' ? m.trustScore || 96 : 95;
              const neighborhood = typeof m === 'object' ? m.neighborhood || circle.neighborhood : circle.neighborhood;

              return (
                <div
                  key={memId || idx}
                  className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6DFD3] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar userId={memId} name={memName} size="md" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#2F2F2F] truncate">{memName}</div>
                      <div className="text-[11px] text-slate-500 truncate">{neighborhood}</div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-500" />
                        <span>{trustScore}% Trust</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/chats?userId=${memId}`}
                    className="p-2 bg-white hover:bg-emerald-50 text-slate-600 hover:text-[#355E3B] rounded-xl border border-[#E6DFD3] transition"
                    title="Direct Message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E6DFD3] shadow-2xs space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-[#2F2F2F] uppercase tracking-wider mb-2">
              Circle Purpose & Guidelines
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {circle.description ||
                'This circle exists for verified neighbors to collaborate, share equipment, and assist each other locally.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E6DFD3]">
            <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#E6DFD3] space-y-1">
              <div className="text-xs font-bold text-[#2F2F2F]">Neighborhood Coverage</div>
              <div className="text-xs text-slate-600 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C96C4A]" />
                <span>{circle.neighborhood || 'Local Circle'}</span>
              </div>
            </div>

            <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#E6DFD3] space-y-1">
              <div className="text-xs font-bold text-[#2F2F2F]">Privacy & Access</div>
              <div className="text-xs text-slate-600 font-medium">
                {circle.privacy || 'Public Circle'} — Free and open to all verified neighbors.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircleDetailsPage;
