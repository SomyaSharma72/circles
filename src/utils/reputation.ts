export interface ReputationTier {
  badge: string;
  title: string;
  icon: string;
  colorClass: string;
}

/**
 * Returns the reputation tier and badge details according to Trust Score:
 * 95-100: 🏆 Community Hero
 * 80-94:  ⭐ Trusted Neighbor
 * 60-79:  👍 Active Helper
 * 40-59:  🙂 New Member
 * Below 40: 🌱 Building Reputation
 */
export function getReputationTier(trustScore: number = 95): ReputationTier {
  const score = Math.max(0, Math.min(100, Math.round(trustScore)));

  if (score >= 95) {
    return {
      badge: '🏆 Community Hero',
      title: 'Community Hero',
      icon: '🏆',
      colorClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700/80',
    };
  }
  if (score >= 80) {
    return {
      badge: '⭐ Trusted Neighbor',
      title: 'Trusted Neighbor',
      icon: '⭐',
      colorClass: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-700/80',
    };
  }
  if (score >= 60) {
    return {
      badge: '👍 Active Helper',
      title: 'Active Helper',
      icon: '👍',
      colorClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700/80',
    };
  }
  if (score >= 40) {
    return {
      badge: '🙂 New Member',
      title: 'New Member',
      icon: '🙂',
      colorClass: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-700/80',
    };
  }
  return {
    badge: '🌱 Building Reputation',
    title: 'Building Reputation',
    icon: '🌱',
    colorClass: 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/80',
  };
}
