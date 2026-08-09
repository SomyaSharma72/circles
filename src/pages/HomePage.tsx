import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { getFavorRequests, getCommunityMetrics, searchFavorRequests } from '../services/api';
import { FavorRequest, CommunityMetrics } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { useSocketContext } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [requests, setRequests] = useState<FavorRequest[]>([]);
  const [metrics, setMetrics] = useState<CommunityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket } = useSocketContext();

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
      id: 'char_priya',
      name: 'Priya Singh',
      role: 'Pet Sitting • Math Tutoring • Repairs',
      rating: 4.8,
      reviewsCount: 23,
      favorsCount: 19,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
      badge: 'Circle Leader',
      responseTime: 'Usually replies in 5 mins',
      activeStatus: 'Active 2 min ago',
      recentNote: 'Riya can lend a cake stand or baking mixer this weekend.',
      mutuals: 12,
    },
    {
      id: 'char_aarav',
      name: 'Aarav Patel',
      role: 'Scooter Repair • Bosch Drill • Jumpstart',
      rating: 4.9,
      reviewsCount: 31,
      favorsCount: 27,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      badge: 'Super Helper',
      responseTime: 'Replies in ~10 mins',
      activeStatus: 'Online now',
      recentNote: 'Uncle Sharma needs help carrying groceries upstairs.',
      mutuals: 18,
    },
    {
      id: 'char_ananya',
      name: 'Ananya Sharma',
      role: 'Physics & Math • Plant Care',
      rating: 4.7,
      reviewsCount: 18,
      favorsCount: 15,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      badge: 'Trusted Neighbor',
      responseTime: 'Replies in ~15 mins',
      activeStatus: 'Seen 10 min ago',
      recentNote: 'Aman is available for physics tutoring tonight.',
      mutuals: 8,
    },
  ];

  // Local community bulletin groups
  const communityGroups = [
    {
      title: 'Sector 62 Plant & Garden Swaps',
      members: 48,
      description: 'Exchange saplings, organic soil, and watering favors when travelling.',
      activeToday: '3 new posts today',
      icon: '🌱',
    },
    {
      title: 'Parenting & Childcare Circle',
      members: 62,
      description: 'Shared carpooling for school pickups and trusted babysitting swaps.',
      activeToday: '5 active requests',
      icon: '👶',
    },
    {
      title: 'Tool Library & Hardware Club',
      members: 89,
      description: 'Don’t buy tools you only use once. Borrow drills, ladders & lawnmowers.',
      activeToday: '12 items lent this week',
      icon: '🛠️',
    },
  ];

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reqData, metricData] = await Promise.all([
        getFavorRequests({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
        }),
        getCommunityMetrics(),
      ]);

      setRequests(reqData);
      setMetrics(metricData);
    } catch (err: any) {
      setError(err.message || 'Failed to load community feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsAiSearching(true);
    searchFavorRequests(searchQuery)
      .then((res) => {
        setRequests(res);
      })
      .catch((err) => {
        console.error('Search error:', err);
      })
      .finally(() => {
        setIsAiSearching(false);
      });
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
              <span>Good morning, {user?.name || 'Priya'}! ☀️ Sector 62 Circle is active</span>
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
                    placeholder="Search for help (e.g., drill, math tutor, dog walking)..."
                    className="w-full pl-12 pr-28 py-3.5 bg-[#FBFAF7] text-[#2F2F2F] rounded-full text-xs sm:text-sm font-semibold placeholder:text-slate-400 border border-[#E6DFD3] focus:outline-hidden focus:border-[#C96C4A] shadow-2xs"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 px-4 py-2 bg-[#C96C4A] hover:bg-[#b25b3a] text-white text-xs font-extrabold rounded-full transition shadow-2xs"
                  >
                    {isAiSearching ? 'Scanning...' : 'Search'}
                  </button>
                </div>
              </form>
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
            onClick={() => setSelectedCategory('All')}
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
              Trusted Neighbors in Sector 62
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Real people with active response times and mutual connections
            </p>
          </div>
          <Link to="/leaderboard" className="text-xs font-bold text-[#C96C4A] hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {trustedNeighbors.map((neighbor, idx) => (
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
                      <img
                        src={neighbor.avatar}
                        alt={neighbor.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-[#355E3B]"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
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
                      <div className="w-10 h-10 rounded-full bg-[#355E3B] text-white font-extrabold flex items-center justify-center text-xs shadow-2xs">
                        {req.requester?.name ? req.requester.name.charAt(0).toUpperCase() : 'N'}
                      </div>
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
                    <span>{req.locationName || 'Sector 62, Noida'}</span>
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

      {/* Community Groups & Local Clubs Cards */}
      <div className="space-y-4 pt-4 border-t border-[#E6DFD3]">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl font-extrabold text-[#2F2F2F] tracking-tight font-heading">
              Active Circle Groups
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Join local interest circles in Sector 62
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {communityGroups.map((grp, idx) => (
            <div
              key={idx}
              className="bg-[#F5F1E8] rounded-[2rem] p-5 border border-[#E6DFD3] shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{grp.icon}</span>
                  <span className="text-[10px] font-extrabold text-[#355E3B] bg-white px-2.5 py-1 rounded-full border border-[#E6DFD3]">
                    {grp.members} members
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-[#2F2F2F]">{grp.title}</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {grp.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E6DFD3] flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold text-slate-500">{grp.activeToday}</span>
                <button className="px-3 py-1 bg-white hover:bg-[#E6DFD3] text-[#2F2F2F] font-bold text-[11px] rounded-full border border-[#E6DFD3] transition">
                  Join Circle
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
