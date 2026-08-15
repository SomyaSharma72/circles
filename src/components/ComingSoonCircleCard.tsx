import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Users,
  Sprout,
  Wrench,
  Baby,
  Activity,
  Dog,
  Bell,
  CheckCircle2,
  RotateCcw,
  Compass,
} from 'lucide-react';
import {
  GardenerCharacter,
  ParentChildCharacter,
  ToolCrafterCharacter,
  DogWalkerCharacter,
  CyclistFitnessCharacter,
  MiniNeighborhoodBackdrop,
  InvitationWaxSeal,
} from './CommunityIllustrationScene';
import { useLocationContext } from '../context/LocationContext';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  type: 'confetti' | 'sparkle' | 'dust';
}

export const ComingSoonCircleCard: React.FC = () => {
  const { location } = useLocationContext();
  const [isRevealed, setIsRevealed] = useState(false);
  const [isNotified, setIsNotified] = useState(false);
  const [isBellRinging, setIsBellRinging] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [revealOrigin, setRevealOrigin] = useState({ x: 50, y: 50 });

  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, isHovering: false });

  const categories = [
    { label: 'Gardening & Plant Swaps', icon: Sprout, color: 'text-emerald-700', bg: 'bg-emerald-50/80', border: 'border-emerald-200/60' },
    { label: 'Tools & Hardware Library', icon: Wrench, color: 'text-amber-800', bg: 'bg-amber-50/80', border: 'border-amber-200/60' },
    { label: 'Parenting & Playgroups', icon: Baby, color: 'text-rose-700', bg: 'bg-rose-50/80', border: 'border-rose-200/60' },
    { label: 'Fitness & Cycling', icon: Activity, color: 'text-sky-800', bg: 'bg-sky-50/80', border: 'border-sky-200/60' },
    { label: 'Pets & Dog Walking', icon: Dog, color: 'text-orange-800', bg: 'bg-orange-50/80', border: 'border-orange-200/60' },
  ];

  // Mouse Parallax 3D tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y, isHovering: true });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0, isHovering: false });
  };

  // Scratch / Tap reveal with touch coordinates and paper fragment scattering
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isRevealed) return;

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;

      if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      const clickX = clientX ? clientX - rect.left : rect.width / 2;
      const clickY = clientY ? clientY - rect.top : rect.height / 2;

      setRevealOrigin({
        x: (clickX / rect.width) * 100,
        y: (clickY / rect.height) * 100,
      });

      // Spawn realistic paper fragments, golden glitter & dust
      const colors = ['#C96C4A', '#6E8B5B', '#355E3B', '#DCCFB8', '#E6AC00', '#F7F5EF', '#FBFAF7'];
      const newParticles: Particle[] = Array.from({ length: 32 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 32 + (Math.random() - 0.5);
        const speed = 60 + Math.random() * 120;
        const types: ('confetti' | 'sparkle' | 'dust')[] = ['confetti', 'sparkle', 'dust'];
        return {
          id: Date.now() + i,
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 35,
          size: Math.random() * 8 + 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          type: types[Math.floor(Math.random() * types.length)],
        };
      });
      setParticles(newParticles);
    }

    setIsRevealed(true);
  };

  const handleNotifyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBellRinging(true);
    setIsNotified(true);
    setShowToast(true);

    setTimeout(() => {
      setIsBellRinging(false);
    }, 900);

    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const handleResetScratch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRevealed(false);
    setParticles([]);
  };

  // Clean up particles after burst
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles([]);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  return (
    <div className="relative w-full">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 bg-[#2F2F2F] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md max-w-md w-[92%]"
          >
            <div className="w-8 h-8 rounded-full bg-[#355E3B] text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <span className="flex-1 leading-snug">
              You’ll be notified when Circle Groups launches in {location.neighborhood || 'your neighborhood'}.
            </span>
            <button
              onClick={() => setShowToast(false)}
              className="text-white/60 hover:text-white transition text-xs font-normal underline shrink-0"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interactive Invitation Card Container */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        onTouchEnd={handleCardClick}
        animate={{
          rotateX: mousePos.isHovering ? -mousePos.y * 4.5 : 0,
          rotateY: mousePos.isHovering ? mousePos.x * 4.5 : 0,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        style={{ transformStyle: 'preserve-3d' }}
        className={`relative overflow-hidden rounded-[28px] bg-[#F7F5EF] border border-[#E6DFD3] shadow-[0_10px_35px_-8px_rgba(47,47,47,0.08)] transition-all duration-300 ${
          !isRevealed
            ? 'cursor-pointer select-none hover:border-[#6E8B5B]/80 hover:shadow-[0_18px_45px_-10px_rgba(53,94,59,0.16)]'
            : ''
        }`}
      >
        {/* Paper Grain Background Texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.045] pointer-events-none">
          <filter id="invitation-card-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#invitation-card-noise)" />
        </svg>

        {/* Soft Ambient Inner Glow */}
        <div className="absolute inset-0 bg-radial-gradient from-white/40 via-transparent to-transparent pointer-events-none" />

        {/* Miniature Neighborhood Scene Background Layer */}
        <MiniNeighborhoodBackdrop className="opacity-95" />

        {/* Revealed Content Container */}
        <div className="relative z-10 p-6 sm:p-9 space-y-7">
          {/* Header & Status Pill */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#355E3B] text-[#FBFAF7] flex items-center justify-center shrink-0 shadow-md ring-4 ring-[#355E3B]/10">
                <Users className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2F2F2F] tracking-tight font-heading">
                    Active Circle Groups
                  </h3>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.85, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#355E3B]/10 text-[#355E3B] border border-[#355E3B]/25 text-[11px] font-extrabold rounded-full tracking-wider uppercase shadow-2xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#355E3B] animate-pulse" />
                    COMING SOON
                  </motion.span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-[#6E8B5B]">
                  Join local interest circles in {location.neighborhood || 'your area'}
                </p>
              </div>
            </div>

            {/* Top Right "Scratch Again" Button */}
            {isRevealed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleResetScratch}
                className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 border border-[#DCCFB8] text-[#2F2F2F] text-xs font-bold shadow-2xs hover:bg-[#EEE9DD] hover:border-[#355E3B]/40 transition"
                title="Cover card with foil again"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#355E3B]" />
                <span>Scratch again</span>
              </motion.button>
            )}
          </div>

          {/* Description */}
          <p className="text-slate-700 text-sm sm:text-base font-medium leading-relaxed max-w-2xl bg-white/40 p-4 rounded-2xl border border-[#E6DFD3]/70 backdrop-blur-xs">
            Connect with neighbors through local interest circles for tools, parenting, gardening, fitness, pets, and community activities.
          </p>

          {/* Micro-Circles Category Chips */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#355E3B]" />
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Neighborhood Interest Hubs
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {categories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <motion.div
                    key={cat.label}
                    initial={isRevealed ? { opacity: 0, y: 10, scale: 0.95 } : false}
                    animate={isRevealed ? { opacity: 1, y: 0, scale: 1 } : false}
                    transition={{ delay: 0.08 + idx * 0.05, duration: 0.25 }}
                    whileHover={{ y: -2, scale: 1.02 }}
                    className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl ${cat.bg} border ${cat.border} text-[#2F2F2F] text-xs sm:text-sm font-bold shadow-2xs transition-all`}
                  >
                    <div className="p-1 rounded-lg bg-white/90 shadow-2xs">
                      <Icon className={`w-4 h-4 ${cat.color}`} />
                    </div>
                    <span>{cat.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Living Community Scene with 5 Animated Illustrated Characters */}
          <div className="relative pt-6 pb-2 border-t border-[#E6DFD3]/80">
            <div className="flex items-end justify-around gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-2">
              {/* Character 1: Gardener */}
              <div className="flex flex-col items-center shrink-0">
                <GardenerCharacter className="w-20 sm:w-24 h-24 sm:h-28" />
                <span className="text-[10px] font-extrabold text-slate-500 bg-white/85 px-2 py-0.5 rounded-full border border-[#DCCFB8] shadow-2xs mt-1">
                  Plant Swaps
                </span>
              </div>

              {/* Character 2: Parent with Toddler */}
              <div className="flex flex-col items-center shrink-0">
                <ParentChildCharacter className="w-24 sm:w-28 h-26 sm:h-30" />
                <span className="text-[10px] font-extrabold text-slate-500 bg-white/85 px-2 py-0.5 rounded-full border border-[#DCCFB8] shadow-2xs mt-1">
                  Playgroups
                </span>
              </div>

              {/* Character 3: Tool Crafter */}
              <div className="flex flex-col items-center shrink-0">
                <ToolCrafterCharacter className="w-20 sm:w-24 h-24 sm:h-28" />
                <span className="text-[10px] font-extrabold text-slate-500 bg-white/85 px-2 py-0.5 rounded-full border border-[#DCCFB8] shadow-2xs mt-1">
                  Tool Library
                </span>
              </div>

              {/* Character 4: Dog Walker */}
              <div className="flex flex-col items-center shrink-0">
                <DogWalkerCharacter className="w-26 sm:w-30 h-24 sm:h-28" />
                <span className="text-[10px] font-extrabold text-slate-500 bg-white/85 px-2 py-0.5 rounded-full border border-[#DCCFB8] shadow-2xs mt-1">
                  Pet Care
                </span>
              </div>

              {/* Character 5: Cyclist */}
              <div className="flex flex-col items-center shrink-0">
                <CyclistFitnessCharacter className="w-24 sm:w-28 h-26 sm:h-30" />
                <span className="text-[10px] font-extrabold text-slate-500 bg-white/85 px-2 py-0.5 rounded-full border border-[#DCCFB8] shadow-2xs mt-1">
                  Cycling & Run
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer with Interactive "Notify Me" Pill */}
          <div className="pt-5 border-t border-[#E6DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-[#355E3B]" />
              <span>Launching soon in {location.neighborhood || 'your neighborhood'}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleNotifyClick}
              className={`inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full text-xs sm:text-sm font-extrabold shadow-md transition-all ${
                isNotified
                  ? 'bg-[#355E3B] text-white border border-[#355E3B]'
                  : 'bg-[#355E3B] hover:bg-[#2c4e31] text-white border border-[#355E3B]/30'
              }`}
            >
              <motion.div
                animate={isBellRinging ? { rotate: [-24, 24, -18, 18, -8, 8, 0] } : {}}
                transition={{ duration: 0.65 }}
              >
                {isNotified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </motion.div>
              <span>{isNotified ? "You're on the early list" : 'Notify Me'}</span>
            </motion.button>
          </div>
        </div>

        {/* Scratch-Off / Metallic Foil Invitation Overlay */}
        <AnimatePresence>
          {!isRevealed && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{
                opacity: 0,
                scale: 1.03,
                clipPath: `circle(0% at ${revealOrigin.x}% ${revealOrigin.y}%)`,
                transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
              }}
              style={{
                background:
                  'radial-gradient(ellipse at 50% 35%, #FAF7F0 0%, #EEE9DD 50%, #E2D7C3 100%)',
              }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-between p-6 sm:p-10 border border-[#DCCFB8] rounded-[28px] overflow-hidden shadow-[inset_0_2px_12px_rgba(255,255,255,0.8),inset_0_-4px_16px_rgba(70,55,40,0.08)]"
            >
              {/* Paper Texture & Brushed Metallic Smudge Overlay */}
              <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(#6E8B5B_1px,transparent_1px)] [background-size:12px_12px]" />
              <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[linear-gradient(45deg,#2F2F2F_25%,transparent_25%,transparent_50%,#2F2F2F_50%,#2F2F2F_75%,transparent_75%,transparent)] [background-size:6px_6px]" />

              {/* Shimmer Light Streak Moving Diagonally Across Foil */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ x: '-130%', y: '-60%' }}
                animate={{ x: '230%', y: '130%' }}
                transition={{
                  repeat: Infinity,
                  duration: 3.5,
                  ease: 'easeInOut',
                  repeatDelay: 1.6,
                }}
                style={{
                  background:
                    'linear-gradient(115deg, transparent 20%, rgba(255, 255, 255, 0.65) 50%, transparent 80%)',
                  transform: 'skewX(-20deg)',
                }}
              />

              {/* Peeking Characters along the Foil Card Edges */}
              {/* Top-Left: Gardener Peeking */}
              <div className="absolute -top-3 left-6 sm:left-12 pointer-events-none opacity-90 drop-shadow-xs">
                <GardenerCharacter className="w-16 sm:w-20 h-16 sm:h-20" isPeeking />
              </div>

              {/* Top-Right: Parent & Child Peeking */}
              <div className="absolute -top-2 right-6 sm:right-12 pointer-events-none opacity-90 drop-shadow-xs">
                <ParentChildCharacter className="w-18 sm:w-22 h-18 sm:h-22" isPeeking />
              </div>

              {/* Bottom-Left: Tool Crafter Peeking */}
              <div className="absolute -bottom-3 left-8 sm:left-16 pointer-events-none opacity-90 drop-shadow-xs">
                <ToolCrafterCharacter className="w-16 sm:w-20 h-16 sm:h-20" isPeeking />
              </div>

              {/* Bottom-Right: Dog Walker Peeking */}
              <div className="absolute -bottom-3 right-8 sm:right-16 pointer-events-none opacity-90 drop-shadow-xs">
                <DogWalkerCharacter className="w-20 sm:w-24 h-16 sm:h-20" isPeeking />
              </div>

              {/* Foil Stamped Decorative Border Frame */}
              <div className="absolute inset-3.5 sm:inset-5 rounded-[22px] border-2 border-dashed border-[#C9BFA8]/70 pointer-events-none" />

              {/* Center Scratch Invitation Wax Seal & Text */}
              <div className="my-auto relative z-20 flex flex-col items-center text-center space-y-4 max-w-md">
                {/* Handcrafted Invitation Wax Seal */}
                <InvitationWaxSeal className="w-20 h-20 sm:w-24 sm:h-24" />

                {/* Display Copy */}
                <div className="space-y-1.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-[#2F2F2F] tracking-tight font-heading block">
                    Tap to Reveal
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-[#6E8B5B]">
                    See the next neighborhood feature we’re building
                  </p>
                </div>

                {/* Subtle Community Invitation Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#DCCFB8] text-xs font-bold text-[#355E3B] shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#355E3B] animate-ping" />
                  <span>Exclusive Community Invitation</span>
                </div>
              </div>

              {/* Floating Ambient Sparkles */}
              <motion.div
                animate={{ y: [-4, 4, -4], opacity: [0.4, 0.9, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="absolute top-12 left-1/4 text-[#6E8B5B] pointer-events-none"
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              <motion.div
                animate={{ y: [4, -4, 4], opacity: [0.3, 0.8, 0.3] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0.5 }}
                className="absolute bottom-12 right-1/4 text-[#C96C4A] pointer-events-none"
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scratch Burst Confetti / Paper Particles Effect */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: p.x,
              y: p.y,
              scale: 1,
              opacity: 1,
              rotate: p.rotation,
            }}
            animate={{
              x: p.x + p.vx,
              y: p.y + p.vy,
              scale: 0,
              opacity: 0,
              rotate: p.rotation + (p.type === 'confetti' ? 260 : 90),
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`absolute z-40 pointer-events-none ${
              p.type === 'confetti' ? 'rounded-xs' : 'rounded-full'
            }`}
            style={{
              width: p.size,
              height: p.type === 'confetti' ? p.size * 1.5 : p.size,
              backgroundColor: p.color,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};
