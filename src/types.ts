export interface UserLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  bio?: string;
  neighborhood?: string;
  profession?: string;
  age?: number;
  gender?: string;
  profileCompleted?: boolean;
  blockedUsers?: string[];
  skills: string[];
  trustScore: number;
  completedFavors: number;
  credits?: number;
  avatarUrl?: string;
  location: UserLocation;
  matchPercentage?: number;
  rationale?: string;
}

export interface FavorRequest {
  _id: string;
  title: string;
  description: string;
  category: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  tags: string[];
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  requester: User;
  helper?: User;
  creditsAwarded?: boolean;
  completedAt?: string;
  summary?: string;
  isFlaggedSpam?: boolean;
  fraudReason?: string;
  locationName?: string;
  location: UserLocation;
  createdAt: string;
  updatedAt: string;
  distanceMiles?: number;
  distanceKm?: number;
  aiMatchScore?: number;
  aiMatchReason?: string;
  searchRelevance?: number;
  searchExplanation?: string;
}

export interface Skill {
  _id: string;
  name: string;
  category: string;
  description?: string;
}

export interface Review {
  _id: string;
  request: FavorRequest | string;
  reviewer: User;
  reviewee: User;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  request: string;
  sender: User | any;
  receiver: User | any;
  text: string;
  read?: boolean;
  createdAt: string;
}

export interface Conversation {
  requestId: string;
  requestTitle: string;
  requestCategory?: string;
  requestStatus: string;
  requesterId?: string;
  helperId?: string;
  isRequester?: boolean;
  otherUser: {
    _id: string;
    id?: string;
    name: string;
    avatarUrl?: string;
    trustScore?: number;
    neighborhood?: string;
  };
  lastMessage: {
    _id: string;
    text: string;
    sender: any;
    createdAt: string;
    read?: boolean;
  };
  unreadCount?: number;
}

export interface CommunityGroup {
  _id: string;
  name: string;
  description?: string;
  category: string;
  creator: User | any;
  members: (User | any)[];
  neighborhood?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface CommunityGroupMessage {
  _id: string;
  group: string;
  sender: User | any;
  text: string;
  createdAt: string;
}

export interface CommunityMetrics {
  totalNeighbors: number;
  totalRequests: number;
  completedFavors: number;
  uniqueSkillsShared: number;
  averageCommunityRating: number;
}

export interface GeocodedLocation {
  lat: number;
  lng: number;
  neighborhood: string;
  fullAddress: string;
  city: string;
  state?: string;
  country?: string;
  timestamp: number;
  source: 'gps' | 'cache' | 'fallback' | 'custom';
}

export interface CreditTransaction {
  _id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'spent';
  reason: string;
  requestId?: string;
  createdAt: string;
}

export interface RewardOffer {
  _id: string;
  title: string;
  description: string;
  brand: string;
  category: string;
  creditsRequired: number;
  discount: string;
  icon: string;
  isActive: boolean;
}

export interface RewardRedemption {
  _id: string;
  userId: string;
  offerId: string;
  offerTitle: string;
  offerBrand: string;
  discount: string;
  creditsSpent: number;
  redemptionCode: string;
  createdAt: string;
}
