import React from 'react';
import { motion } from 'motion/react';

// Character 1: Plant Care & Gardener Neighbor (Blinking, swaying plant, breathing)
export const GardenerCharacter: React.FC<{ className?: string; isPeeking?: boolean }> = ({
  className = 'w-24 h-28',
  isPeeking = false,
}) => (
  <motion.div
    className={`relative select-none ${className}`}
    animate={
      isPeeking
        ? { y: [0, -5, 0], rotate: [-1, 2, -1] }
        : { y: [0, -3, 0], rotate: [0, 1, 0] }
    }
    transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut' }}
  >
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Body / Overall Apron with subtle breathing */}
      <motion.g
        animate={{ scaleY: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
        style={{ transformOrigin: '50px 105px' }}
      >
        <path d="M30 65 C30 52 40 46 50 46 C60 46 70 52 70 65 L72 105 H28 L30 65 Z" fill="#6E8B5B" />
        {/* Shirt sleeves */}
        <path d="M24 60 C24 50 32 46 40 46" stroke="#FBFAF7" strokeWidth="6" strokeLinecap="round" />
        <path d="M76 60 C76 50 68 46 60 46" stroke="#FBFAF7" strokeWidth="6" strokeLinecap="round" />
        {/* Apron Pocket */}
        <path d="M40 76 H60 V90 C60 93 57 96 54 96 H46 C43 96 40 93 40 90 V76 Z" fill="#52794A" opacity="0.8" />
        <line x1="48" y1="76" x2="48" y2="86" stroke="#FBFAF7" strokeWidth="1" strokeDasharray="1 1" />
      </motion.g>

      {/* Head with gentle tilt */}
      <motion.g
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        style={{ transformOrigin: '50px 40px' }}
      >
        <circle cx="50" cy="32" r="14" fill="#E8B490" />
        {/* Hair / Bun */}
        <path d="M36 28 C36 18 44 14 54 15 C64 16 66 24 64 30 C60 32 42 32 36 28 Z" fill="#42281D" />
        <circle cx="58" cy="14" r="6" fill="#42281D" />

        {/* Blinking Smiling Eyes */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ repeat: Infinity, duration: 4, times: [0, 0.85, 0.88, 0.91, 1] }}
          style={{ transformOrigin: '50px 33px' }}
        >
          <path d="M43 32 Q46 35 49 32" stroke="#2F2F2F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M53 32 Q56 35 59 32" stroke="#2F2F2F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </motion.g>

        {/* Rosy Cheeks */}
        <circle cx="42" cy="36" r="2" fill="#E58B75" opacity="0.6" />
        <circle cx="60" cy="36" r="2" fill="#E58B75" opacity="0.6" />
      </motion.g>

      {/* Potted Plant in Arms with Swaying Leaves */}
      <g transform="translate(32, 54)">
        {/* Pot */}
        <path d="M8 26 L12 48 H24 L28 26 Z" fill="#C96C4A" />
        <rect x="6" y="22" width="24" height="5" rx="2.5" fill="#B35B3B" />
        {/* Animated Swaying Monstera / Basil Leaves */}
        <motion.path
          d="M18 22 C14 10 6 12 4 4 C14 6 16 16 18 22 Z"
          fill="#355E3B"
          animate={{ rotate: [-6, 7, -6] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
          style={{ transformOrigin: '18px 22px' }}
        />
        <motion.path
          d="M18 22 C22 12 30 14 32 6 C24 8 20 16 18 22 Z"
          fill="#52794A"
          animate={{ rotate: [5, -6, 5] }}
          transition={{ repeat: Infinity, duration: 3.1, ease: 'easeInOut' }}
          style={{ transformOrigin: '18px 22px' }}
        />
        <circle cx="18" cy="9" r="3.5" fill="#84A972" />
      </g>
    </svg>
  </motion.div>
);

// Character 2: Parent with Toddler & Balloon (Waving arm, blinking eyes, bobbing balloon)
export const ParentChildCharacter: React.FC<{ className?: string; isPeeking?: boolean }> = ({
  className = 'w-28 h-32',
  isPeeking = false,
}) => (
  <motion.div
    className={`relative select-none ${className}`}
    animate={
      isPeeking
        ? { y: [0, -4, 0] }
        : { y: [0, -3, 0] }
    }
    transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
  >
    <svg viewBox="0 0 120 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Floating Animated Balloon */}
      <motion.g
        animate={{ y: [-4, 5, -4], rotate: [-3, 4, -3] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        style={{ transformOrigin: '25px 35px' }}
      >
        <path d="M25 42 Q 22 58 35 72" stroke="#C96C4A" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
        <ellipse cx="22" cy="24" rx="14" ry="18" fill="#C96C4A" />
        <path d="M20 41 L24 41 L22 44 Z" fill="#B35B3B" />
        {/* Reflection */}
        <ellipse cx="17" cy="18" rx="3" ry="6" fill="#FBFAF7" opacity="0.5" />
      </motion.g>

      {/* Parent Body */}
      <path d="M48 68 C48 54 58 48 70 48 C82 48 92 54 92 68 L94 110 H46 L48 68 Z" fill="#355E3B" />

      {/* Parent Head & Glasses */}
      <g>
        <circle cx="70" cy="34" r="14" fill="#E2A782" />
        {/* Hair (Short Wave) */}
        <path d="M56 30 C56 20 64 16 74 16 C84 16 86 24 84 32 C78 30 64 34 56 30 Z" fill="#242424" />
        {/* Glasses */}
        <circle cx="65" cy="34" r="4.5" stroke="#2F2F2F" strokeWidth="1.5" fill="none" />
        <circle cx="75" cy="34" r="4.5" stroke="#2F2F2F" strokeWidth="1.5" fill="none" />
        <line x1="69.5" y1="34" x2="70.5" y2="34" stroke="#2F2F2F" strokeWidth="1.5" />
        {/* Blinking eyes behind glasses */}
        <motion.circle
          cx="65"
          cy="34"
          r="1.5"
          fill="#2F2F2F"
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ repeat: Infinity, duration: 3.8, times: [0, 0.82, 0.85, 0.88, 1] }}
        />
        <motion.circle
          cx="75"
          cy="34"
          r="1.5"
          fill="#2F2F2F"
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ repeat: Infinity, duration: 3.8, times: [0, 0.82, 0.85, 0.88, 1] }}
        />
      </g>

      {/* Toddler with Waving Hand */}
      <g transform="translate(18, 55)">
        <path d="M12 32 C12 24 18 20 25 20 C32 20 38 24 38 32 L39 55 H11 L12 32 Z" fill="#C96C4A" />
        <circle cx="25" cy="12" r="9" fill="#F0C2A2" />
        {/* Toddler Cap */}
        <path d="M16 10 Q25 4 34 10 L36 12 L14 12 Z" fill="#FBFAF7" />
        {/* Toddler Face & Happy Eyes */}
        <circle cx="23" cy="12" r="1" fill="#2F2F2F" />
        <circle cx="28" cy="12" r="1" fill="#2F2F2F" />
        <circle cx="21" cy="14" r="1.5" fill="#E58B75" opacity="0.6" />
        <circle cx="29" cy="14" r="1.5" fill="#E58B75" opacity="0.6" />
        {/* Toddler Waving Arm */}
        <motion.path
          d="M14 26 L4 16"
          stroke="#F0C2A2"
          strokeWidth="4"
          strokeLinecap="round"
          animate={{ rotate: [0, 22, -8, 22, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          style={{ transformOrigin: '14px 26px' }}
        />
      </g>
    </svg>
  </motion.div>
);

// Character 3: DIY & Toolbox Neighbor (Beanie, swaying toolbox, shining wrench)
export const ToolCrafterCharacter: React.FC<{ className?: string; isPeeking?: boolean }> = ({
  className = 'w-24 h-28',
  isPeeking = false,
}) => (
  <motion.div
    className={`relative select-none ${className}`}
    animate={
      isPeeking
        ? { y: [0, -5, 0], rotate: [1, -2, 1] }
        : { y: [0, -3, 0] }
    }
    transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
  >
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Body / Denim Shirt */}
      <path d="M28 66 C28 54 38 48 50 48 C62 48 72 54 72 66 L74 106 H26 L28 66 Z" fill="#C96C4A" />
      <path d="M42 48 L50 64 L58 48" stroke="#FBFAF7" strokeWidth="2" fill="none" />

      {/* Head */}
      <circle cx="50" cy="32" r="14" fill="#E2A782" />
      {/* Beanie Hat */}
      <path d="M34 26 C34 14 44 12 52 12 C60 12 68 15 68 26 Z" fill="#355E3B" />
      <rect x="33" y="24" width="36" height="5" rx="2.5" fill="#294A2E" />

      {/* Friendly Blinking Face */}
      <motion.g
        animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{ repeat: Infinity, duration: 4.2, times: [0, 0.78, 0.81, 0.84, 1] }}
        style={{ transformOrigin: '50px 32px' }}
      >
        <circle cx="45" cy="32" r="1.5" fill="#2F2F2F" />
        <circle cx="55" cy="32" r="1.5" fill="#2F2F2F" />
      </motion.g>
      <path d="M47 38 Q50 41 53 38" stroke="#2F2F2F" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Arm holding Toolbox */}
      <path d="M68 58 L78 74" stroke="#E2A782" strokeWidth="5" strokeLinecap="round" />

      {/* Animated Toolbox with Wrench */}
      <motion.g
        transform="translate(64, 70)"
        animate={{ rotate: [-4, 5, -4] }}
        transition={{ repeat: Infinity, duration: 2.3, ease: 'easeInOut' }}
        style={{ transformOrigin: '10px 0px' }}
      >
        <rect x="0" y="6" width="24" height="16" rx="3" fill="#2F2F2F" />
        <rect x="8" y="2" width="8" height="6" rx="2" stroke="#6E8B5B" strokeWidth="2" fill="none" />
        <line x1="0" y1="12" x2="24" y2="12" stroke="#C96C4A" strokeWidth="2" />
        {/* Wrench Top Peeking Out */}
        <motion.path
          d="M4 3 L2 -3 M1 -3 L5 -3"
          stroke="#E6AC00"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ scale: [1, 1.15, 1], rotate: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
        />
      </motion.g>
    </svg>
  </motion.div>
);

// Character 4: Dog Walker with Bouncing Dog (Curly hair, wagging tail, moving paws)
export const DogWalkerCharacter: React.FC<{ className?: string; isPeeking?: boolean }> = ({
  className = 'w-32 h-32',
  isPeeking = false,
}) => (
  <motion.div
    className={`relative select-none ${className}`}
    animate={
      isPeeking
        ? { y: [0, -4, 0] }
        : { y: [0, -2.5, 0] }
    }
    transition={{ repeat: Infinity, duration: 2.7, ease: 'easeInOut' }}
  >
    <svg viewBox="0 0 140 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Walker Body */}
      <path d="M38 65 C38 52 48 46 60 46 C72 46 80 52 80 65 L82 108 H36 L38 65 Z" fill="#6E8B5B" />
      {/* Head */}
      <circle cx="60" cy="32" r="13" fill="#D89D77" />
      {/* Curly Hair */}
      <path d="M47 30 C45 20 53 16 63 16 C73 16 75 22 74 30 C70 34 50 34 47 30 Z" fill="#3D2619" />
      <circle cx="47" cy="24" r="4" fill="#3D2619" />
      <circle cx="73" cy="25" r="4" fill="#3D2619" />

      {/* Leash line with dynamic tension */}
      <motion.path
        d="M72 65 Q 90 75 98 86"
        stroke="#C96C4A"
        strokeWidth="2"
        strokeDasharray="3 3"
        fill="none"
        animate={{ d: ['M72 65 Q 90 73 98 86', 'M72 65 Q 90 78 98 86', 'M72 65 Q 90 73 98 86'] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
      />

      {/* Dog with Wagging Tail & Animated Head */}
      <g transform="translate(90, 72)">
        <ellipse cx="22" cy="20" rx="16" ry="11" fill="#C96C4A" />
        <motion.g
          animate={{ rotate: [-3, 4, -3] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          style={{ transformOrigin: '34px 14px' }}
        >
          <circle cx="34" cy="14" r="9" fill="#C96C4A" />
          {/* Floppy Ear */}
          <path d="M32 9 Q30 20 37 18 Z" fill="#42281D" />
          <circle cx="38" cy="13" r="1.5" fill="#2F2F2F" />
          <circle cx="42" cy="15" r="2" fill="#2F2F2F" />
        </motion.g>
        {/* Wagging Tail */}
        <motion.path
          d="M8 18 Q-2 10 2 2"
          stroke="#C96C4A"
          strokeWidth="3.5"
          strokeLinecap="round"
          animate={{ rotate: [-22, 25, -22] }}
          transition={{ repeat: Infinity, duration: 0.45, ease: 'easeInOut' }}
          style={{ transformOrigin: '8px 18px' }}
        />
        {/* Legs */}
        <line x1="14" y1="28" x2="14" y2="38" stroke="#B35B3B" strokeWidth="3" strokeLinecap="round" />
        <line x1="28" y1="28" x2="28" y2="38" stroke="#B35B3B" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  </motion.div>
);

// Character 5: Fitness & Cyclist Neighbor (Helmet, spinning spokes, pedal crank)
export const CyclistFitnessCharacter: React.FC<{ className?: string; isPeeking?: boolean }> = ({
  className = 'w-28 h-32',
  isPeeking = false,
}) => (
  <motion.div
    className={`relative select-none ${className}`}
    animate={
      isPeeking
        ? { y: [0, -5, 0] }
        : { y: [0, -3, 0] }
    }
    transition={{ repeat: Infinity, duration: 3.3, ease: 'easeInOut' }}
  >
    <svg viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Cyclist Figure */}
      <path d="M45 64 C45 52 54 46 64 46 C74 46 82 52 82 64 L84 105 H42 L45 64 Z" fill="#355E3B" />
      {/* Head */}
      <circle cx="64" cy="30" r="13" fill="#F0C2A2" />
      {/* Cycling Helmet */}
      <path d="M48 26 C48 15 56 12 66 12 C76 12 82 17 82 26 L48 26 Z" fill="#C96C4A" />
      <line x1="56" y1="16" x2="56" y2="24" stroke="#FBFAF7" strokeWidth="2" />
      <line x1="68" y1="16" x2="68" y2="24" stroke="#FBFAF7" strokeWidth="2" />
      {/* Blinking eyes */}
      <motion.g
        animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{ repeat: Infinity, duration: 4.5, times: [0, 0.8, 0.83, 0.86, 1] }}
        style={{ transformOrigin: '64px 31px' }}
      >
        <circle cx="60" cy="31" r="1.5" fill="#2F2F2F" />
        <circle cx="68" cy="31" r="1.5" fill="#2F2F2F" />
      </motion.g>

      {/* Bicycle Wheel & Frame beside */}
      <g transform="translate(15, 68)">
        {/* Wheel with spinning spokes */}
        <circle cx="24" cy="30" r="20" stroke="#2F2F2F" strokeWidth="2.5" fill="none" />
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          style={{ transformOrigin: '24px 30px' }}
        >
          <line x1="24" y1="10" x2="24" y2="50" stroke="#E6DFD3" strokeWidth="1" />
          <line x1="4" y1="30" x2="44" y2="30" stroke="#E6DFD3" strokeWidth="1" />
          <line x1="10" y1="16" x2="38" y2="44" stroke="#E6DFD3" strokeWidth="1" />
          <line x1="10" y1="44" x2="38" y2="16" stroke="#E6DFD3" strokeWidth="1" />
        </motion.g>
        <circle cx="24" cy="30" r="4" fill="#C96C4A" />
        {/* Frame bar */}
        <line x1="24" y1="30" x2="52" y2="15" stroke="#355E3B" strokeWidth="3" strokeLinecap="round" />
        <line x1="52" y1="15" x2="56" y2="0" stroke="#2F2F2F" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  </motion.div>
);

// Center Invitation Crest / Wax Seal Illustration for Scratch Foil
export const InvitationWaxSeal: React.FC<{ className?: string }> = ({
  className = 'w-24 h-24',
}) => (
  <motion.div
    className={`relative select-none ${className}`}
    animate={{ y: [-3, 3, -3], rotate: [-1, 1, -1] }}
    transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
  >
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Decorative Ribbon Tails */}
      <path d="M38 70 L28 92 L42 86 L48 92 L44 72 Z" fill="#B35B3B" />
      <path d="M62 70 L72 92 L58 86 L52 92 L56 72 Z" fill="#9E4D30" />

      {/* Wax Outer Wavy Seal */}
      <path
        d="M50 8 C60 8 68 12 76 18 C84 24 88 32 90 42 C92 52 88 62 82 70 C76 78 68 84 58 86 C48 88 38 86 30 80 C22 74 16 66 14 56 C12 46 16 36 22 28 C28 20 38 12 50 8 Z"
        fill="#C96C4A"
        className="filter drop-shadow-sm"
      />
      <circle cx="50" cy="48" r="32" fill="#D37957" />
      <circle cx="50" cy="48" r="28" stroke="#FBFAF7" strokeWidth="1.5" strokeDasharray="3 2" fill="none" opacity="0.8" />

      {/* Center Heart / Community Tree Emblem */}
      <path
        d="M50 35 C52 30 58 30 60 34 C63 40 50 50 50 50 C50 50 37 40 40 34 C42 30 48 30 50 35 Z"
        fill="#FBFAF7"
      />
      {/* Sprouting Leaves over Seal */}
      <circle cx="50" cy="56" r="3" fill="#FBFAF7" />
      <path d="M47 58 C42 56 40 52 42 48" stroke="#FBFAF7" strokeWidth="2" strokeLinecap="round" />
      <path d="M53 58 C58 56 60 52 58 48" stroke="#FBFAF7" strokeWidth="2" strokeLinecap="round" />

      {/* Animated Shine Glint */}
      <motion.circle
        cx="34"
        cy="32"
        r="4"
        fill="#FBFAF7"
        opacity="0.8"
        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
      />
    </svg>
  </motion.div>
);

// Miniature Neighborhood Background Scene with Little Houses, Trees & Path
export const MiniNeighborhoodBackdrop: React.FC<{ className?: string }> = ({
  className = 'w-full h-44',
}) => (
  <div className={`absolute bottom-0 inset-x-0 overflow-hidden pointer-events-none ${className}`}>
    <svg viewBox="0 0 1000 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full preserve-3d">
      {/* Soft Rolling Hills */}
      <path d="M0 160 Q 250 110 500 145 T 1000 135 L 1000 180 L 0 180 Z" fill="#EDE7DA" opacity="0.6" />
      <path d="M0 170 Q 300 135 600 160 T 1000 150 L 1000 180 L 0 180 Z" fill="#E4DBC8" opacity="0.7" />

      {/* House 1 (Left) */}
      <g transform="translate(90, 85)" opacity="0.45">
        <rect x="0" y="25" width="45" height="40" rx="3" fill="#D8CEBA" />
        <path d="M-5 25 L 22.5 0 L 50 25 Z" fill="#C96C4A" />
        <rect x="14" y="38" width="16" height="27" rx="2" fill="#355E3B" />
        <rect x="8" y="30" width="8" height="8" rx="1.5" fill="#FBFAF7" />
        <rect x="28" y="30" width="8" height="8" rx="1.5" fill="#FBFAF7" />
      </g>

      {/* Tree Left */}
      <g transform="translate(150, 75)" opacity="0.5">
        <rect x="18" y="45" width="6" height="30" rx="2" fill="#785B43" />
        <circle cx="21" cy="35" r="22" fill="#6E8B5B" />
        <circle cx="14" cy="26" r="14" fill="#355E3B" />
      </g>

      {/* Distant Windmill Silhouette (Center Right) */}
      <g transform="translate(480, 95)" opacity="0.35">
        <path d="M10 50 L 18 10 L 26 50 Z" fill="#C9BFA8" />
        <circle cx="18" cy="12" r="3" fill="#355E3B" />
      </g>

      {/* House 2 (Right) */}
      <g transform="translate(820, 80)" opacity="0.45">
        <rect x="0" y="25" width="55" height="45" rx="3" fill="#D8CEBA" />
        <path d="M-6 25 L 27.5 -2 L 61 25 Z" fill="#355E3B" />
        <rect x="20" y="40" width="15" height="30" rx="2" fill="#C96C4A" />
        <rect x="8" y="30" width="9" height="9" rx="1.5" fill="#FBFAF7" />
        <rect x="38" y="30" width="9" height="9" rx="1.5" fill="#FBFAF7" />
      </g>

      {/* Tree Right */}
      <g transform="translate(770, 70)" opacity="0.5">
        <rect x="16" y="50" width="7" height="35" rx="2" fill="#785B43" />
        <ellipse cx="20" cy="35" rx="20" ry="26" fill="#52794A" />
      </g>

      {/* Curving Walking Cobblestone Trail */}
      <path
        d="M0 178 Q 280 162 500 172 T 1000 168"
        stroke="#DCCFB8"
        strokeWidth="10"
        strokeDasharray="4 8"
        fill="none"
        opacity="0.6"
      />
    </svg>
  </div>
);
