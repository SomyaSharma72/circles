import React from 'react';
import { motion } from 'motion/react';
import { useLocationContext } from '../context/LocationContext';

// Character 1: Neighbor walking a happy dog
export const CharacterDogWalker: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Background Circle */}
        <circle cx="60" cy="60" r="50" fill="#F5F1E8" />
        <circle cx="60" cy="60" r="46" stroke="#6E8B5B" strokeWidth="2" strokeDasharray="4 4" />

        {/* Human Character */}
        <g id="person">
          {/* Body */}
          <path d="M42 62C42 54 48 48 56 48C64 48 70 54 70 62V82H42V62Z" fill="#C96C4A" />
          {/* Head */}
          <circle cx="56" cy="38" r="12" fill="#E2A782" />
          {/* Hair */}
          <path d="M46 36C46 28 52 24 62 25C68 26 68 32 64 36C60 38 48 40 46 36Z" fill="#2F2F2F" />
          {/* Waving/Leash Arm */}
          <motion.path
            d="M68 56L82 66"
            stroke="#C96C4A"
            strokeWidth="5"
            strokeLinecap="round"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
          {/* Legs */}
          <path d="M48 82V100" stroke="#2F2F2F" strokeWidth="5" strokeLinecap="round" />
          <path d="M64 82V98" stroke="#2F2F2F" strokeWidth="5" strokeLinecap="round" />
        </g>

        {/* Leash */}
        <path d="M82 66 C 88 72, 90 78, 92 84" stroke="#6E8B5B" strokeWidth="2" strokeDasharray="2 2" />

        {/* Animated Dog */}
        <motion.g
          id="dog"
          animate={{ x: [0, 3, -2, 0], y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ellipse cx="94" cy="88" rx="10" ry="7" fill="#6E8B5B" />
          <circle cx="102" cy="82" r="5" fill="#6E8B5B" />
          {/* Tail */}
          <motion.path
            d="M84 86 C 80 82, 78 80, 80 76"
            stroke="#6E8B5B"
            strokeWidth="3"
            strokeLinecap="round"
            animate={{ rotate: [0, 15, -10, 0] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
          />
          {/* Paws */}
          <path d="M88 94V99M98 94V99" stroke="#2F2F2F" strokeWidth="2.5" strokeLinecap="round" />
        </motion.g>
      </svg>
    </div>
  );
};

// Character 2: Neighbors exchanging a ladder / tool
export const CharacterToolShare: React.FC<{ className?: string }> = ({ className = 'w-28 h-28' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Decorative Ring */}
        <circle cx="70" cy="60" r="54" stroke="#C96C4A" strokeWidth="2" strokeDasharray="6 6" />
        <circle cx="70" cy="60" r="48" fill="#FBFAF7" />

        {/* Person 1 (Giving tool) */}
        <g id="person1">
          <circle cx="38" cy="38" r="10" fill="#E2A782" />
          <path d="M28 34C28 26 34 24 44 26C48 30 40 38 28 34Z" fill="#355E3B" />
          <path d="M28 58C28 50 34 46 42 46C50 46 54 50 54 58V78H28V58Z" fill="#355E3B" />
          {/* Extended arm */}
          <path d="M48 54L68 58" stroke="#355E3B" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* Person 2 (Receiving) */}
        <g id="person2">
          <circle cx="102" cy="38" r="10" fill="#D89D77" />
          <path d="M96 32C98 24 108 24 112 30C110 38 100 38 96 32Z" fill="#C96C4A" />
          <path d="M90 58C90 50 96 46 104 46C112 46 116 50 116 58V78H90V58Z" fill="#6E8B5B" />
          {/* Extended arm */}
          <path d="M92 54L72 58" stroke="#6E8B5B" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* Animated Tool (Drill / Ladder) in center */}
        <motion.g
          id="item"
          animate={{ y: [0, -4, 0], rotate: [0, 3, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        >
          <rect x="64" y="52" width="16" height="12" rx="3" fill="#C96C4A" />
          <path d="M80 58H88" stroke="#2F2F2F" strokeWidth="3" strokeLinecap="round" />
          {/* Sparkle */}
          <circle cx="72" cy="46" r="2" fill="#E6AC00" />
        </motion.g>
      </svg>
    </div>
  );
};

// Character 3: Student being tutored / reading book together
export const CharacterTutoring: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="60" cy="60" r="52" fill="#F5F1E8" />
        <circle cx="60" cy="60" r="44" fill="#355E3B" opacity="0.1" />

        {/* Tutor & Student Head & Upper Body */}
        <circle cx="44" cy="42" r="11" fill="#E2A782" />
        <path d="M34 62C34 52 40 48 50 48C58 48 62 52 62 62V82H34V62Z" fill="#355E3B" />

        <circle cx="76" cy="48" r="9" fill="#D89D77" />
        <path d="M68 66C68 58 74 54 82 54C88 54 92 58 92 66V82H68V66Z" fill="#C96C4A" />

        {/* Animated Open Book */}
        <motion.g
          animate={{ scale: [1, 1.05, 1], y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        >
          <path d="M42 70 Q 60 66, 78 70 V 84 Q 60 80, 42 84 Z" fill="#FBFAF7" stroke="#2F2F2F" strokeWidth="2" />
          <line x1="60" y1="67" x2="60" y2="81" stroke="#355E3B" strokeWidth="2" />
        </motion.g>
      </svg>
    </div>
  );
};

// Character 4: Neighbor gardening / watering plants
export const CharacterGardener: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="60" cy="60" r="48" fill="#F5F1E8" />

        {/* Gardener */}
        <circle cx="48" cy="40" r="10" fill="#E2A782" />
        <path d="M38 58C38 50 44 46 54 46C62 46 66 50 66 58V80H38V58Z" fill="#6E8B5B" />

        {/* Watering Can */}
        <motion.g
          animate={{ rotate: [-5, 10, -5] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          style={{ transformOrigin: '60px 55px' }}
        >
          <path d="M64 54 H 80 V 68 H 64 Z" fill="#C96C4A" rx="2" />
          <path d="M80 58 L 94 50" stroke="#C96C4A" strokeWidth="3" strokeLinecap="round" />
        </motion.g>

        {/* Animated Water Droplets */}
        <motion.circle
          cx="96"
          cy="58"
          r="2"
          fill="#355E3B"
          animate={{ y: [0, 10, 20], opacity: [1, 0.8, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
        <motion.circle
          cx="92"
          cy="62"
          r="1.5"
          fill="#355E3B"
          animate={{ y: [0, 12, 22], opacity: [1, 0.8, 0] }}
          transition={{ repeat: Infinity, duration: 1, delay: 0.3 }}
        />

        {/* Plant */}
        <path d="M88 88 Q 94 76 98 88" stroke="#355E3B" strokeWidth="3" fill="none" />
        <ellipse cx="90" cy="80" rx="4" ry="2" fill="#355E3B" />
        <ellipse cx="96" cy="82" rx="4" ry="2" fill="#6E8B5B" />
      </svg>
    </div>
  );
};

// Character 5: Overlapping Circles Avatar Group
export const CircleAvatarStack: React.FC<{
  avatars?: string[];
  countText?: string;
}> = ({
  avatars = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
  ],
  countText,
}) => {
  const { location } = useLocationContext();
  const displayCount = countText || `+42 active in ${location.neighborhood || 'your circle'}`;

  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex -space-x-3 overflow-hidden">
        {avatars.map((url, idx) => (
          <motion.img
            key={idx}
            whileHover={{ y: -3, scale: 1.1 }}
            src={url}
            alt="Neighbor"
            className="inline-block h-8 w-8 rounded-full ring-2 ring-[#FBFAF7] object-cover shadow-2xs cursor-pointer"
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-[#2F2F2F]/80 tracking-tight">
        {displayCount}
      </span>
    </div>
  );
};

