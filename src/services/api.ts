import axios from 'axios';
import { HelpRequest, SkillOffer, User, ChatMessage } from '../types';

// API base URL configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Transforms raw backend MongoDB User object into frontend User shape
 */
export const transformBackendUser = (u: any): User | null => {
  if (!u) return null;
  const userId = u._id || u.id;
  return {
    id: String(userId),
    name: u.fullName || u.name || 'Neighbor',
    email: u.email || '',
    avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    neighborhood: u.neighborhood || 'Maplewood Terrace',
    address: u.address || 'Local Neighborhood',
    bio: u.bio || '',
    profession: u.profession || '',
    trustScore: u.trustScore ?? 95,
    averageRating: u.averageRating ?? 5.0,
    verifiedNeighbor: true,
    joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024',
    skills: Array.isArray(u.skills) ? u.skills : [],
    completedFavors: u.completedFavors ?? 0,
    reviewsCount: u.totalReviews ?? u.reviewsCount ?? 0,
    phone: u.phone || '(555) 234-5678',
    preferredContact: u.preferredContact || 'chat',
    profileCompleted: Boolean(u.profileCompleted),
  };
};

/**
 * User Module API Services
 */
export const userApi = {
  // POST /api/users/login
  login: async (email: string, password?: string): Promise<User> => {
    const response = await apiClient.post('/api/users/login', { email, password });
    const rawData = response.data?.data || response.data;
    const transformed = transformBackendUser(rawData);
    if (!transformed) throw new Error('Failed to parse login user response');
    return transformed;
  },

  // POST /api/users/signup
  signup: async (fullName: string, email: string, password?: string): Promise<User> => {
    const response = await apiClient.post('/api/users/signup', { fullName, email, password });
    const rawData = response.data?.data || response.data;
    const transformed = transformBackendUser(rawData);
    if (!transformed) throw new Error('Failed to parse signup user response');
    return transformed;
  },

  // PUT /api/users/:id
  updateProfile: async (id: string, payload: Partial<User>): Promise<User> => {
    const body: Record<string, any> = {};
    if (payload.name !== undefined) body.fullName = payload.name;
    if (payload.profession !== undefined) body.profession = payload.profession;
    if (payload.neighborhood !== undefined) body.neighborhood = payload.neighborhood;
    if (payload.bio !== undefined) body.bio = payload.bio;
    if (payload.skills !== undefined) body.skills = payload.skills;
    if (payload.profileCompleted !== undefined) body.profileCompleted = payload.profileCompleted;
    if (payload.avatar !== undefined) body.avatar = payload.avatar;
    if (payload.phone !== undefined) body.phone = payload.phone;
    if (payload.preferredContact !== undefined) body.preferredContact = payload.preferredContact;

    const response = await apiClient.put(`/api/users/${id}`, body);
    const rawData = response.data?.data || response.data;
    const transformed = transformBackendUser(rawData);
    if (!transformed) throw new Error('Failed to parse updated user profile response');
    return transformed;
  },

  // GET /api/users/:id
  getUserById: async (id: string): Promise<User | null> => {
    const response = await apiClient.get(`/api/users/${id}`);
    const rawData = response.data?.data || response.data;
    return transformBackendUser(rawData);
  },

  // GET /api/users
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/api/users');
    const rawList = response.data?.data || response.data || [];
    if (!Array.isArray(rawList)) return [];
    return rawList.map(transformBackendUser).filter((u): u is User => u !== null);
  },

  // GET /api/users/leaderboard
  getLeaderboard: async (limit: number = 10): Promise<User[]> => {
    const response = await apiClient.get(`/api/users/leaderboard?limit=${limit}`);
    const rawList = response.data?.data || response.data || [];
    if (!Array.isArray(rawList)) return [];
    return rawList.map(transformBackendUser).filter((u): u is User => u !== null);
  },
};

export const getLeaderboard = userApi.getLeaderboard;

/**
 * Review Module API Services
 */
export const reviewApi = {
  // POST /api/reviews
  submitReview: async (payload: {
    reviewerId: string;
    receiverId: string;
    requestId?: string;
    rating: number;
    comment?: string;
  }): Promise<{ review: any; updatedUser: User | null }> => {
    const response = await apiClient.post('/api/reviews', payload);
    const data = response.data?.data || response.data;
    const updatedUser = transformBackendUser(data?.updatedUser);
    return {
      review: data?.review,
      updatedUser,
    };
  },

  // GET /api/reviews/user/:userId
  getReviewsForUser: async (userId: string): Promise<any[]> => {
    const response = await apiClient.get(`/api/reviews/user/${userId}`);
    return response.data?.data || response.data || [];
  },
};

/**
 * Transforms raw backend MongoDB request object into frontend HelpRequest shape
 */
export const transformBackendRequest = (req: any): HelpRequest | null => {
  if (!req) return null;

  const reqId = req._id || req.id;
  const requestedByObj = req.requestedBy && typeof req.requestedBy === 'object' ? req.requestedBy : null;
  const acceptedByObj = req.acceptedBy && typeof req.acceptedBy === 'object' ? req.acceptedBy : null;

  const requesterId = requestedByObj?._id || (typeof req.requestedBy === 'string' ? req.requestedBy : (req.requesterId || 'u1'));
  const requesterName = requestedByObj?.fullName || req.requesterName || 'Sarah Jenkins';
  const requesterTrustScore = requestedByObj?.trustScore ?? req.requesterTrustScore ?? 99;
  const neighborhood = req.location || requestedByObj?.neighborhood || req.neighborhood || 'Maplewood Terrace';

  const helperId = acceptedByObj?._id || (typeof req.acceptedBy === 'string' ? req.acceptedBy : (req.helperId || undefined));
  const helperName = acceptedByObj?.fullName || req.helperName || undefined;

  // Standardize status to lowercase for frontend
  const statusStr = (req.status || 'Pending').toLowerCase() as HelpRequest['status'];

  // Format createdAt
  let formattedCreatedAt = 'Just now';
  if (req.createdAt) {
    const d = new Date(req.createdAt);
    if (!isNaN(d.getTime())) {
      formattedCreatedAt = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      formattedCreatedAt = req.createdAt;
    }
  }

  return {
    id: String(reqId),
    title: req.title || '',
    description: req.description || '',
    category: req.category || 'Other',
    urgency: req.urgency || 'medium',
    neighborhood,
    distance: req.distance || '0.3 miles away',
    requesterId: String(requesterId),
    requesterName,
    requesterAvatar: req.requesterAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    requesterTrustScore,
    helperId: helperId ? String(helperId) : undefined,
    helperName,
    helperAvatar: req.helperAvatar || (acceptedByObj ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' : undefined),
    status: statusStr,
    createdAt: formattedCreatedAt,
    dateNeeded: req.requiredDate || req.dateNeeded || 'Soon',
    timeNeeded: req.timeNeeded || 'Flexible',
    pointsOrOffer: req.pointsOrOffer || 'Neighborly Gratitude',
    savedByUsers: req.savedByUsers || [],
    commentsCount: req.commentsCount || 0,
  };
};

/**
 * Transforms raw backend MongoDB skill object into frontend SkillOffer shape
 */
export const transformBackendSkill = (s: any): SkillOffer | null => {
  if (!s) return null;

  const skillId = s._id || s.id;
  const userObj = s.user && typeof s.user === 'object' ? s.user : null;

  const userId = userObj?._id || (typeof s.user === 'string' ? s.user : (s.userId || 'u2'));
  const userName = userObj?.fullName || s.userName || 'Marcus Vance';
  const userTrustScore = userObj?.trustScore ?? s.userTrustScore ?? 99;
  const neighborhood = userObj?.neighborhood || s.neighborhood || 'Maplewood Terrace';

  let formattedCreatedAt = 'Recently';
  if (s.createdAt) {
    const d = new Date(s.createdAt);
    if (!isNaN(d.getTime())) {
      formattedCreatedAt = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      formattedCreatedAt = s.createdAt;
    }
  }

  return {
    id: String(skillId),
    userId: String(userId),
    userName,
    userAvatar: s.userAvatar || userObj?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    userTrustScore,
    neighborhood,
    title: s.title || '',
    category: s.category || 'Other',
    description: s.description || '',
    availability: s.availability || 'Flexible',
    skills: s.skills || [s.title],
    rating: s.rating || 5.0,
    reviewCount: s.reviewCount || 12,
    createdAt: formattedCreatedAt,
  };
};

/**
 * Transforms raw backend MongoDB message object into frontend ChatMessage shape
 */
export const transformBackendMessage = (m: any): ChatMessage | null => {
  if (!m) return null;
  const msgId = m._id || m.id;
  const requestId = typeof m.request === 'object' ? m.request?._id || m.request?.id : m.request || m.requestId;

  const senderObj = m.sender && typeof m.sender === 'object' ? m.sender : null;
  const senderId = senderObj?._id || senderObj?.id || (typeof m.sender === 'string' ? m.sender : (m.senderId || ''));
  const senderName = senderObj?.fullName || senderObj?.name || m.senderName || 'Neighbor';
  const senderAvatar = senderObj?.avatar || m.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

  let timestamp = 'Just now';
  if (m.createdAt) {
    const d = new Date(m.createdAt);
    if (!isNaN(d.getTime())) {
      timestamp = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  return {
    id: String(msgId),
    requestId: String(requestId || ''),
    senderId: String(senderId || ''),
    senderName,
    senderAvatar,
    text: m.message || m.text || '',
    timestamp,
    isSystemNotice: Boolean(m.isSystemNotice),
  };
};

/**
 * Valid 24-character MongoDB ObjectId helper for mock user compatibility
 */
const getValidObjectId = (id?: string): string => {
  if (id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
    return id;
  }
  return '65c1234567890abcdef12345';
};

/**
 * Request Module API Services
 */
export const requestApi = {
  // GET /api/requests
  getAllRequests: async (): Promise<HelpRequest[]> => {
    const response = await apiClient.get('/api/requests');
    const rawList = response.data?.data || response.data || [];
    if (!Array.isArray(rawList)) return [];
    return rawList.map(transformBackendRequest).filter((r): r is HelpRequest => r !== null);
  },

  // GET /api/requests/:id
  getRequestById: async (id: string): Promise<HelpRequest | null> => {
    const response = await apiClient.get(`/api/requests/${id}`);
    const rawData = response.data?.data || response.data;
    return transformBackendRequest(rawData);
  },

  // POST /api/requests
  createRequest: async (payload: any): Promise<HelpRequest> => {
    const body = {
      title: payload.title,
      description: payload.description,
      category: payload.category,
      urgency: payload.urgency || 'medium',
      pointsOrOffer: payload.pointsOrOffer || 'Neighborly Gratitude',
      requiredDate: payload.dateNeeded || payload.requiredDate || 'Soon',
      location: payload.neighborhood || payload.location || 'Maplewood Terrace',
      requestedBy: getValidObjectId(payload.requesterId),
    };

    const response = await apiClient.post('/api/requests', body);
    const rawData = response.data?.data || response.data;
    const transformed = transformBackendRequest(rawData);
    if (!transformed) {
      throw new Error('Failed to parse created request response');
    }
    return transformed;
  },

  // PUT /api/requests/:id
  updateRequest: async (id: string, updatePayload: any): Promise<HelpRequest> => {
    const body: Record<string, any> = {};

    if (updatePayload.title !== undefined) body.title = updatePayload.title;
    if (updatePayload.description !== undefined) body.description = updatePayload.description;
    if (updatePayload.category !== undefined) body.category = updatePayload.category;
    if (updatePayload.urgency !== undefined) body.urgency = updatePayload.urgency;
    if (updatePayload.pointsOrOffer !== undefined) body.pointsOrOffer = updatePayload.pointsOrOffer;
    if (updatePayload.dateNeeded !== undefined || updatePayload.requiredDate !== undefined) {
      body.requiredDate = updatePayload.dateNeeded || updatePayload.requiredDate;
    }
    if (updatePayload.neighborhood !== undefined || updatePayload.location !== undefined) {
      body.location = updatePayload.neighborhood || updatePayload.location;
    }

    if (updatePayload.status !== undefined) {
      const s = String(updatePayload.status).toLowerCase();
      if (s === 'pending') body.status = 'Pending';
      else if (s === 'accepted') body.status = 'Accepted';
      else if (s === 'completed') body.status = 'Completed';
    }

    if (updatePayload.helperId !== undefined || updatePayload.acceptedBy !== undefined) {
      const helperIdVal = updatePayload.acceptedBy || updatePayload.helperId;
      body.acceptedBy = helperIdVal ? getValidObjectId(helperIdVal) : null;
    }

    const response = await apiClient.put(`/api/requests/${id}`, body);
    const rawData = response.data?.data || response.data;
    const transformed = transformBackendRequest(rawData);
    if (!transformed) {
      throw new Error('Failed to parse updated request response');
    }
    return transformed;
  },

  // DELETE /api/requests/:id
  deleteRequest: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/api/requests/${id}`);
    return response.data;
  },
};

/**
 * Skill Module API Services
 */
export const skillApi = {
  // GET /api/skills
  getAllSkills: async (): Promise<SkillOffer[]> => {
    const response = await apiClient.get('/api/skills');
    const rawList = response.data?.data || response.data || [];
    if (!Array.isArray(rawList)) return [];
    return rawList.map(transformBackendSkill).filter((s): s is SkillOffer => s !== null);
  },

  // GET /api/skills/:id
  getSkillById: async (id: string): Promise<SkillOffer | null> => {
    const response = await apiClient.get(`/api/skills/${id}`);
    const rawData = response.data?.data || response.data;
    return transformBackendSkill(rawData);
  },

  // POST /api/skills
  createSkill: async (payload: any): Promise<SkillOffer> => {
    const body = {
      user: getValidObjectId(payload.userId),
      title: payload.title,
      category: payload.category,
      description: payload.description,
      availability: payload.availability || 'Flexible',
      isActive: true,
    };

    const response = await apiClient.post('/api/skills', body);
    const rawData = response.data?.data || response.data;
    const transformed = transformBackendSkill(rawData);
    if (!transformed) throw new Error('Failed to parse created skill response');
    return transformed;
  },

  // PUT /api/skills/:id
  updateSkill: async (id: string, updatePayload: any): Promise<SkillOffer> => {
    const body: Record<string, any> = {};
    if (updatePayload.title !== undefined) body.title = updatePayload.title;
    if (updatePayload.category !== undefined) body.category = updatePayload.category;
    if (updatePayload.description !== undefined) body.description = updatePayload.description;
    if (updatePayload.availability !== undefined) body.availability = updatePayload.availability;
    if (updatePayload.isActive !== undefined) body.isActive = updatePayload.isActive;

    const response = await apiClient.put(`/api/skills/${id}`, body);
    const rawData = response.data?.data || response.data;
    const transformed = transformBackendSkill(rawData);
    if (!transformed) throw new Error('Failed to parse updated skill response');
    return transformed;
  },

  // DELETE /api/skills/:id
  deleteSkill: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/api/skills/${id}`);
    return response.data;
  },
};

/**
 * Message Module API Services
 */
export const messageApi = {
  // GET /api/messages/:requestId?userId=xxx
  getMessagesByRequestId: async (requestId: string, userId?: string): Promise<ChatMessage[]> => {
    const params = userId ? { userId } : {};
    const response = await apiClient.get(`/api/messages/${requestId}`, { params });
    const rawList = response.data?.data || response.data || [];
    if (!Array.isArray(rawList)) return [];
    return rawList.map(transformBackendMessage).filter((m): m is ChatMessage => m !== null);
  },

  // POST /api/messages
  sendMessage: async (payload: { requestId: string; senderId: string; receiverId: string; message: string }): Promise<ChatMessage> => {
    const body = {
      requestId: payload.requestId,
      senderId: getValidObjectId(payload.senderId),
      receiverId: getValidObjectId(payload.receiverId),
      message: payload.message,
    };
    const response = await apiClient.post('/api/messages', body);
    const rawData = response.data?.data || response.data;
    const transformed = transformBackendMessage(rawData);
    if (!transformed) throw new Error('Failed to parse sent message response');
    return transformed;
  },
};

export default apiClient;
