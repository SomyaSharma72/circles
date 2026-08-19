import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { getFavorRequests, getCommunityMetrics, searchFavorRequests, searchNeighbors, getCircles } from '../services/api';
import { FavorRequest, CommunityMetrics } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { UserAvatar } from '../components/UserAvatar';
import { CircleIconBadge } from '../components/CircleIcons';
import { useSocketContext } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import {
  CharacterDogWalker,
  CharacterToolShare,
  CharacterTutoring,
  CharacterGardener,
  CircleAvatarStack,
} from '../components/CharacterIllustrations';
import {
  Search,
  MapPin,
  Clock,
  PlusCircle,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Heart,
  Wrench,
  Dog,
  ShoppingBag,
  Laptop,
  GraduationCap,
  MessageSquare,
  HandHeart,
  Compass,
  Star,
  Quote,
  Zap,
  CheckCircle2,
  Calendar,
  Coffee,
  Sun,
  Flame,
  X,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [requests, setRequests] = useState<FavorRequest[]>([]);
  const [metrics, setMetrics] = useState<CommunityMetrics | null>(null);
  const [previewCircles, setPreviewCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket } = useSocketContext();
  const { location: circleLocation } = useLocationContext();

  const categoryOptions = [
    { name: 'All', icon: Sparkles, color: 'bg-[#355E3B] text-white' },
    { name: 'Childcare', icon: Users, color: 'bg-[#355E3B]/10 text-[#355E3B]' },
    { name: 'Tutoring', icon: GraduationCap, color: 'bg-[#6E8B5B]/10 text-[#6E8B5B]' },
    { name: 'Repairs & Tools', icon: Wrench, color: 'bg-[#C96C4A]/10 text-[#C96C4A]' },
    { name: 'Pet Care', icon: Dog, color: 'bg-[#355E3B]/10 text-[#355E3B]' },
    { name: 'Groceries/Errands', icon: ShoppingBag, color: 'bg-[#6E8B5B]/10 text-[#6E8B5B]' },
    { name: 'Tech Help', icon: Laptop, color: 'bg-[#C96C4A]/10 text-[#C96C4A]' },
  ];

  // Floating community speech bubbles for living neighborhood scene
  const floatingBubbles = [
    { text: 'Need a drill for 30 mins?', author: 'Rohan', icon: '🔧', delay: 0 },
    { text: 'Math tutoring available tonight', author: 'Ananya', icon: '📚', delay: 0.8 },
    { text: 'Can someone collect my parcel?', author: 'Sunita', icon: '📦', delay: 1.5 },
    { text: 'Riya can lend a cake stand', author: 'Riya', icon: '🍰', delay: 2.1 },
  ];

  // Trusted Neighbors with realistic response times and human details
  const trustedNeighbors = [
    {
      id: 'user_aarav_2',
      name: 'Aarav Patel',
      role: 'Scooter Repair • Bosch Drill • Jumpstart',
      rating: 4.9,
      reviewsCount: 31,
      favorsCount: 27,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      badge: 'Super Helper',
      responseTime: 'Replies in ~10 mins',
      activeStatus: 'Online now',
      recentNote: 'Available to lend battery jumper cables or heavy Bosch drill.',
      mutuals: 18,
    },
    {
      id: 'user_ananya_4',
      name: 'Ananya Iyer',
      role: 'Wi-Fi & Tech • Home Baking • Plant Care',
      rating: 4.9,
      reviewsCount: 22,
      favorsCount: 19,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      badge: 'Circle Leader',
      responseTime: 'Usually replies in 5 mins',
      activeStatus: 'Active 2 min ago',
      recentNote: 'Can help troubleshoot mesh Wi-Fi routers or lend baking mixer.',
      mutuals: 12,
    },
    {
      id: 'user_rohan_3',
      name: 'Rohan Gupta',
      role: 'Dog Walking • Heavy Lifting • Moving Help',
      rating: 4.7,
      reviewsCount: 18,
      favorsCount: 15,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
      badge: 'Trusted Neighbor',
      responseTime: 'Replies in ~15 mins',
      activeStatus: 'Seen 10 min ago',
      recentNote: 'Available for evening dog walks or moving assistance.',
      mutuals: 8,
    },
  ];

  const [displayedNeighbors, setDisplayedNeighbors] = useState(trustedNeighbors);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reqData, metricData, circlesData] = await Promise.all([
        getFavorRequests({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
        }),
        getCommunityMetrics(),
        getCircles().catch(() => []),
      ]);

      setRequests(reqData);
      setMetrics(metricData);
      if (Array.isArray(circlesData)) {
        setPreviewCircles(circlesData.slice(0, 4));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load community feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeSearchTerm) {
      fetchCommunityData();
    }
  }, [selectedCategory]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      handleClearSearch();
      return;
    }

    setActiveSearchTerm(query);
    setIsAiSearching(true);

    try {
      const q = query.toLowerCase();
      const [reqResults, neighborResults] = await Promise.allSettled([
        searchFavorRequests(query),
        searchNeighbors(query),
      ]);

      if (reqResults.status === 'fulfilled' && Array.isArray(reqResults.value)) {
        setRequests(reqResults.value);
      }

      // Filter local trustedNeighbors
      const localMatched = trustedNeighbors.filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.role.toLowerCase().includes(q) ||
          n.recentNote.toLowerCase().includes(q) ||
          n.badge.toLowerCase().includes(q)
      );

      // Merge API neighbor results
      const apiUsers =
        neighborResults.status === 'fulfilled' && Array.isArray(neighborResults.value)
          ? neighborResults.value
          : [];

      const formattedApiNeighbors = apiUsers.map((u: any) => {
        const uId = u._id || u.id;
        const existing = trustedNeighbors.find((tn) => tn.id === uId);
        if (existing) return existing;

        const skillsStr = Array.isArray(u.skills) && u.skills.length > 0 ? u.skills.join(' • ') : '';
        const role = u.profession ? (skillsStr ? `${u.profession} • ${skillsStr}` : u.profession) : (skillsStr || 'Neighbor');

        return {
          id: uId,
          name: u.name,
          role,
          rating: u.trustScore || 4.8,
          reviewsCount: u.completedFavors ? u.completedFavors * 2 : 12,
          favorsCount: u.completedFavors || 10,
          avatar: u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          badge: u.trustScore >= 4.9 ? 'Super Helper' : 'Verified Neighbor',
          responseTime: 'Replies in ~10 mins',
          activeStatus: 'Active in circle',
          recentNote: u.bio || `Available to help with ${u.skills?.join(', ') || 'community favors'}.`,
          mutuals: 8,
        };
      });

      const mergedMap = new Map();
      localMatched.forEach((n) => mergedMap.set(n.id, n));
      formattedApiNeighbors.forEach((n: any) => {
        if (!mergedMap.has(n.id)) {
          mergedMap.set(n.id, n);
        }
      });

      setDisplayedNeighbors(Array.from(mergedMap.values()));
    } catch (err: any) {
      console.error('Search error:', err);
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearchTerm('');
    fetchCommunityData();
    setDisplayedNeighbors(trustedNeighbors);
  };

  // Real-time socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('requestCreated', (newReq: FavorRequest) => {
      setRequests((prev) => [newReq, ...prev]);
    });

    socket.on('requestUpdated', (updatedReq: FavorRequest) => {
      setRequests((prev) => prev.map((r) => (r._id === updatedReq._id ? updatedReq : r)));
    });

    socket.on('circle:created', (newCircle: any) => {
      setPreviewCircles((prev) => [newCircle, ...prev.filter((c) => c._id !== newCircle._id)].slice(0, 4));
    });

    return () => {
      socket.off('requestCreated');
      socket.off('requestUpdated');
    };
  }, [socket]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-10">
      {/* Living Neighborhood Hero Section with Animated Characters */}
      <div className="relative bg-[#F5F1E8] border border-[#E6DFD3] rounded-[2.5rem] p-6 sm:p-10 shadow-xs overflow-hidden">
        {/* Soft Animated Background Circles */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#355E3B]/10 animate-pulse-circle pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-[#C96C4A]/10 animate-float pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          {/* Time/Weather Context Greeting Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FBFAF7] rounded-full border border-[#E6DFD3] text-xs font-bold text-[#2F2F2F]">
              <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <span>
                Good morning, {user?.name || 'Neighbor'}! ☀️ {circleLocation.neighborhood || 'Local'} Circle is active
              </span>
            </div>

            <CircleAvatarStack />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Headline & Integrated Search */}
            <div className="lg:col-span-7 space-y-4">
              <h1 className="font-extrabold text-3xl sm:text-4xl text-[#2F2F2F] tracking-tight leading-snug font-heading">
                People around you, <br className="hidden sm:inline" />
                <span className="text-[#C96C4A]">not strangers online.</span>
              </h1>
              <p className="text-sm text-[#2F2F2F]/80 font-medium leading-relaxed max-w-lg">
                Borrow tools, swap favors, share tutoring or dog walking with verified neighbors in your local circle.
              </p>

              {/* Integrated Search Bar on Paper background */}
              <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
                <div className="relative flex items-center">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search neighbors, skills, tags, or favor requests (e.g. drill, tutor, Aarav)..."
                    className="w-full pl-12 pr-32 py-3.5 bg-[#FBFAF7] text-[#2F2F2F] rounded-full text-xs sm:text-sm font-semibold placeholder:text-slate-400 border border-[#E6DFD3] focus:outline-hidden focus:border-[#C96C4A] shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-24 p-1 text-slate-400 hover:text-slate-600 transition"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="absolute right-2 px-4 py-2 bg-[#C96C4A] hover:bg-[#b25b3a] text-white text-xs font-extrabold rounded-full transition shadow-2xs"
                  >
                    {isAiSearching ? 'Scanning...' : 'Search'}
                  </button>
                </div>
              </form>

              {activeSearchTerm && (
                <div className="flex items-center justify-between gap-2 p-3 bg-[#FBFAF7] border border-[#E6DFD3] rounded-2xl text-xs font-semibold text-[#2F2F2F]">
                  <span>
                    Searching for <strong className="text-[#C96C4A]">"{activeSearchTerm}"</strong> ({displayedNeighbors.length} neighbors, {requests.length} asks)
                  </span>
                  <button
                    onClick={handleClearSearch}
                    className="text-[11px] font-bold text-[#C96C4A] hover:underline flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reset Filter</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Living Scene with Animated Illustrated Characters & Speech Bubbles */}
            <div className="lg:col-span-5 relative min-h-[220px] flex items-center justify-center">
              {/* Animated Vector Characters */}
              <div className="flex items-center gap-2">
                <CharacterToolShare className="w-32 h-32" />
                <CharacterDogWalker className="w-28 h-28 hidden sm:block" />
              </div>

              {/* Floating Speech Bubbles */}
              <div className="absolute inset-0 pointer-events-none">
                {floatingBubbles.map((b, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: [0.8, 1, 0.8], y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 4, delay: b.delay }}
                    className={`absolute bg-[#FBFAF7] border border-[#E6DFD3] px-3 py-1.5 rounded-2xl shadow-xs text-[11px] font-bold text-[#2F2F2F] flex items-center gap-1.5 ${
                      idx === 0
                        ? '-top-2 left-2'
                        : idx === 1
                        ? 'top-8 right-2'
                        : idx === 2
                        ? 'bottom-2 left-4'
                        : 'bottom-8 right-4'
                    }`}
                  >
                    <span>{b.icon}</span>
                    <span className="truncate max-w-[140px]">{b.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Circular Buttons */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest px-1">
          Circle Shortcuts
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Quick Action 1: Browse Favors */}
          <button
            onClick={() => {
              setSelectedCategory('All');
              if (activeSearchTerm) handleClearSearch();
            }}
            className="bg-[#FBFAF7] border border-[#E6DFD3] p-4 rounded-3xl hover:border-[#355E3B] transition shadow-2xs hover:shadow-xs group flex items-center gap-3 text-left"
          >
            <div className="w-11 h-11 rounded-full bg-[#355E3B] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-[#2F2F2F] block leading-tight">Browse Favors</span>
              <span className="text-[10px] text-slate-500 font-medium">Explore all open asks</span>
            </div>
          </button>

          {/* Quick Action 2: Ask for Help */}
          <Link
            to="/create-request"
            className="bg-[#FBFAF7] border border-[#E6DFD3] p-4 rounded-3xl hover:border-[#C96C4A] transition shadow-2xs hover:shadow-xs group flex items-center gap-3 text-left"
          >
            <div className="w-11 h-11 rounded-full bg-[#C96C4A] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition shadow-2xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-[#2F2F2F] block leading-tight">Ask for Help</span>
              <span className="text-[10px] text-slate-500 font-medium">Post in your circle</span>
            </div>
          </Link>

          {/* Quick Action 3: Offer Skills */}
          <Link
            to="/profile"
            className="bg-[#FBFAF7] border border-[#E6DFD3] p-4 rounded-3xl hover:border-[#6E8B5B] transition shadow-2xs hover:shadow-xs group flex items-center gap-3 text-left"
          >
            <div className="w-11 h-11 rounded-full bg-[#6E8B5B] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition shadow-2xs">
              <HandHeart className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-[#2F2F2F] block leading-tight">Offer Skill</span>
              <span className="text-[10px] text-slate-500 font-medium">List tool or favor</span>
            </div>
          </Link>

          {/* Quick Action 4: Circles Map */}
          <Link
            to="/area-scan"
            className="bg-[#FBFAF7] border border-[#E6DFD3] p-4 rounded-3xl hover:border-[#355E3B] transition shadow-2xs hover:shadow-xs group flex items-center gap-3 text-left"
          >
            <div className="w-11 h-11 rounded-full bg-[#355E3B] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition shadow-2xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-[#2F2F2F] block leading-tight">Circles Map</span>
              <span className="text-[10px] text-slate-500 font-medium">Visual map view</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Trusted Neighbors & Real Community Details (Mixed Card Heights Layout) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl font-extrabold text-[#2F2F2F] tracking-tight font-heading">
              {activeSearchTerm ? 'Matching Neighbors' : `Trusted Neighbors in ${circleLocation.neighborhood || 'Your Circle'}`}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {activeSearchTerm
                ? `Neighbors matching "${activeSearchTerm}" by name, skills, tags, or services`
                : 'Real people with active response times and mutual connections'}
            </p>
          </div>
          <Link to="/leaderboard" className="text-xs font-bold text-[#C96C4A] hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {displayedNeighbors.length === 0 ? (
          <div className="p-8 text-center bg-[#FBFAF7] rounded-[2rem] border border-[#E6DFD3] text-xs font-semibold text-slate-500">
            No neighbors found matching "{activeSearchTerm}". Try searching for another skill, tag, or name.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {displayedNeighbors.map((neighbor, idx) => (
              <motion.div
                key={neighbor.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.15 }}
                className={`bg-[#FBFAF7] rounded-[2rem] p-5 border border-[#E6DFD3] shadow-2xs space-y-4 flex flex-col justify-between hover:border-[#355E3B] transition ${
                  idx === 1 ? 'md:translate-y-2' : ''
                }`}
              >
                <div className="space-y-3">
                  {/* Avatar & Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <UserAvatar userId={neighbor.id} name={neighbor.name} size="md" />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-[#2F2F2F]">{neighbor.name}</h3>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-[#355E3B]/10 text-[#355E3B] rounded-full inline-block mt-0.5">
                          {neighbor.badge}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-extrabold text-amber-500 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{neighbor.rating}</span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-600 leading-tight">{neighbor.role}</p>

                  {/* Real Community Detail Bubble */}
                  <div className="bg-[#F5F1E8] p-3 rounded-2xl border border-[#E6DFD3]/80 text-xs text-[#2F2F2F] space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                      <span>{neighbor.responseTime}</span>
                      <span className="text-emerald-700 font-extrabold">{neighbor.activeStatus}</span>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed italic">
                      "{neighbor.recentNote}"
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-[#E6DFD3]">
                  <span className="font-bold text-[#355E3B] text-[11px]">
                    {neighbor.mutuals} mutual connections
                  </span>
                  <Link
                    to={`/chats?user=${neighbor.id}&name=${encodeURIComponent(neighbor.name)}&avatar=${encodeURIComponent(neighbor.avatar)}`}
                    className="px-3.5 py-1.5 bg-[#355E3B] hover:bg-[#2c4e31] text-white text-[11px] font-bold rounded-full transition shadow-2xs"
                  >
                    Message
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Circular Category Chips */}
      <div className="bg-[#FBFAF7] p-4 rounded-[2rem] border border-[#E6DFD3] shadow-2xs space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold text-[#2F2F2F] uppercase tracking-wider">
            Explore Skills & Need Circles
          </span>
          <span className="text-xs font-bold text-[#6E8B5B]">Select a filter</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoryOptions.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-[#355E3B] text-white border-[#355E3B] shadow-2xs'
                    : 'bg-[#F5F1E8] hover:bg-[#E6DFD3] text-[#2F2F2F] border-[#E6DFD3]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#C96C4A]'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Organic Feed of Live Favor Requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl font-extrabold text-[#2F2F2F] tracking-tight font-heading">
              Live Requests in Your Circle
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Neighborly help requests updated in real-time
            </p>
          </div>
          <span className="text-xs font-extrabold px-3 py-1 bg-[#355E3B]/10 text-[#355E3B] rounded-full border border-[#355E3B]/20">
            {requests.length} open favors
          </span>
        </div>

        {loading ? (
          <LoadingSpinner label="Gathering local circle activity..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchCommunityData} />
        ) : requests.length === 0 ? (
          <EmptyState
            title="No Active Asks in This Filter"
            description="Be the first neighbor to request help in your circle!"
            actionText="Post a Request"
            actionLink="/create-request"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req, idx) => (
              <motion.div
                key={req._id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="bg-[#FBFAF7] rounded-[2rem] border border-[#E6DFD3] p-5 shadow-2xs hover:border-[#C96C4A] hover:shadow-xs transition group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        userId={req.requester?._id || req.requester?.id}
                        name={req.requester?.name || 'Neighbor'}
                        size="sm"
                      />
                      <div>
                        <span className="font-extrabold text-[#2F2F2F] text-sm block">
                          {req.requester?.name || 'Neighbor'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          ★ {req.requester?.trustScore || '4.8'} Trust Rating
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold text-[#C96C4A] bg-[#C96C4A]/10 px-3 py-1 rounded-full border border-[#C96C4A]/20">
                      {req.category}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-[#2F2F2F] text-base leading-snug group-hover:text-[#C96C4A] transition font-heading">
                    {req.title}
                  </h3>

                  <p className="text-slate-600 text-xs leading-relaxed font-medium line-clamp-2">
                    {req.summary || req.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-[#E6DFD3] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-[#C96C4A]" />
                    <span>{req.locationName || circleLocation.fullAddress || circleLocation.neighborhood}</span>
                  </div>

                  <Link
                    to={`/request/${req._id}`}
                    className="px-4 py-2 bg-[#C96C4A] hover:bg-[#b25b3a] text-white text-xs font-extrabold rounded-full shadow-2xs transition flex items-center gap-1.5"
                  >
                    <span>Offer Help</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Active Circle Groups Section */}
      <div className="space-y-4 pt-2 border-t border-[#E6DFD3]">
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#2F2F2F] tracking-tight font-heading">
                Active Circle Groups
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200">
                {previewCircles.length} Active
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Join local interest rings, shared tool sheds, and activity groups in {circleLocation.neighborhood || 'your neighborhood'}
            </p>
          </div>
          <Link
            to="/circles"
            className="text-xs font-bold text-[#355E3B] hover:underline flex items-center gap-1.5"
          >
            <span>Explore all circles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {previewCircles.map((circle) => {
            const memberCount = Array.isArray(circle.members) ? circle.members.length : 1;
            return (
              <Link
                key={circle._id}
                to={`/circles/${circle._id}`}
                className="bg-[#FBFAF7] rounded-[2rem] p-5 border border-[#E6DFD3] hover:border-indigo-400 hover:shadow-xs transition flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <CircleIconBadge
                      iconKey={circle.icon}
                      category={circle.category}
                      size="sm"
                    />
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {circle.privacy || 'Public'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-[#2F2F2F] group-hover:text-indigo-900 transition leading-snug line-clamp-1 font-heading">
                      {circle.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-1 leading-relaxed">
                      {circle.description || 'Neighborhood collaboration & meetups.'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#E6DFD3] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-[120px]">
                    <MapPin className="w-3 h-3 text-[#C96C4A] shrink-0" />
                    <span className="truncate">{circle.neighborhood || circleLocation.neighborhood || 'Local Circle'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-indigo-700 font-bold text-[11px]">
                    <Users className="w-3 h-3" />
                    <span>{memberCount}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
