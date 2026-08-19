import React from 'react';

/**
 * Deterministically computes an avatar index (0 to 5) from a userId or name string.
 * This guarantees the exact same user always gets the exact same avatar everywhere.
 */
export function getAvatarIndex(idOrName?: string): number {
  if (!idOrName || typeof idOrName !== 'string') return 0;
  let hash = 0;
  for (let i = 0; i < idOrName.length; i++) {
    hash = (hash << 5) - hash + idOrName.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 6;
}

interface UserAvatarProps {
  userId?: string;
  name?: string;
  avatarIndex?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  className?: string;
  showBadge?: boolean;
  badgeContent?: React.ReactNode;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-24 h-24',
};

// 6 Unique, Friendly Illustrated Human Characters
export const AvatarIllustrations: React.FC<{ index: number; className?: string }>[] = [
  // 0: Sage Baker & Gardener (Warm Sage BG, curly dark hair, glasses, friendly smile)
  ({ className = 'w-full h-full' }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="50" fill="#E2ECE9" />
      {/* Torso */}
      <path d="M22 96 C22 74 38 64 50 64 C62 64 78 74 78 96 Z" fill="#355E3B" />
      <path d="M42 64 L50 74 L58 64 Z" fill="#FFE5D9" />
      {/* Neck */}
      <rect x="44" y="52" width="12" height="16" rx="4" fill="#FFE5D9" />
      {/* Head */}
      <circle cx="50" cy="42" r="18" fill="#FFE5D9" />
      {/* Curly Hair back & top */}
      <circle cx="34" cy="38" r="9" fill="#2C241E" />
      <circle cx="66" cy="38" r="9" fill="#2C241E" />
      <circle cx="42" cy="26" r="10" fill="#2C241E" />
      <circle cx="58" cy="26" r="10" fill="#2C241E" />
      <circle cx="50" cy="23" r="10" fill="#2C241E" />
      {/* Face features */}
      {/* Glasses */}
      <circle cx="43" cy="42" r="5.5" stroke="#C96C4A" strokeWidth="2" fill="white" fillOpacity="0.4" />
      <circle cx="57" cy="42" r="5.5" stroke="#C96C4A" strokeWidth="2" fill="white" fillOpacity="0.4" />
      <line x1="48.5" y1="42" x2="51.5" y2="42" stroke="#C96C4A" strokeWidth="2" />
      {/* Eyes */}
      <circle cx="43" cy="42" r="2" fill="#2C241E" />
      <circle cx="57" cy="42" r="2" fill="#2C241E" />
      {/* Cheeks */}
      <ellipse cx="36" cy="47" rx="3" ry="1.8" fill="#F8B4A6" opacity="0.6" />
      <ellipse cx="64" cy="47" rx="3" ry="1.8" fill="#F8B4A6" opacity="0.6" />
      {/* Smile */}
      <path d="M46 49 Q50 54 54 49" stroke="#2C241E" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  ),

  // 1: Handy Builder / Fixer (Warm Ochre BG, terracotta cap, cozy olive vest)
  ({ className = 'w-full h-full' }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="50" fill="#FBEEDF" />
      {/* Torso / Vest */}
      <path d="M22 96 C22 72 38 62 50 62 C62 62 78 72 78 96 Z" fill="#6E8B5B" />
      <path d="M40 62 L50 76 L60 62 Z" fill="#C96C4A" />
      {/* Neck */}
      <rect x="44" y="50" width="12" height="16" rx="4" fill="#FCD8BE" />
      {/* Head */}
      <circle cx="50" cy="42" r="18" fill="#FCD8BE" />
      {/* Short beard / stubble */}
      <path d="M38 46 C38 56 62 56 62 46 C62 58 38 58 38 46 Z" fill="#8C6239" opacity="0.3" />
      {/* Eyes */}
      <circle cx="42" cy="41" r="2.2" fill="#2F2F2F" />
      <circle cx="58" cy="41" r="2.2" fill="#2F2F2F" />
      {/* Eyebrows */}
      <path d="M39 36 Q42 34 45 36" stroke="#2F2F2F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M55 36 Q58 34 61 36" stroke="#2F2F2F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Cap */}
      <path d="M30 35 C30 20 70 20 70 35 Z" fill="#C96C4A" />
      <path d="M28 35 Q50 32 74 35 Q74 38 68 39 Q50 36 28 38 Z" fill="#A85335" />
      {/* Smile */}
      <path d="M45 49 Q50 54 55 49" stroke="#2F2F2F" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),

  // 2: Bookish Tutor & Thinker (Soft Forest BG, neat wavy dark hair, mint shirt)
  ({ className = 'w-full h-full' }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="50" fill="#E5ECE4" />
      {/* Torso */}
      <path d="M22 96 C22 74 36 64 50 64 C64 64 78 74 78 96 Z" fill="#2F3E46" />
      {/* Collar */}
      <path d="M43 64 L50 75 L57 64 Z" fill="#FFFFFF" />
      {/* Neck */}
      <rect x="44" y="52" width="12" height="16" rx="4" fill="#FCE0D2" />
      {/* Hair Behind */}
      <path d="M30 34 C30 18 70 18 70 34 C74 46 72 58 68 62 L32 62 C28 58 26 46 30 34 Z" fill="#3D2619" />
      {/* Head */}
      <circle cx="50" cy="43" r="17" fill="#FCE0D2" />
      {/* Front bangs */}
      <path d="M33 36 C38 24 62 24 67 36 C60 30 40 30 33 36 Z" fill="#3D2619" />
      {/* Round Stylish Glasses */}
      <circle cx="43" cy="43" r="5" stroke="#355E3B" strokeWidth="1.8" fill="white" fillOpacity="0.4" />
      <circle cx="57" cy="43" r="5" stroke="#355E3B" strokeWidth="1.8" fill="white" fillOpacity="0.4" />
      <line x1="48" y1="43" x2="52" y2="43" stroke="#355E3B" strokeWidth="1.8" />
      <circle cx="43" cy="43" r="1.8" fill="#2F2F2F" />
      <circle cx="57" cy="43" r="1.8" fill="#2F2F2F" />
      {/* Cheeks */}
      <ellipse cx="37" cy="48" rx="2.8" ry="1.5" fill="#F6A89E" opacity="0.6" />
      <ellipse cx="63" cy="48" rx="2.8" ry="1.5" fill="#F6A89E" opacity="0.6" />
      {/* Smile */}
      <path d="M46 50 Q50 54 54 50" stroke="#2F2F2F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  ),

  // 3: Active Cyclist / Pet Lover (Warm Peach BG, top bun with teal band, lively coral jacket)
  ({ className = 'w-full h-full' }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="50" fill="#FBE8E2" />
      {/* Top Bun */}
      <circle cx="50" cy="18" r="10" fill="#1E1E24" />
      <ellipse cx="50" cy="24" rx="6" ry="2.5" fill="#355E3B" />
      {/* Torso */}
      <path d="M22 96 C22 72 36 62 50 62 C64 62 78 72 78 96 Z" fill="#C96C4A" />
      <path d="M44 62 L50 72 L56 62 Z" fill="#FFE5D9" />
      {/* Neck */}
      <rect x="44" y="50" width="12" height="16" rx="4" fill="#FFE5D9" />
      {/* Head */}
      <circle cx="50" cy="41" r="17" fill="#FFE5D9" />
      {/* Hairline */}
      <path d="M33 38 C33 24 67 24 67 38 C62 30 38 30 33 38 Z" fill="#1E1E24" />
      {/* Big joyful eyes */}
      <path d="M40 39 Q43 36 46 39" stroke="#1E1E24" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M54 39 Q57 36 60 39" stroke="#1E1E24" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* Freckles */}
      <circle cx="41" cy="46" r="1" fill="#C96C4A" opacity="0.6" />
      <circle cx="44" cy="47" r="1" fill="#C96C4A" opacity="0.6" />
      <circle cx="56" cy="47" r="1" fill="#C96C4A" opacity="0.6" />
      <circle cx="59" cy="46" r="1" fill="#C96C4A" opacity="0.6" />
      {/* Broad Happy Smile */}
      <path d="M44 48 Q50 56 56 48" stroke="#1E1E24" strokeWidth="2" strokeLinecap="round" fill="#FFFFFF" />
    </svg>
  ),

  // 4: Friendly Senior & Mentor (Soft Slate Blue BG, silver wavy hair, warm scarf)
  ({ className = 'w-full h-full' }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="50" fill="#E8EEF5" />
      {/* Torso */}
      <path d="M22 96 C22 74 36 64 50 64 C64 64 78 74 78 96 Z" fill="#3D5A80" />
      {/* Warm Scarf */}
      <path d="M36 64 C36 58 64 58 64 64 L62 76 C54 79 46 79 38 76 Z" fill="#E07A5F" />
      {/* Neck */}
      <rect x="44" y="50" width="12" height="14" rx="4" fill="#FADBC8" />
      {/* Silver Hair */}
      <circle cx="34" cy="38" r="10" fill="#C5D1D9" />
      <circle cx="66" cy="38" r="10" fill="#C5D1D9" />
      <path d="M30 36 C30 18 70 18 70 36 C70 24 30 24 30 36 Z" fill="#DCE4EB" />
      {/* Head */}
      <circle cx="50" cy="42" r="17" fill="#FADBC8" />
      {/* Front Silver Curls */}
      <path d="M34 32 Q50 24 66 32 Q50 30 34 32 Z" fill="#C5D1D9" />
      {/* Kind Eyes / Laugh Lines */}
      <path d="M40 40 Q43 38 46 41" stroke="#2F2F2F" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M54 41 Q57 38 60 40" stroke="#2F2F2F" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Small Wire Glasses */}
      <rect x="38" y="38" width="9" height="7" rx="3.5" stroke="#7A8B99" strokeWidth="1.5" fill="none" />
      <rect x="53" y="38" width="9" height="7" rx="3.5" stroke="#7A8B99" strokeWidth="1.5" fill="none" />
      <line x1="47" y1="41" x2="53" y2="41" stroke="#7A8B99" strokeWidth="1.5" />
      {/* Kind Smile */}
      <path d="M46 51 Q50 55 54 51" stroke="#2F2F2F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  ),

  // 5: Creative Tech / Artist (Warm Golden Sand BG, modern textured crop, mustard crewneck)
  ({ className = 'w-full h-full' }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="50" fill="#F7EFE2" />
      {/* Torso */}
      <path d="M22 96 C22 74 36 64 50 64 C64 64 78 74 78 96 Z" fill="#E9C46A" />
      <path d="M43 64 Q50 70 57 64" stroke="#D4A373" strokeWidth="3" fill="none" />
      {/* Neck */}
      <rect x="44" y="50" width="12" height="16" rx="4" fill="#FCD5B5" />
      {/* Head */}
      <circle cx="50" cy="42" r="18" fill="#FCD5B5" />
      {/* Modern Hair Crop */}
      <path d="M30 38 C30 18 70 18 70 38 C68 28 62 26 50 26 C38 26 32 28 30 38 Z" fill="#264653" />
      <path d="M32 36 L40 26 L48 30 L56 26 L64 30 L68 36 Z" fill="#264653" />
      {/* Eyes */}
      <circle cx="42" cy="42" r="2.2" fill="#264653" />
      <circle cx="58" cy="42" r="2.2" fill="#264653" />
      {/* Eyebrows */}
      <path d="M39 37 Q42 35 45 37" stroke="#264653" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M55 37 Q58 35 61 37" stroke="#264653" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Cheeks */}
      <ellipse cx="36" cy="48" rx="3" ry="1.8" fill="#F4A261" opacity="0.5" />
      <ellipse cx="64" cy="48" rx="3" ry="1.8" fill="#F4A261" opacity="0.5" />
      {/* Smile */}
      <path d="M45 49 Q50 55 55 49" stroke="#264653" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),
];

export const UserAvatar: React.FC<UserAvatarProps> = ({
  userId,
  name,
  avatarIndex,
  size = 'md',
  className = '',
  showBadge = false,
  badgeContent,
}) => {
  const index = typeof avatarIndex === 'number' ? Math.abs(avatarIndex) % 6 : getAvatarIndex(userId || name || '');
  const AvatarSvg = AvatarIllustrations[index] || AvatarIllustrations[0];

  const sizeClass = typeof size === 'string' ? sizeClasses[size] || sizeClasses.md : '';
  const customStyle = typeof size === 'number' ? { width: size, height: size } : undefined;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-visible ${sizeClass} ${className}`}
      style={customStyle}
    >
      <div className="w-full h-full rounded-full overflow-hidden shadow-2xs border border-[#E6DFD3]">
        <AvatarSvg className="w-full h-full object-cover" />
      </div>
      {showBadge && (
        <div className="absolute -bottom-1 -right-1 z-10">{badgeContent}</div>
      )}
    </div>
  );
};

export default UserAvatar;
