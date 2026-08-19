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
  completeFavorRequest,
  blockUser,
  unblockUser,
  getCommunityGroups,
  createCommunityGroup,
  joinCommunityGroup,
  leaveCommunityGroup,
  getGroupMessages,
  sendGroupMessage,
} from '../services/api';
import { Conversation, Message, CommunityGroup, CommunityGroupMessage } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { RatingModal } from '../components/reviews/RatingModal';
import { UserAvatar } from '../components/UserAvatar';
import { CircleIconBadge } from '../components/CircleIcons';
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
  Users,
  Star,
  Ban,
  Unlock,
  Check,
  Plus,
  X,
  MessageCircle,
} from 'lucide-react';

const CIRCLE_CATEGORIES = [
  'All',
  'Tools & DIY',
  'Garden & Balcony',
  'Pet Care',
  'Elderly Care',
  'Tech & Wi-Fi',
  'Study & Books',
  'General Help',
];

export const ChatsPage: React.FC = () => {
  const { user, login, loading: authLoading } = useAuth();
  const { socket } = useSocketContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab State: 'direct' | 'groups'
  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>(
    searchParams.get('tab') === 'groups' ? 'groups' : 'direct'
  );

  // Direct Conversations State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedReqId, setSelectedReqId] = useState<string | null>(
    searchParams.get('request') || null
  );
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Community Groups State
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<CommunityGroup | null>(null);
  const [groupMessages, setGroupMessages] = useState<CommunityGroupMessage[]>([]);
  const [groupCategoryFilter, setGroupCategoryFilter] = useState('All');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('Tools & DIY');
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Loading & Error States
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [groupMessageText, setGroupMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [completingFavor, setCompletingFavor] = useState(false);

  // Rating and Block Modals
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const groupMessagesContainerRef = useRef<HTMLDivElement>(null);

  const getEntityId = (entity: any): string => {
    if (!entity) return '';
    if (typeof entity === 'string') return entity;
    return String(entity._id || entity.id || '');
  };

  const isOutgoingMessage = (
    msg: Message | CommunityGroupMessage,
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

    return false;
  };

  const scrollChatToBottom = (smooth = true, isGroup = false) => {
    const container = isGroup ? groupMessagesContainerRef.current : messagesContainerRef.current;
    if (container) {
      if (smooth) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      } else {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Fetch Direct Conversations
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
              const reqUserId = getEntityId(reqData.requester);
              const isMe = user && (user._id === reqUserId || user.id === reqUserId);
              let otherUserObj = isMe ? reqData.helper : reqData.requester;

              if (!otherUserObj && initialUserId) {
                try {
                  const fetchedUser = await getUserById(initialUserId);
                  if (fetchedUser) otherUserObj = fetchedUser;
                } catch (e) {}
              }

              if (!otherUserObj) {
                otherUserObj = {
                  _id: initialUserId || 'user_neighbor',
                  name: searchParams.get('name') || 'Neighbor',
                  avatarUrl:
                    searchParams.get('avatar') ||
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
                  trustScore: 98,
                  neighborhood: 'Local Neighborhood',
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
            }
          } catch (e) {
            console.warn('Fallback convo for request:', initialReqId);
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

  // Fetch Community Groups
  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const data = await getCommunityGroups({
        category: groupCategoryFilter !== 'All' ? groupCategoryFilter : undefined,
      });
      setGroups(data || []);
      if (data && data.length > 0 && !selectedGroupId) {
        setSelectedGroupId(data[0]._id);
        setActiveGroup(data[0]);
      }
    } catch (err: any) {
      console.error('Fetch groups error:', err);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchGroups();
    }
  }, [user, searchParams.get('request'), searchParams.get('user')]);

  useEffect(() => {
    fetchGroups();
  }, [groupCategoryFilter]);

  // Direct Messages fetching
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
      setTimeout(() => scrollChatToBottom(false, false), 50);
    }
  }, [selectedReqId, conversations]);

  // Group Messages fetching
  const fetchGroupMessages = async (gId: string) => {
    try {
      const data = await getGroupMessages(gId);
      setGroupMessages(data || []);
      setTimeout(() => scrollChatToBottom(false, true), 50);
    } catch (err: any) {
      console.error('Fetch group messages error:', err);
    }
  };

  useEffect(() => {
    if (selectedGroupId) {
      fetchGroupMessages(selectedGroupId);
      const found = groups.find((g) => g._id === selectedGroupId);
      if (found) setActiveGroup(found);
    }
  }, [selectedGroupId, groups]);

  // Direct Socket listener
  useEffect(() => {
    if (!socket || !selectedReqId) return;

    socket.emit('joinRoom', { requestId: selectedReqId });
    socket.emit('request:join', { requestId: selectedReqId });

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
      socket.emit('request:leave', { requestId: selectedReqId });
      socket.off('newMessage', handleNewMessage);
      socket.off('chat:message', handleNewMessage);
    };
  }, [socket, selectedReqId]);

  // Group Socket listener
  useEffect(() => {
    if (!socket || !selectedGroupId) return;

    socket.emit('group:join', { groupId: selectedGroupId });

    const handleGroupMsg = (newMsg: CommunityGroupMessage) => {
      if (newMsg.group === selectedGroupId) {
        setGroupMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(() => scrollChatToBottom(true, true), 50);
      }
    };

    socket.on('group:message', handleGroupMsg);

    return () => {
      socket.emit('group:leave', { groupId: selectedGroupId });
      socket.off('group:message', handleGroupMsg);
    };
  }, [socket, selectedGroupId]);

  // Auto-scroll on new direct messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollChatToBottom(true, false);
    }
  }, [messages.length]);

  // Auto-scroll on new group messages
  useEffect(() => {
    if (groupMessages.length > 0) {
      scrollChatToBottom(true, true);
    }
  }, [groupMessages.length]);

  const handleSelectConversation = (convo: Conversation) => {
    setSelectedReqId(convo.requestId);
    setActiveConversation(convo);
    setSearchParams({ request: convo.requestId, tab: 'direct' });
  };

  const handleSelectGroup = (group: CommunityGroup) => {
    setSelectedGroupId(group._id);
    setActiveGroup(group);
    setSearchParams({ tab: 'groups' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqId || !messageText.trim()) return;

    const text = messageText.trim();
    setMessageText('');

    const currentUserId = getEntityId(user);
    const receiverId = getEntityId(activeConversation?.otherUser);
    const tempId = 'temp_' + Date.now();

    const optimisticMsg: Message = {
      _id: tempId,
      request: selectedReqId,
      sender: user ? { ...user, _id: currentUserId, id: currentUserId } : { _id: currentUserId, id: currentUserId, name: 'You' },
      receiver: activeConversation?.otherUser,
      text,
      createdAt: new Date().toISOString(),
      read: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      setSendingMsg(true);
      const sentMsg = await sendMessage(selectedReqId, text, receiverId);

      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? sentMsg : m))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    } finally {
      setSendingMsg(false);
    }
  };

  const handleSendGroupMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId || !groupMessageText.trim()) return;

    const text = groupMessageText.trim();
    setGroupMessageText('');

    const currentUserId = getEntityId(user);
    const tempId = 'temp_grp_' + Date.now();

    const optimisticMsg: CommunityGroupMessage = {
      _id: tempId,
      group: selectedGroupId,
      sender: user ? { ...user, _id: currentUserId, id: currentUserId } : { _id: currentUserId, name: 'You' },
      text,
      createdAt: new Date().toISOString(),
    };

    setGroupMessages((prev) => [...prev, optimisticMsg]);

    try {
      const sent = await sendGroupMessage(selectedGroupId, text);
      setGroupMessages((prev) => prev.map((m) => (m._id === tempId ? sent : m)));
    } catch (err: any) {
      alert(err.message || 'Failed to post group message');
      setGroupMessages((prev) => prev.filter((m) => m._id !== tempId));
    }
  };

  const handleCompleteRequest = async () => {
    if (!selectedReqId) return;
    try {
      setCompletingFavor(true);
      await completeFavorRequest(selectedReqId);
      if (activeConversation) {
        setActiveConversation({
          ...activeConversation,
          requestStatus: 'Completed',
        });
      }
      setShowRatingModal(true);
    } catch (err: any) {
      alert(err.message || 'Failed to mark favor completed');
    } finally {
      setCompletingFavor(false);
    }
  };

  const handleToggleBlock = async () => {
    const targetUserId = getEntityId(activeConversation?.otherUser);
    if (!targetUserId) return;

    const isCurrentlyBlocked = user?.blockedUsers?.includes(targetUserId);

    try {
      setBlockLoading(true);
      if (isCurrentlyBlocked) {
        await unblockUser(targetUserId);
        const updatedBlocked = (user?.blockedUsers || []).filter((b) => b !== targetUserId);
        if (user) {
          login(localStorage.getItem('neighborly_token') || '', {
            ...user,
            blockedUsers: updatedBlocked,
          });
        }
      } else {
        await blockUser(targetUserId);
        const updatedBlocked = [...(user?.blockedUsers || []), targetUserId];
        if (user) {
          login(localStorage.getItem('neighborly_token') || '', {
            ...user,
            blockedUsers: updatedBlocked,
          });
        }
      }
      setShowBlockDialog(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update user block status');
    } finally {
      setBlockLoading(false);
    }
  };

  const handleJoinLeaveGroup = async (group: CommunityGroup) => {
    const isMember = group.members.some((m) => getEntityId(m) === getEntityId(user));
    try {
      if (isMember) {
        const updated = await leaveCommunityGroup(group._id);
        setGroups((prev) => prev.map((g) => (g._id === group._id ? updated : g)));
        if (activeGroup?._id === group._id) setActiveGroup(updated);
      } else {
        const updated = await joinCommunityGroup(group._id);
        setGroups((prev) => prev.map((g) => (g._id === group._id ? updated : g)));
        if (activeGroup?._id === group._id) setActiveGroup(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update group membership');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      setCreatingGroup(true);
      const created = await createCommunityGroup({
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
        category: newGroupCategory,
        neighborhood: user?.neighborhood || 'Local Community',
      });
      setGroups((prev) => [created, ...prev]);
      setSelectedGroupId(created._id);
      setActiveGroup(created);
      setShowCreateGroupModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
    } catch (err: any) {
      alert(err.message || 'Failed to create circle group');
    } finally {
      setCreatingGroup(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const q = searchTerm.toLowerCase();
    const otherName = c.otherUser?.name?.toLowerCase() || '';
    const reqTitle = c.requestTitle?.toLowerCase() || '';
    const msgText = c.lastMessage?.text?.toLowerCase() || '';
    return otherName.includes(q) || reqTitle.includes(q) || msgText.includes(q);
  });

  const otherUser = activeConversation?.otherUser;
  const otherUserId = getEntityId(otherUser);
  const isOtherUserBlocked = Boolean(otherUserId && user?.blockedUsers?.includes(otherUserId));

  const isCurrentGroupMember = Boolean(
    activeGroup && activeGroup.members?.some((m) => getEntityId(m) === getEntityId(user))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner with Tabs */}
      <div className="bg-white rounded-3xl p-6 border border-orange-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('direct');
                setSearchParams({ tab: 'direct' });
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'direct'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-orange-50 text-orange-800 hover:bg-orange-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Direct Favor Chats</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('groups');
                setSearchParams({ tab: 'groups' });
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'groups'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-orange-50 text-orange-800 hover:bg-orange-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Community Circles ({groups.length})</span>
            </button>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {activeTab === 'direct' ? 'Neighborhood Direct Messages' : 'Community Circle Group Chats'}
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {activeTab === 'direct'
              ? 'Coordinate tool loans, pickup times, and request details directly with verified local neighbors.'
              : 'Join neighborhood interest circles, tool sharing collectives, and community discussions.'}
          </p>
        </div>

        {activeTab === 'groups' ? (
          <button
            onClick={() => setShowCreateGroupModal(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Circle</span>
          </button>
        ) : (
          <Link
            to="/create-request"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ask for Help</span>
          </Link>
        )}
      </div>

      {/* ================= DIRECT CHAT TAB ================= */}
      {activeTab === 'direct' && (
        <>
          {conversations.length === 0 ? (
            <div className="bg-white border border-orange-200/80 rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto border border-orange-200">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">No Direct Chats Yet</h3>
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
              </div>
            </div>
          ) : (
            <div className="bg-white border border-orange-200/80 rounded-3xl shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
              {/* Left Column: Direct Conversations List (Cols 5) */}
              <div
                className={`lg:col-span-5 border-r border-orange-100 flex flex-col bg-orange-50/30 ${
                  selectedReqId && 'hidden lg:flex'
                }`}
              >
                {/* Search */}
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
                          <UserAvatar
                            userId={getEntityId(convo.otherUser)}
                            name={otherName}
                            size="md"
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

              {/* Right Column: Direct Chat Panel (Cols 7) */}
              <div
                className={`lg:col-span-7 flex flex-col h-[600px] bg-white ${
                  !selectedReqId && 'hidden lg:flex'
                }`}
              >
                {activeConversation ? (
                  <>
                    {/* Header */}
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
                          <UserAvatar
                            userId={getEntityId(activeConversation.otherUser)}
                            name={activeConversation.otherUser?.name || 'Neighbor'}
                            size="md"
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

                          <div className="flex items-center gap-2 text-xs truncate">
                            <Link
                              to={`/request/${activeConversation.requestId}`}
                              className="font-bold text-[#D97B4F] hover:underline truncate flex items-center gap-1"
                            >
                              <span>{activeConversation.requestTitle}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Header Actions: Complete Favor + Block/Unblock */}
                      <div className="flex items-center gap-2">
                        {activeConversation.requestStatus !== 'Completed' && (
                          <button
                            onClick={handleCompleteRequest}
                            disabled={completingFavor}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{completingFavor ? 'Completing...' : 'Mark Complete'}</span>
                          </button>
                        )}

                        {activeConversation.requestStatus === 'Completed' && (
                          <button
                            onClick={() => setShowRatingModal(true)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1"
                          >
                            <Star className="w-3.5 h-3.5 fill-white" />
                            <span>Rate</span>
                          </button>
                        )}

                        {otherUserId && (
                          <button
                            onClick={() => setShowBlockDialog(true)}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
                            title={isOtherUserBlocked ? 'Unblock User' : 'Block User'}
                          >
                            {isOtherUserBlocked ? (
                              <Unlock className="w-4 h-4 text-red-500" />
                            ) : (
                              <Ban className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Messages Feed */}
                    <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF3E9]/60">
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
                          const isMe = isOutgoingMessage(msg, user, activeConversation?.otherUser);
                          const senderName = isMe
                            ? user?.name || 'You'
                            : typeof msg.sender === 'object' && msg.sender?.name
                            ? msg.sender.name
                            : activeConversation?.otherUser?.name || 'Neighbor';

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
                    </div>

                    {/* Chat Input or Block Notice */}
                    {isOtherUserBlocked ? (
                      <div className="p-3 bg-red-50 border-t border-red-200 text-center text-xs text-red-700 font-semibold flex items-center justify-center gap-2">
                        <Ban className="w-4 h-4" />
                        <span>You have blocked this neighbor. Unblock them to message.</span>
                      </div>
                    ) : (
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
                    )}
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
        </>
      )}

      {/* ================= COMMUNITY CIRCLES TAB ================= */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CIRCLE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setGroupCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  groupCategoryFilter === cat
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-white border border-orange-200 text-slate-700 hover:bg-orange-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="bg-white border border-orange-200/80 rounded-3xl shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
            {/* Left Column: Circles List */}
            <div
              className={`lg:col-span-5 border-r border-orange-100 flex flex-col bg-orange-50/30 ${
                selectedGroupId && 'hidden lg:flex'
              }`}
            >
              <div className="p-3.5 border-b border-orange-100 bg-white flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Community Circles</span>
                <span className="text-[11px] font-bold text-orange-600">{groups.length} Circles Active</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-orange-100/60">
                {groups.map((group) => {
                  const isSelected = group._id === selectedGroupId;
                  const isMember = group.members?.some((m) => getEntityId(m) === getEntityId(user));

                  return (
                    <button
                      key={group._id}
                      onClick={() => handleSelectGroup(group)}
                      className={`w-full p-4 text-left transition flex items-start gap-3 ${
                        isSelected
                          ? 'bg-orange-100/80 font-semibold border-l-4 border-orange-500'
                          : 'hover:bg-orange-50/80'
                      }`}
                    >
                      <CircleIconBadge
                        category={group.category}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="font-extrabold text-slate-900 text-xs truncate">{group.name}</h4>
                          {isMember && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                              Member
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">{group.description || 'Community chat group'}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-semibold">
                          <span className="text-orange-600 font-bold">{group.category}</span>
                          <span>•</span>
                          <span>{group.members?.length || 1} neighbors</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Active Group Chat */}
            <div
              className={`lg:col-span-7 flex flex-col h-[600px] bg-white ${
                !selectedGroupId && 'hidden lg:flex'
              }`}
            >
              {activeGroup ? (
                <>
                  {/* Group Header */}
                  <div className="p-4 bg-orange-50/80 border-b border-orange-200/60 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => setSelectedGroupId(null)}
                        className="lg:hidden p-1 text-slate-500"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <CircleIconBadge
                        category={activeGroup.category}
                        size="md"
                      />
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm truncate">{activeGroup.name}</h3>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          {activeGroup.members?.length || 1} members • {activeGroup.category}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleJoinLeaveGroup(activeGroup)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition shadow-2xs ${
                        isCurrentGroupMember
                          ? 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                    >
                      {isCurrentGroupMember ? 'Leave Circle' : 'Join Circle'}
                    </button>
                  </div>

                  {/* Messages Feed */}
                  <div
                    ref={groupMessagesContainerRef}
                    className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FFF7ED]/50"
                  >
                    {groupMessages.length === 0 ? (
                      <div className="text-center py-16 text-slate-400 text-xs font-medium space-y-1">
                        <Users className="w-8 h-8 text-orange-300 mx-auto" />
                        <p className="font-bold">Welcome to {activeGroup.name}!</p>
                        <p>Say hello to your neighbors and start the conversation.</p>
                      </div>
                    ) : (
                      groupMessages.map((msg, idx) => {
                        const isMe = isOutgoingMessage(msg, user);
                        const senderName = isMe
                          ? 'You'
                          : typeof msg.sender === 'object' && msg.sender?.name
                          ? msg.sender.name
                          : 'Neighbor';

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

                  {/* Group Message Input */}
                  <form
                    onSubmit={handleSendGroupMessage}
                    className="p-3 bg-white border-t border-orange-200/60 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={groupMessageText}
                      onChange={(e) => setGroupMessageText(e.target.value)}
                      placeholder={`Message ${activeGroup.name}...`}
                      className="flex-1 px-4 py-2.5 bg-orange-50/50 border border-orange-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500 focus:bg-white font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!groupMessageText.trim()}
                      className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-xs transition flex items-center gap-1 shrink-0"
                    >
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
                  <Users className="w-10 h-10 text-orange-300" />
                  <p className="text-xs font-bold text-slate-600">Select a Circle to view messages</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Circle Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-orange-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                <span>Create Community Circle</span>
              </h3>
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Circle Name *</label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Garden & Balcony Exchange"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Category</label>
                <select
                  value={newGroupCategory}
                  onChange={(e) => setNewGroupCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-hidden font-medium"
                >
                  {CIRCLE_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="What is this circle for? (e.g. Sharing seeds, potting soil, and plant care tips)"
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-hidden resize-none font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingGroup || !newGroupName.trim()}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-xs transition"
                >
                  {creatingGroup ? 'Creating...' : 'Create Circle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rating & Review Modal */}
      {otherUser && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          requestId={selectedReqId || ''}
          requestTitle={activeConversation?.requestTitle || 'Favor Request'}
          reviewee={otherUser}
          onSuccess={() => {
            fetchConversations();
          }}
        />
      )}

      {/* Block Dialog */}
      {showBlockDialog && otherUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-orange-100 space-y-4 text-center">
            <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${isOtherUserBlocked ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {isOtherUserBlocked ? <Unlock className="w-6 h-6" /> : <Ban className="w-6 h-6" />}
            </div>
            <h3 className="text-base font-black text-slate-900">
              {isOtherUserBlocked ? `Unblock ${otherUser.name}?` : `Block ${otherUser.name}?`}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {isOtherUserBlocked
                ? 'Unblocking will allow this neighbor to message you and coordinate on requests.'
                : 'Blocked users cannot send you direct messages or interact in your circles.'}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBlockDialog(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleBlock}
                disabled={blockLoading}
                className={`flex-1 py-2.5 text-white font-extrabold text-xs rounded-2xl shadow-xs transition ${
                  isOtherUserBlocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {blockLoading ? 'Updating...' : isOtherUserBlocked ? 'Unblock' : 'Block User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
