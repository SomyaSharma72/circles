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

export const getFavorRequests = async (params?: Record<string, any>) => {
  const res = await api.get('/requests', { params });
  return res.data;
};

export const getCommunityMetrics = async () => {
  const res = await api.get('/metrics');
  return res.data;
};

export const searchFavorRequests = async (query: string) => {
  const res = await api.get('/requests/search', { params: { query } });
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

export const updateFavorStatus = async (id: string, status: string) => {
  const res = await api.patch(`/requests/${id}/status`, { status });
  return res.data;
};

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

export const getUserById = async (userId: string) => {
  const res = await api.get(`/auth/user/${userId}`);
  return res.data;
};

export default api;
