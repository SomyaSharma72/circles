import React from 'react';
import {
  Sprout,
  Wrench,
  Users,
  Dumbbell,
  Dog,
  Trophy,
  BookOpen,
  Laptop,
  HeartHandshake,
  Utensils,
  Palette,
  Bike,
  Sparkles,
} from 'lucide-react';

export interface CircleCategoryTheme {
  id: string;
  name: string;
  bgColor: string;
  iconBg: string;
  textColor: string;
  borderColor: string;
  icon: React.ElementType;
}

export const CIRCLE_THEMES: Record<string, CircleCategoryTheme> = {
  gardening: {
    id: 'gardening',
    name: 'Gardening & Balcony',
    bgColor: 'bg-emerald-50',
    iconBg: 'bg-emerald-600',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-200',
    icon: Sprout,
  },
  tools: {
    id: 'tools',
    name: 'Tools & Hardware Library',
    bgColor: 'bg-orange-50',
    iconBg: 'bg-orange-600',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200',
    icon: Wrench,
  },
  parenting: {
    id: 'parenting',
    name: 'Parenting & Playgroups',
    bgColor: 'bg-amber-50',
    iconBg: 'bg-amber-600',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
    icon: Users,
  },
  fitness: {
    id: 'fitness',
    name: 'Fitness & Cycling',
    bgColor: 'bg-teal-50',
    iconBg: 'bg-teal-600',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-200',
    icon: Bike,
  },
  pets: {
    id: 'pets',
    name: 'Pets & Dog Walking',
    bgColor: 'bg-rose-50',
    iconBg: 'bg-rose-600',
    textColor: 'text-rose-800',
    borderColor: 'border-rose-200',
    icon: Dog,
  },
  sports: {
    id: 'sports',
    name: 'Weekend Sports',
    bgColor: 'bg-blue-50',
    iconBg: 'bg-blue-600',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    icon: Trophy,
  },
  books: {
    id: 'books',
    name: 'Book Club & Reading',
    bgColor: 'bg-indigo-50',
    iconBg: 'bg-indigo-600',
    textColor: 'text-indigo-800',
    borderColor: 'border-indigo-200',
    icon: BookOpen,
  },
  tech: {
    id: 'tech',
    name: 'Tech & Wi-Fi Help',
    bgColor: 'bg-slate-50',
    iconBg: 'bg-slate-700',
    textColor: 'text-slate-800',
    borderColor: 'border-slate-200',
    icon: Laptop,
  },
  volunteering: {
    id: 'volunteering',
    name: 'Local Volunteering',
    bgColor: 'bg-lime-50',
    iconBg: 'bg-lime-700',
    textColor: 'text-lime-800',
    borderColor: 'border-lime-200',
    icon: HeartHandshake,
  },
  cooking: {
    id: 'cooking',
    name: 'Cooking & Recipe Swap',
    bgColor: 'bg-red-50',
    iconBg: 'bg-red-600',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    icon: Utensils,
  },
  arts: {
    id: 'arts',
    name: 'Arts & Crafts',
    bgColor: 'bg-purple-50',
    iconBg: 'bg-purple-600',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200',
    icon: Palette,
  },
};

export const getCircleTheme = (categoryOrIcon?: string): CircleCategoryTheme => {
  if (!categoryOrIcon) return CIRCLE_THEMES.gardening;
  const key = categoryOrIcon.toLowerCase().trim();
  for (const [k, theme] of Object.entries(CIRCLE_THEMES)) {
    if (key.includes(k) || theme.name.toLowerCase().includes(key) || key.includes(theme.name.toLowerCase())) {
      return theme;
    }
  }
  return CIRCLE_THEMES.gardening;
};

export const CircleIconBadge: React.FC<{
  iconKey?: string;
  category?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ iconKey, category, size = 'md', className = '' }) => {
  const theme = getCircleTheme(iconKey || category);
  const IconComponent = theme.icon;

  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-11 h-11 p-2.5',
    lg: 'w-14 h-14 p-3.5',
    xl: 'w-18 h-18 p-4',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  };

  return (
    <div
      className={`rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${theme.bgColor} ${theme.borderColor} border ${sizeClasses[size]} ${className}`}
    >
      <div className={`rounded-xl ${theme.iconBg} text-white flex items-center justify-center p-1.5 shadow-2xs`}>
        <IconComponent className={iconSizes[size]} />
      </div>
    </div>
  );
};
