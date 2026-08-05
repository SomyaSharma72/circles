export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  neighborhood: string;
  address: string;
  bio: string;
  profession?: string;
  trustScore: number; // e.g. 98% or 4.9/5
  averageRating?: number;
  verifiedNeighbor: boolean;
  joinedDate: string;
  skills: string[];
  completedFavors: number;
  reviewsCount: number;
  phone?: string;
  preferredContact?: 'chat' | 'phone' | 'email';
}

export type RequestCategory =
  | 'Gardening'
  | 'Pet Care'
  | 'Handyman'
  | 'Tech Support'
  | 'Tutoring'
  | 'Errands'
  | 'Borrow Items'
  | 'Moving'
  | 'Elderly Care'
  | 'Other';

export type RequestStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export interface HelpRequest {
  id: string;
  title: string;
  description: string;
  category: RequestCategory;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  neighborhood: string;
  distance: string; // e.g. "0.3 miles away"
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  requesterTrustScore: number;
  helperId?: string;
  helperName?: string;
  helperAvatar?: string;
  status: RequestStatus;
  createdAt: string;
  dateNeeded: string;
  timeNeeded?: string;
  pointsOrOffer?: string; // e.g., "Free / Neighborly Gratitude" or "Homemade Cookies"
  savedByUsers?: string[];
  commentsCount: number;
}

export interface SkillOffer {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userTrustScore: number;
  neighborhood: string;
  title: string;
  category: RequestCategory;
  description: string;
  availability: string; // e.g., "Weekends & Evenings"
  skills: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  serviceRadius?: string; // e.g., "Within 3 km"
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isSystemNotice?: boolean;
}

export interface Review {
  id: string;
  targetUserId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  requestId?: string;
  requestTitle?: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  role: 'Requester' | 'Helper';
}
