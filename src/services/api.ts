import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('neighborly_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage = error.response?.data?.error || error.message || 'An unexpected server error occurred.';
    return Promise.reject(new Error(customMessage));
  }
);

// Favor Requests
export const getFavorRequests = async (params?: Record<string, any>) => {
  const res = await api.get('/requests', { params });
  return res.data;
};

export const getCommunityMetrics = async () => {
  const res = await api.get('/metrics');
  return res.data;
};

export const searchFavorRequests = async (query: string) => {
  const res = await api.get('/requests/search', { params: { search: query, query } });
  return res.data;
};

export const getFavorRequestById = async (id: string) => {
  const res = await api.get(`/requests/${id}`);
  return res.data;
};

export const createFavorRequest = async (data: Record<string, any>) => {
  const res = await api.post('/requests', data);
  return res.data;
};

export const respondToFavorRequest = async (id: string) => {
  const res = await api.post(`/requests/${id}/respond`);
  return res.data;
};

export const acceptFavorRequest = async (id: string) => {
  const res = await api.post(`/requests/${id}/accept`);
  return res.data;
};

export const completeFavorRequest = async (id: string) => {
  const res = await api.post(`/requests/${id}/complete`);
  return res.data;
};

export const updateFavorStatus = async (id: string, status: string) => {
  const res = await api.patch(`/requests/${id}/status`, { status });
  return res.data;
};

// Reviews & Ratings
export const submitReview = async (data: {
  requestId: string;
  revieweeId: string;
  rating: number;
  comment: string;
}) => {
  const res = await api.post('/reviews', data);
  return res.data;
};

export const getReviewsByRequest = async (requestId: string) => {
  const res = await api.get(`/reviews/request/${requestId}`);
  return res.data;
};

export const getUserReviews = async (userId: string) => {
  const res = await api.get(`/reviews/user/${userId}`);
  return res.data;
};

// Messages & Conversations
export const getUserConversations = async () => {
  const res = await api.get('/messages/conversations');
  return res.data;
};

export const getRequestMessages = async (requestId: string) => {
  const res = await api.get(`/messages/${requestId}`);
  return res.data;
};

export const sendMessage = async (requestId: string, text: string, receiverId?: string) => {
  const res = await api.post('/messages', { requestId, text, receiverId });
  return res.data;
};

// Community Groups / Circles
export const getCommunityGroups = async (params?: { category?: string; query?: string; lat?: number; lng?: number }) => {
  const res = await api.get('/groups', { params });
  return res.data;
};

export const getCommunityGroupById = async (id: string) => {
  const res = await api.get(`/groups/${id}`);
  return res.data;
};

export const createCommunityGroup = async (data: {
  name: string;
  description?: string;
  category?: string;
  neighborhood?: string;
  icon?: string;
  privacy?: 'Public' | 'Approval Required';
  coordinates?: [number, number];
}) => {
  const res = await api.post('/groups', data);
  return res.data;
};

export const joinCommunityGroup = async (id: string) => {
  const res = await api.post(`/groups/${id}/join`);
  return res.data;
};

export const leaveCommunityGroup = async (id: string) => {
  const res = await api.post(`/groups/${id}/leave`);
  return res.data;
};

export const deleteCommunityGroup = async (id: string) => {
  const res = await api.delete(`/groups/${id}`);
  return res.data;
};

export const getGroupMessages = async (id: string) => {
  const res = await api.get(`/groups/${id}/messages`);
  return res.data;
};

export const sendGroupMessage = async (id: string, text: string) => {
  const res = await api.post(`/groups/${id}/messages`, { text });
  return res.data;
};

// Aliases for Circles
export const getCircles = getCommunityGroups;
export const getCircleById = getCommunityGroupById;
export const createCircle = createCommunityGroup;
export const joinCircle = joinCommunityGroup;
export const leaveCircle = leaveCommunityGroup;
export const deleteCircle = deleteCommunityGroup;
export const getCircleMessages = getGroupMessages;
export const sendCircleMessage = sendGroupMessage;

// Auth & Users
export const getUserById = async (userId: string) => {
  const res = await api.get(`/auth/user/${userId}`);
  return res.data;
};

export const updateProfile = async (data: Record<string, any>) => {
  const res = await api.put('/auth/profile', data);
  return res.data;
};

export const completeProfileSetup = async (data: Record<string, any>) => {
  const res = await api.post('/auth/profile-setup', { ...data, profileCompleted: true });
  return res.data;
};

export const blockUser = async (userId: string) => {
  const res = await api.post(`/auth/block/${userId}`);
  return res.data;
};

export const unblockUser = async (userId: string) => {
  const res = await api.post(`/auth/unblock/${userId}`);
  return res.data;
};

export const getBlockedUsers = async () => {
  const res = await api.get('/auth/blocked');
  return res.data;
};

export const searchNeighbors = async (query: string) => {
  const res = await api.get('/auth/neighbors/search', { params: { query, search: query } });
  return res.data;
};

export const getAllNeighbors = async () => {
  const res = await api.get('/auth/neighbors');
  return res.data;
};

export default api;
