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
  skills: string[];
  trustScore: number;
  completedFavors: number;
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
