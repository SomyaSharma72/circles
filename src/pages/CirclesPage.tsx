import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCircles, joinCircle, leaveCircle } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import { useSocketContext } from '../context/SocketContext';
import { UserAvatar } from '../components/UserAvatar';
import { CircleIconBadge, CIRCLE_THEMES, getCircleTheme } from '../components/CircleIcons';
import { CreateCircleModal } from '../components/circles/CreateCircleModal';
import {
  Users,
  PlusCircle,
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Globe,
  MessageSquare,
  Compass,
} from 'lucide-react';

export const CirclesPage: React.FC = () => {
  const { user } = useAuth();
  const { location } = useLocationContext();
  const { socket } = useSocketContext();
  const navigate = useNavigate();

  const [circles, setCircles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [joiningCircleId, setJoiningCircleId] = useState<string | null>(null);

  const fetchCirclesList = async () => {
    try {
      setIsLoading(true);
      const data = await getCircles({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        query: searchQuery || undefined,
      });
      setCircles(data || []);
    } catch (err) {
      console.warn('Failed to load circles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCirclesList();
  }, [selectedCategory]);

  // Listen to real-time socket events for circles
  useEffect(() => {
    if (!socket) return;

    const handleCircleCreated = (newCircle: any) => {
      setCircles((prev) => [newCircle, ...prev.filter((c) => c._id !== newCircle._id)]);
    };

    const handleCircleDeleted = ({ circleId }: { circleId: string }) => {
      setCircles((prev) => prev.filter((c) => c._id !== circleId));
    };

    const handleMemberJoined = ({ circleId, user: joinedUser }: any) => {
      setCircles((prev) =>
        prev.map((c) => {
          if (c._id === circleId && joinedUser) {
            const hasMember = c.members?.some((m: any) =>
              typeof m === 'object' ? m._id === joinedUser.id || m._id === joinedUser._id : m === joinedUser.id
            );
            if (!hasMember) {
              return {
                ...c,
                members: [...(c.members || []), joinedUser],
              };
            }
          }
          return c;
        })
      );
    };

    socket.on('circle:created', handleCircleCreated);
    socket.on('group:created', handleCircleCreated);
    socket.on('circle:deleted', handleCircleDeleted);
    socket.on('group:deleted', handleCircleDeleted);
    socket.on('circle:member_joined', handleMemberJoined);
    socket.on('group:member_joined', handleMemberJoined);

    return () => {
      socket.off('circle:created', handleCircleCreated);
      socket.off('group:created', handleCircleCreated);
      socket.off('circle:deleted', handleCircleDeleted);
      socket.off('group:deleted', handleCircleDeleted);
      socket.off('circle:member_joined', handleMemberJoined);
      socket.off('group:member_joined', handleMemberJoined);
    };
  }, [socket]);

  const handleJoinToggle = async (e: React.MouseEvent, circle: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/auth');
      return;
    }

    const isMember = circle.members?.some((m: any) =>
      typeof m === 'object' ? m._id === user._id || m._id === user.id : m === user._id || m === user.id
    );

    setJoiningCircleId(circle._id);
    try {
      if (isMember) {
        await leaveCircle(circle._id);
      } else {
        await joinCircle(circle._id);
      }
      await fetchCirclesList();
    } catch (err) {
      console.warn('Failed to update membership:', err);
    } finally {
      setJoiningCircleId(null);
    }
  };

  const filteredCircles = useMemo(() => {
    return circles.filter((c) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q);
      const matchNeighborhood = c.neighborhood?.toLowerCase().includes(q);
      const matchCategory = c.category?.toLowerCase().includes(q);
      return matchName || matchDesc || matchNeighborhood || matchCategory;
    });
  }, [circles, searchQuery]);

  const joinedCirclesCount = useMemo(() => {
    if (!user) return 0;
    return circles.filter((c) =>
      c.members?.some((m: any) =>
        typeof m === 'object' ? m._id === user._id || m._id === user.id : m === user._id || m === user.id
      )
    ).length;
  }, [circles, user]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <CreateCircleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCircleCreated={(newCircle) => {
          setCircles((prev) => [newCircle, ...prev]);
          navigate(`/circles/${newCircle._id}`);
        }}
      />

      {/* Top Banner & Stats Overview */}
      <div className="bg-white rounded-3xl p-6 border border-[#E6DFD3] shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 shadow-2xs">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#2F2F2F] font-heading">
                  Active Circle Groups
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200">
                  {circles.length} Circles Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#C96C4A]" />
                <span>{location.neighborhood || 'Local Neighborhood'} & Connected Neighborhoods</span>
                <span>•</span>
                <span>Real-time local communities</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/area-scan"
              className="px-4 py-2.5 bg-[#F5F1E8] hover:bg-[#EAE4D9] text-[#2F2F2F] text-xs font-bold rounded-2xl border border-[#E6DFD3] transition flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#355E3B]" />
              <span>View Map</span>
            </Link>

            <button
              onClick={() => {
                if (!user) {
                  navigate('/auth');
                  return;
                }
                setIsCreateModalOpen(true);
              }}
              className="px-5 py-2.5 bg-[#355E3B] hover:bg-[#2A4B2F] text-white text-xs font-bold rounded-2xl transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create a Circle</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E6DFD3]">
          <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E6DFD3] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#355E3B] flex items-center justify-center font-extrabold text-sm">
              {circles.length}
            </div>
            <div>
              <div className="text-xs font-bold text-[#2F2F2F]">Total Active Circles</div>
              <div className="text-[11px] text-slate-500">Across local zones</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E6DFD3] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-sm">
              {joinedCirclesCount}
            </div>
            <div>
              <div className="text-xs font-bold text-[#2F2F2F]">Your Joined Circles</div>
              <div className="text-[11px] text-slate-500">Direct group access</div>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E6DFD3] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-extrabold text-sm">
              100%
            </div>
            <div>
              <div className="text-xs font-bold text-[#2F2F2F]">Verified Neighbors</div>
              <div className="text-[11px] text-slate-500">Safe, non-commercial</div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Navigation */}
        <div className="space-y-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search circles by name, skill, neighborhood, or topic..."
              className="w-full pl-11 pr-4 py-3 bg-[#FDFBF7] border border-[#E6DFD3] rounded-2xl text-xs font-semibold text-[#2F2F2F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#355E3B]"
            />
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                selectedCategory === 'All'
                  ? 'bg-[#2F2F2F] text-white shadow-2xs'
                  : 'bg-[#F5F1E8] text-slate-700 hover:bg-[#EAE4D9] border border-[#E6DFD3]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>All Circles ({circles.length})</span>
            </button>

            {Object.entries(CIRCLE_THEMES).map(([key, theme]) => {
              const Icon = theme.icon;
              const isSelected = selectedCategory === theme.name;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(isSelected ? 'All' : theme.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-[#F5F1E8] text-slate-700 hover:bg-[#EAE4D9] border border-[#E6DFD3]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{theme.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Circle Groups Grid */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E6DFD3]">
          <div className="w-8 h-8 border-3 border-[#355E3B] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-xs font-bold text-slate-500">Loading active circles in your neighborhood...</div>
        </div>
      ) : filteredCircles.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E6DFD3] space-y-4">
          <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-[#2F2F2F]">No circles found matching your search</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Be the first neighbor to start a new circle for gardening, tools, sports, or hobbies in your area!
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-[#355E3B] text-white text-xs font-bold rounded-2xl transition shadow-md"
          >
            Create This Circle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCircles.map((circle) => {
            const memberCount = Array.isArray(circle.members) ? circle.members.length : 1;
            const isMember = user
              ? circle.members?.some((m: any) =>
                  typeof m === 'object' ? m._id === user._id || m._id === user.id : m === user._id || m === user.id
                )
              : false;

            const creatorName =
              typeof circle.creator === 'object' ? circle.creator?.name : 'Neighbor Creator';
            const creatorId =
              typeof circle.creator === 'object' ? circle.creator?._id : circle.creator;

            return (
              <div
                key={circle._id}
                className="bg-white rounded-3xl p-5 border border-[#E6DFD3] hover:border-indigo-400/60 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  {/* Card Header with Illustrated Icon & Privacy */}
                  <div className="flex items-start justify-between gap-3">
                    <CircleIconBadge
                      iconKey={circle.icon}
                      category={circle.category}
                      size="md"
                    />

                    <div className="flex items-center gap-1.5">
                      {circle.privacy === 'Approval Required' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Approval
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Public
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Circle Title & Description */}
                  <div>
                    <h3 className="text-base font-extrabold text-[#2F2F2F] group-hover:text-indigo-900 transition leading-snug font-heading">
                      {circle.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1 leading-relaxed">
                      {circle.description || 'Neighborhood collaboration, sharing resources, and community meetups.'}
                    </p>
                  </div>

                  {/* Location & Members Count */}
                  <div className="space-y-1.5 pt-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-[#C96C4A] shrink-0" />
                      <span className="truncate">{circle.neighborhood || 'Local Circle'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                        <Users className="w-3.5 h-3.5" />
                        <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                      </div>

                      {/* Creator default avatar */}
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <span>by</span>
                        <UserAvatar userId={creatorId} name={creatorName} size="xs" />
                        <span className="font-semibold text-slate-700 truncate max-w-[90px]">
                          {creatorName.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 mt-4 border-t border-[#E6DFD3] flex items-center gap-2">
                  <Link
                    to={`/circles/${circle._id}`}
                    className="flex-1 py-2.5 bg-[#F5F1E8] hover:bg-[#EAE4D9] text-[#2F2F2F] text-xs font-bold rounded-2xl border border-[#E6DFD3] transition text-center flex items-center justify-center gap-1.5"
                  >
                    <span>View Circle</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={(e) => handleJoinToggle(e, circle)}
                    disabled={joiningCircleId === circle._id}
                    className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                      isMember
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                        : 'bg-[#355E3B] text-white hover:bg-[#2A4B2F]'
                    }`}
                  >
                    {joiningCircleId === circle._id ? (
                      <span>Updating...</span>
                    ) : isMember ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Joined</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Join</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CirclesPage;
