import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getFavorRequests } from '../services/api';
import { FavorRequest } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useSocketContext } from '../context/SocketContext';
import { useLocationContext } from '../context/LocationContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  calculateDistanceInMeters,
  formatDistance,
  Coordinates,
} from '../utils/location';
import {
  MapPin,
  Compass,
  ArrowRight,
  ShieldCheck,
  Navigation,
  Sparkles,
  Users,
  GraduationCap,
  Wrench,
  Star,
  MessageSquare,
  X,
  Crosshair,
  Clock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface NeighborPin {
  id: string;
  userId: string;
  requestId?: string;
  name: string;
  skillDomain: string;
  category: string;
  color: string;
  rating: number;
  trustScore: number;
  avatar: string;
  lat: number;
  lng: number;
  neighborhood: string;
  activeStatus: string;
  x: number;
  y: number;
}

export const AreaScanPage: React.FC = () => {
  const { location, refreshLocation, isDetecting } = useLocationContext();
  const [radiusMiles, setRadiusMiles] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All');

  // Base Neighbor Pin templates positioned relative to user's current live location
  const basePins: NeighborPin[] = useMemo(() => [
    {
      id: 'pin_priya',
      userId: 'user_priya_1',
      requestId: 'req_jumpstart_101',
      name: 'Priya Sharma',
      skillDomain: 'Childcare & Tools',
      category: 'Childcare',
      color: 'bg-[#355E3B]',
      rating: 4.9,
      trustScore: 98,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      lat: location.lat + 0.0012,
      lng: location.lng + 0.0008,
      neighborhood: location.neighborhood || 'Local Circle',
      activeStatus: 'Online now',
      x: -120,
      y: -80,
    },
    {
      id: 'pin_aarav',
      userId: 'user_aarav_2',
      requestId: 'req_jumpstart_101',
      name: 'Aarav Patel',
      skillDomain: 'Hardware & Drill',
      category: 'Repairs',
      color: 'bg-[#C96C4A]',
      rating: 4.8,
      trustScore: 95,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      lat: location.lat + 0.0028,
      lng: location.lng + 0.0021,
      neighborhood: location.neighborhood ? `${location.neighborhood} North` : 'Nearby Circle',
      activeStatus: 'Active 5m ago',
      x: 110,
      y: -95,
    },
    {
      id: 'pin_rohan',
      userId: 'user_rohan_3',
      requestId: 'req_ladder_102',
      name: 'Rohan Gupta',
      skillDomain: 'Heavy Lifting & Dog Walk',
      category: 'Repairs',
      color: 'bg-[#C96C4A]',
      rating: 4.7,
      trustScore: 92,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      lat: location.lat - 0.0031,
      lng: location.lng + 0.0035,
      neighborhood: location.neighborhood ? `${location.neighborhood} East` : 'East Block',
      activeStatus: 'Active 12m ago',
      x: 130,
      y: 85,
    },
    {
      id: 'pin_ananya',
      userId: 'user_ananya_4',
      requestId: 'req_dogwalk_103',
      name: 'Ananya Iyer',
      skillDomain: 'Wi-Fi Setup & Baking',
      category: 'Tutoring',
      color: 'bg-[#6E8B5B]',
      rating: 4.9,
      trustScore: 99,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      lat: location.lat - 0.0018,
      lng: location.lng - 0.0015,
      neighborhood: location.neighborhood ? `${location.neighborhood} South` : 'South Block',
      activeStatus: 'Online now',
      x: -100,
      y: 110,
    },
    {
      id: 'pin_vikram',
      userId: 'user_vikram_5',
      requestId: 'req_jumpstart_101',
      name: 'Vikram Malhotra',
      skillDomain: 'Childcare & Sports',
      category: 'Childcare',
      color: 'bg-[#355E3B]',
      rating: 4.9,
      trustScore: 96,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
      lat: location.lat + 0.0045,
      lng: location.lng - 0.0012,
      neighborhood: location.neighborhood ? `${location.neighborhood} West` : 'West Block',
      activeStatus: 'Active 20m ago',
      x: 10,
      y: -145,
    },
    {
      id: 'pin_meera',
      userId: 'user_meera_6',
      requestId: 'req_ladder_102',
      name: 'Meera Kapoor',
      skillDomain: 'Math & Physics Tutor',
      category: 'Tutoring',
      color: 'bg-[#6E8B5B]',
      rating: 4.8,
      trustScore: 97,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      lat: location.lat - 0.0042,
      lng: location.lng - 0.0038,
      neighborhood: location.neighborhood ? `${location.neighborhood} Central` : 'Central Circle',
      activeStatus: 'Online now',
      x: 95,
      y: 155,
    },
  ], [location.lat, location.lng, location.neighborhood]);

  const [selectedCharacter, setSelectedCharacter] = useState<NeighborPin | null>(null);

  useEffect(() => {
    if (basePins.length > 0 && !selectedCharacter) {
      setSelectedCharacter(basePins[0]);
    }
  }, [basePins, selectedCharacter]);

  // Compute calculated distance string for each pin based on live coords
  const neighborPins = useMemo(() => {
    return basePins.map((pin) => {
      const meters = calculateDistanceInMeters(location.lat, location.lng, pin.lat, pin.lng);
      const distanceFormatted = formatDistance(meters);
      return {
        ...pin,
        distanceFormatted,
        meters,
      };
    });
  }, [basePins, location.lat, location.lng]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header Card with High Accuracy GPS status */}
      <div className="bg-white rounded-3xl p-5 border border-[#E6DFD3] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#C96C4A]" />
            <div>
              <h1 className="text-lg font-extrabold text-[#2F2F2F] font-heading">
                {location.neighborhood || 'Local Circle'} & Nearby Circles
              </h1>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <span>GPS Coords: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  {location.source === 'gps' ? 'High-Precision GPS' : 'Live Circle'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshLocation()}
              disabled={isDetecting}
              className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold rounded-full border border-orange-200 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isDetecting ? (
                <RefreshCw className="w-3.5 h-3.5 text-orange-500 animate-spin" />
              ) : (
                <Crosshair className="w-3.5 h-3.5 text-orange-500" />
              )}
              <span>{isDetecting ? 'Locating...' : 'Recalibrate GPS'}</span>
            </button>


            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200">
              {[1, 3, 5].map((m) => (
                <button
                  key={m}
                  onClick={() => setRadiusMiles(m)}
                  className={`px-3 py-0.5 text-xs font-bold rounded-full transition ${
                    radiusMiles === m ? 'bg-[#355E3B] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m} km
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-[#E6DFD3] pt-3">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeCategory === 'All'
                ? 'bg-[#2F2F2F] text-white shadow-2xs'
                : 'bg-[#F5F1E8] text-[#2F2F2F] border border-[#E6DFD3]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Domains</span>
          </button>

          <button
            onClick={() => setActiveCategory('Childcare')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeCategory === 'Childcare'
                ? 'bg-[#355E3B] text-white shadow-2xs'
                : 'bg-[#355E3B]/10 text-[#355E3B] hover:bg-[#355E3B]/20'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Childcare</span>
          </button>

          <button
            onClick={() => setActiveCategory('Tutoring')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeCategory === 'Tutoring'
                ? 'bg-[#6E8B5B] text-white shadow-2xs'
                : 'bg-[#6E8B5B]/10 text-[#6E8B5B] hover:bg-[#6E8B5B]/20'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Tutoring</span>
          </button>

          <button
            onClick={() => setActiveCategory('Repairs')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeCategory === 'Repairs'
                ? 'bg-[#C96C4A] text-white shadow-2xs'
                : 'bg-[#C96C4A]/10 text-[#C96C4A] hover:bg-[#C96C4A]/20'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Repairs</span>
          </button>
        </div>
      </div>

      {/* Map Graphic Canvas with Concentric Circles & Pins */}
      <div className="bg-[#FBFAF7] border border-[#E6DFD3] rounded-3xl p-6 md:p-10 relative overflow-hidden min-h-[500px] shadow-2xs flex items-center justify-center">
        {/* Dotted Grid Background */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#355E3B_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />

        {/* Concentric Distance Circles */}
        <div className="absolute w-[340px] h-[340px] md:w-[440px] md:h-[440px] rounded-full border border-[#355E3B]/20 pointer-events-none flex items-center justify-center">
          <div className="w-[240px] h-[240px] md:w-[300px] md:h-[300px] rounded-full border border-[#355E3B]/25 pointer-events-none flex items-center justify-center">
            <div className="w-[140px] h-[140px] md:w-[160px] md:h-[160px] rounded-full border border-[#355E3B]/30 pointer-events-none flex items-center justify-center">
              <div className="w-[70px] h-[70px] rounded-full border border-[#C96C4A]/40" />
            </div>
          </div>
        </div>

        {/* Center "You" Location Marker */}
        <div className="relative z-20 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-[#355E3B] text-white font-extrabold flex items-center justify-center border-2 border-white shadow-md">
            <Navigation className="w-5 h-5 fill-white" />
          </div>
          <span className="mt-1 px-3 py-0.5 bg-[#355E3B] text-white text-[10px] font-bold rounded-full shadow-2xs">
            You
          </span>
        </div>

        {/* Neighbor Pins on Map (NO MAP RECENTERING ON CLICK) */}
        {neighborPins
          .filter((p) => activeCategory === 'All' || p.category === activeCategory)
          .map((p) => {
            const isSelected = selectedCharacter?.id === p.id;
            return (
              <motion.div
                key={p.id}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCharacter(p);
                }}
                className={`absolute z-30 cursor-pointer flex flex-col items-center group transition-all duration-200 ${
                  isSelected ? 'z-40 scale-110' : ''
                }`}
              >
                {/* Skill Badge Pill */}
                <div
                  className={`px-2.5 py-0.5 ${p.color} text-white text-[10px] font-bold rounded-full shadow-2xs mb-1 whitespace-nowrap flex items-center gap-1`}
                >
                  <span>{p.skillDomain}</span>
                  <span className="text-[9px] opacity-80">• {p.distanceFormatted}</span>
                </div>

                {/* Character Photo Pin Ring */}
                <div
                  className={`w-11 h-11 rounded-full p-0.5 bg-white shadow-md border-2 transition-all ${
                    isSelected
                      ? 'ring-4 ring-orange-500 border-orange-500 scale-110 shadow-orange-500/20'
                      : 'border-[#355E3B] hover:border-orange-400'
                  }`}
                >
                  <img src={p.avatar} alt={p.name} className="w-full h-full rounded-full object-cover" />
                </div>
              </motion.div>
            );
          })}

        {/* Floating Side Panel / Bottom Sheet for Selected Character */}
        <AnimatePresence>
          {selectedCharacter && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-80 z-50 bg-white rounded-3xl p-5 border-2 border-orange-200 shadow-xl space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={selectedCharacter.avatar}
                      alt={selectedCharacter.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-[#355E3B] shadow-xs"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-[#2F2F2F] flex items-center gap-1.5">
                      <span>{selectedCharacter.name}</span>
                      <ShieldCheck className="w-4 h-4 text-[#355E3B]" />
                    </h3>
                    <p className="text-[11px] font-bold text-[#C96C4A] mt-0.5">
                      {selectedCharacter.skillDomain}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold mt-1">
                      <span className="flex items-center gap-0.5 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{selectedCharacter.rating}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full text-[10px]">
                        ★ {selectedCharacter.trustScore} Trust
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCharacter(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span className="flex items-center gap-1 text-[#355E3B] font-bold">
                    <MapPin className="w-3.5 h-3.5 text-[#C96C4A]" />
                    {selectedCharacter.distanceFormatted} ({selectedCharacter.neighborhood})
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    {selectedCharacter.activeStatus}
                  </span>
                </div>

                <Link
                  to={`/chats?user=${selectedCharacter.userId}&name=${encodeURIComponent(selectedCharacter.name)}&avatar=${encodeURIComponent(selectedCharacter.avatar)}`}
                  className="w-full py-2.5 bg-[#C96C4A] hover:bg-[#b05a3b] text-white font-extrabold text-xs rounded-2xl transition shadow-xs flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Connect & Chat Directly</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
