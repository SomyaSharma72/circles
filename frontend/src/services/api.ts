import axios from 'axios';
import { HelpRequest, SkillOffer } from '../types';

// API base URL configuration
const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // In remote preview environments (e.g. Cloud Run iframe), relative path should be used to hit the Express server
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      return '';
    }
  }
  return envUrl || '';
};

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

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

export default apiClient;

