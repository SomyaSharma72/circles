import React from 'react';
import { motion } from 'motion/react';

// Character 1: Tutoring & Studying Neighbor
export const StudentTutoringIllustration: React.FC<{ className?: string }> = ({ className = "w-32 h-32" }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Soft background circle */}
    <circle cx="100" cy="100" r="85" fill="#F5F1E8" />
    <circle cx="100" cy="100" r="75" stroke="#E6DFD3" strokeDasharray="6 6" strokeWidth="2" />

    {/* Table / Desk */}
    <rect x="35" y="145" width="130" height="12" rx="6" fill="#C96C4A" opacity="0.8" />

    {/* Tutor Body (Forest Green) */}
    <motion.path
      d="M50 145 C50 115 70 100 85 100 C100 100 120 115 120 145 Z"
      fill="#355E3B"
      animate={{ scaleY: [1, 1.02, 1] }}
      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
    />
    {/* Head */}
    <circle cx="85" cy="80" r="22" fill="#F8D7DA" />
    {/* Hair */}
    <path d="M63 80 C63 60 75 55 85 55 C95 55 107 60 107 80 C107 80 100 68 85 68 C70 68 63 80 63 80 Z" fill="#2F2F2F" />
    {/* Glasses */}
    <circle cx="78" cy="80" r="5" stroke="#2F2F2F" strokeWidth="2" fill="none" />
    <circle cx="92" cy="80" r="5" stroke="#2F2F2F" strokeWidth="2" fill="none" />
    <line x1="83" y1="80" x2="87" y2="80" stroke="#2F2F2F" strokeWidth="2" />
    {/* Waving Hand */}
    <motion.path
      d="M100 115 Q125 95 130 85"
      stroke="#F8D7DA"
      strokeWidth="7"
      strokeLinecap="round"
      animate={{ rotate: [0, 10, -5, 0] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      style={{ transformOrigin: '100px 115px' }}
    />

    {/* Student (Terracotta) */}
    <path d="M120 145 C120 125 135 115 145 115 C155 115 170 125 170 145 Z" fill="#C96C4A" />
    <circle cx="145" cy="98" r="16" fill="#FFE5D9" />
    <path d="M130 98 C130 84 140 80 145 80 C150 80 160 84 160 98 Z" fill="#6E8B5B" />

    {/* Open Book */}
    <rect x="80" y="132" width="40" height="20" rx="3" fill="#FBFAF7" stroke="#355E3B" strokeWidth="2" />
    <line x1="100" y1="132" x2="100" y2="152" stroke="#355E3B" strokeWidth="2" />

    {/* Floating Math Symbol Circle */}
    <motion.g
      animate={{ y: [-3, 3, -3] }}
      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
    >
      <circle cx="155" cy="55" r="14" fill="#6E8B5B" opacity="0.9" />
      <text x="155" y="60" textAnchor="middle" fill="#FBFAF7" fontSize="12" fontWeight="bold">∑</text>
    </motion.g>
  </svg>
);

// Character 2: Pet Sitting & Dog Walking Neighbor
export const DogWalkerIllustration: React.FC<{ className?: string }> = ({ className = "w-32 h-32" }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Soft background circle */}
    <circle cx="100" cy="100" r="85" fill="#F5F1E8" />
    <circle cx="100" cy="100" r="75" stroke="#E6DFD3" strokeDasharray="4 4" strokeWidth="2" />

    {/* Person Body (Olive Green) */}
    <motion.path
      d="M55 160 C55 120 75 110 90 110 C105 110 125 120 125 160 Z"
      fill="#6E8B5B"
      animate={{ y: [0, -2, 0] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
    />
    <circle cx="90" cy="85" r="20" fill="#FFE5D9" />
    {/* Cap */}
    <path d="M70 80 Q90 65 110 80 L115 85 L65 85 Z" fill="#C96C4A" />

    {/* Arm holding leash */}
    <path d="M100 125 Q130 135 140 145" stroke="#FFE5D9" strokeWidth="7" strokeLinecap="round" />
    {/* Leash line */}
    <path d="M140 145 Q155 150 165 155" stroke="#C96C4A" strokeWidth="3" strokeDasharray="3 3" />

    {/* Dog (Cute Animated Tail Wagging) */}
    <g transform="translate(135, 125)">
      {/* Dog Body */}
      <rect x="15" y="20" width="35" height="20" rx="10" fill="#C96C4A" />
      {/* Dog Head */}
      <circle cx="45" cy="18" r="11" fill="#C96C4A" />
      {/* Dog Ear */}
      <path d="M40 10 Q45 5 48 18 Z" fill="#2F2F2F" />
      {/* Dog Snout */}
      <ellipse cx="53" cy="20" rx="5" ry="4" fill="#FFE5D9" />
      <circle cx="56" cy="19" r="2" fill="#2F2F2F" />
      {/* Dog Legs */}
      <line x1="22" y1="40" x2="22" y2="52" stroke="#C96C4A" strokeWidth="4" strokeLinecap="round" />
      <line x1="42" y1="40" x2="42" y2="52" stroke="#C96C4A" strokeWidth="4" strokeLinecap="round" />
      {/* Wagging Tail */}
      <motion.path
        d="M15 22 Q5 12 10 5"
        stroke="#C96C4A"
        strokeWidth="4"
        strokeLinecap="round"
        animate={{ rotate: [-10, 15, -10] }}
        transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
        style={{ transformOrigin: '15px 22px' }}
      />
    </g>

    {/* Floating Bone Badge */}
    <motion.g
      animate={{ y: [-2, 4, -2] }}
      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
    >
      <circle cx="45" cy="65" r="15" fill="#355E3B" opacity="0.9" />
      <path d="M38 65 H52 M38 62 A3 3 0 0 0 38 68 M52 62 A3 3 0 0 1 52 68" stroke="#FBFAF7" strokeWidth="2.5" strokeLinecap="round" />
    </motion.g>
  </svg>
);

// Character 3: Repairs & Tools Neighbor (Handing over ladder/drill)
export const ToolsRepairIllustration: React.FC<{ className?: string }> = ({ className = "w-32 h-32" }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="85" fill="#F5F1E8" />
    <circle cx="100" cy="100" r="75" stroke="#E6DFD3" strokeDasharray="6 6" strokeWidth="2" />

    {/* Person (Terracotta Outfit) */}
    <motion.path
      d="M75 160 C75 120 95 110 110 110 C125 110 145 120 145 160 Z"
      fill="#C96C4A"
      animate={{ scaleY: [1, 1.015, 1] }}
      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
    />
    <circle cx="110" cy="85" r="20" fill="#F8D7DA" />
    <path d="M90 80 Q110 65 130 80 L130 85 L90 85 Z" fill="#355E3B" />

    {/* Ladder */}
    <motion.g
      animate={{ rotate: [-2, 2, -2] }}
      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      style={{ transformOrigin: '50px 100px' }}
    >
      <rect x="40" y="50" width="22" height="110" rx="3" stroke="#2F2F2F" strokeWidth="3" fill="none" />
      <line x1="40" y1="70" x2="62" y2="70" stroke="#2F2F2F" strokeWidth="3" />
      <line x1="40" y1="90" x2="62" y2="90" stroke="#2F2F2F" strokeWidth="3" />
      <line x1="40" y1="110" x2="62" y2="110" stroke="#2F2F2F" strokeWidth="3" />
      <line x1="40" y1="130" x2="62" y2="130" stroke="#2F2F2F" strokeWidth="3" />
    </motion.g>

    {/* Drill / Wrench Badge */}
    <motion.g
      animate={{ scale: [0.95, 1.05, 0.95] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
    >
      <circle cx="155" cy="70" r="16" fill="#6E8B5B" opacity="0.9" />
      <path d="M148 77 L162 63 M150 63 L154 67" stroke="#FBFAF7" strokeWidth="3" strokeLinecap="round" />
    </motion.g>
  </svg>
);

// Character 4: Home Food & Parcel Exchange Neighbor
export const FoodParcelIllustration: React.FC<{ className?: string }> = ({ className = "w-32 h-32" }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="85" fill="#F5F1E8" />
    <circle cx="100" cy="100" r="75" stroke="#E6DFD3" strokeDasharray="4 4" strokeWidth="2" />

    {/* Person Body (Forest Green Apron) */}
    <path d="M65 160 C65 125 85 110 100 110 C115 110 135 125 135 160 Z" fill="#355E3B" />
    <circle cx="100" cy="85" r="20" fill="#FFE5D9" />
    {/* Bun Hair */}
    <circle cx="100" cy="60" r="10" fill="#C96C4A" />

    {/* Holding Hot Casserole Basket */}
    <g transform="translate(75, 120)">
      <rect x="0" y="0" width="50" height="25" rx="8" fill="#C96C4A" />
      <line x1="5" y1="0" x2="45" y2="0" stroke="#FBFAF7" strokeWidth="4" />
      {/* Animated Steam Loops */}
      <motion.path
        d="M15 -5 Q18 -12 15 -18"
        stroke="#6E8B5B"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ y: [-2, -8, -2], opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      />
      <motion.path
        d="M35 -5 Q38 -12 35 -18"
        stroke="#6E8B5B"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ y: [-2, -8, -2], opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: 0.3 }}
      />
    </g>
  </svg>
);

// Character 5: Plant Care Neighbor
export const PlantCareIllustration: React.FC<{ className?: string }> = ({ className = "w-32 h-32" }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="85" fill="#F5F1E8" />

    {/* Plant Pot */}
    <path d="M80 130 L85 165 H115 L120 130 Z" fill="#C96C4A" />
    {/* Plant Leaves */}
    <motion.path
      d="M100 130 Q80 100 65 110 Q85 125 100 130 Q115 125 135 110 Q120 100 100 130 Z"
      fill="#355E3B"
      animate={{ rotate: [-2, 2, -2] }}
      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      style={{ transformOrigin: '100px 130px' }}
    />
    <path d="M100 130 Q100 85 95 75 Q105 85 100 130 Z" fill="#6E8B5B" />

    {/* Watering Can */}
    <motion.g
      animate={{ rotate: [-10, 5, -10] }}
      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      style={{ transformOrigin: '140px 80px' }}
    >
      <rect x="130" y="70" width="35" height="25" rx="6" fill="#6E8B5B" />
      <path d="M130 75 Q115 75 110 80" stroke="#6E8B5B" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Water droplets */}
      <motion.circle
        cx="105"
        cy="95"
        r="2.5"
        fill="#355E3B"
        animate={{ y: [0, 15, 0], opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
      />
    </motion.g>
  </svg>
);
