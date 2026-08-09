import React from 'react';

// Friendly community illustration - Neighbors helping each other (Hero banner)
export const CommunityHelpIllustration: React.FC<{ className?: string }> = ({ className = "w-full max-w-sm h-auto" }) => (
  <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Soft background circle */}
    <circle cx="200" cy="120" r="100" fill="#FFEDD5" />
    <circle cx="290" cy="80" r="40" fill="#FED7AA" opacity="0.6" />
    
    {/* Apartment / Houses silhouette */}
    <rect x="50" y="110" width="60" height="90" rx="4" fill="#FDBA74" />
    <rect x="62" y="125" width="12" height="16" rx="2" fill="#FFFFFF" />
    <rect x="86" y="125" width="12" height="16" rx="2" fill="#FFFFFF" />
    <rect x="62" y="150" width="12" height="16" rx="2" fill="#FFFFFF" />
    <rect x="86" y="150" width="12" height="16" rx="2" fill="#FFFFFF" />

    <rect x="290" y="90" width="70" height="110" rx="4" fill="#FB923C" />
    <rect x="305" y="105" width="14" height="20" rx="2" fill="#FFF7ED" />
    <rect x="331" y="105" width="14" height="20" rx="2" fill="#FFF7ED" />
    <rect x="305" y="135" width="14" height="20" rx="2" fill="#FFF7ED" />
    <rect x="331" y="135" width="14" height="20" rx="2" fill="#FFF7ED" />

    {/* Ground line */}
    <path d="M20 200 H380" stroke="#EA580C" strokeWidth="4" strokeLinecap="round" />

    {/* Person 1: Giving a box/tools (Orange shirt, Navy trousers) */}
    <circle cx="160" cy="115" r="14" fill="#FB923C" /> {/* Head */}
    <path d="M148 135 C148 130 152 128 160 128 C168 128 172 130 172 135 L174 170 H146 Z" fill="#F97316" /> {/* Torso */}
    <rect x="150" y="170" width="8" height="30" rx="3" fill="#1F2937" /> {/* Legs */}
    <rect x="162" y="170" width="8" height="30" rx="3" fill="#1F2937" />

    {/* Neighbor 1 holding a box */}
    <rect x="170" y="140" width="28" height="22" rx="4" fill="#D97706" />
    <path d="M170 150 H198" stroke="#FFFFFF" strokeWidth="2" />

    {/* Person 2: Receiving help (Navy shirt, Orange trousers) */}
    <circle cx="230" cy="115" r="14" fill="#374151" /> {/* Head */}
    <path d="M218 135 C218 130 222 128 230 128 C238 128 242 130 242 135 L244 170 H216 Z" fill="#1F2937" /> {/* Torso */}
    <rect x="220" y="170" width="8" height="30" rx="3" fill="#EA580C" /> {/* Legs */}
    <rect x="232" y="170" width="8" height="30" rx="3" fill="#EA580C" />

    {/* Heart floating above */}
    <path d="M195 80 C190 70 175 70 175 82 C175 92 195 102 195 102 C195 102 215 92 215 82 C215 70 200 70 195 80 Z" fill="#F97316" />
  </svg>
);

// Person carrying groceries
export const GroceriesIllustration: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="32" cy="32" r="30" fill="#FFEDD5" />
    {/* Grocery Bag */}
    <path d="M20 28 L23 50 C23 52 24.5 53 26.5 53 H37.5 C39.5 53 41 52 41 50 L44 28 Z" fill="#D97706" />
    {/* Carrot & Veggies */}
    <path d="M26 18 L30 29 H22 Z" fill="#F97316" />
    <circle cx="35" cy="22" r="5" fill="#16A34A" />
    <rect x="38" y="16" width="4" height="14" rx="2" fill="#DC2626" />
    {/* Handles */}
    <path d="M25 28 C25 22 28 22 28 28" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M36 28 C36 22 39 22 39 28" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// Neighbor with drill machine / home tools
export const ToolsIllustration: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="32" cy="32" r="30" fill="#FFEDD5" />
    {/* Drill body */}
    <rect x="18" y="22" width="22" height="12" rx="3" fill="#EA580C" />
    <rect x="12" y="26" width="8" height="4" fill="#9CA3AF" />
    <rect x="22" y="34" width="8" height="16" rx="2" fill="#1F2937" />
    {/* Battery pack */}
    <rect x="20" y="48" width="12" height="5" rx="1.5" fill="#F97316" />
    <circle cx="32" cy="28" r="2" fill="#FFFFFF" />
  </svg>
);

// Scooter jumpstart / Transportation
export const ScooterIllustration: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="32" cy="32" r="30" fill="#FFEDD5" />
    {/* Scooter Body */}
    <path d="M16 42 H44 M20 42 C20 34 26 32 34 32 H42 V42 H16 Z" fill="#F97316" />
    {/* Wheels */}
    <circle cx="22" cy="44" r="6" fill="#1F2937" />
    <circle cx="22" cy="44" r="2" fill="#FFFFFF" />
    <circle cx="42" cy="44" r="6" fill="#1F2937" />
    <circle cx="42" cy="44" r="2" fill="#FFFFFF" />
    {/* Handlebar & Lamp */}
    <path d="M38 32 L40 20 H44" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
    <circle cx="44" cy="20" r="3" fill="#EAB308" />
  </svg>
);

// Dog Walker / Pet Care
export const PetCareIllustration: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="32" cy="32" r="30" fill="#FFEDD5" />
    {/* Friendly Dog Body */}
    <ellipse cx="32" cy="36" rx="12" ry="8" fill="#D97706" />
    <circle cx="42" cy="28" r="6" fill="#D97706" />
    <ellipse cx="46" cy="26" rx="2" ry="4" fill="#92400E" /> {/* Ear */}
    <circle cx="44" cy="28" r="1" fill="#1F2937" /> {/* Eye */}
    {/* Dog legs & Tail */}
    <rect x="24" y="42" width="3" height="8" rx="1.5" fill="#B45309" />
    <rect x="30" y="42" width="3" height="8" rx="1.5" fill="#B45309" />
    <rect x="36" y="42" width="3" height="8" rx="1.5" fill="#B45309" />
    <path d="M20 34 Q14 28 16 22" stroke="#D97706" strokeWidth="3" strokeLinecap="round" /> {/* Tail */}
  </svg>
);

// Apartment / Community building
export const ApartmentIllustration: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="32" cy="32" r="30" fill="#FFEDD5" />
    <rect x="20" y="16" width="24" height="36" rx="3" fill="#F97316" />
    <rect x="24" y="22" width="5" height="6" rx="1" fill="#FFF7ED" />
    <rect x="35" y="22" width="5" height="6" rx="1" fill="#FFF7ED" />
    <rect x="24" y="32" width="5" height="6" rx="1" fill="#FFF7ED" />
    <rect x="35" y="32" width="5" height="6" rx="1" fill="#FFF7ED" />
    <rect x="28" y="42" width="8" height="10" rx="1" fill="#1F2937" />
  </svg>
);
