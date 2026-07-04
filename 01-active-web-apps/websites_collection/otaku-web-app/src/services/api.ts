import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/api/v1/auth/register', data),
  
  login: (data: { username: string; password: string }) => {
    // OAuth2PasswordRequestForm expects form data, not JSON
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);
    return api.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  
  getCurrentUser: () =>
    api.get('/api/v1/users/me'),
};

// User API
export const userAPI = {
  getMe: () => api.get('/api/v1/users/me'),
  
  getTier: () => api.get('/api/v1/users/tier'),
  
  upgrade: (paymentToken: string) =>
    api.post('/api/v1/users/upgrade', { payment_token: paymentToken }),
};

// Anime API
export const animeAPI = {
  getAll: () => api.get('/api/v1/anime'),
  
  getById: (id: string) => api.get(`/api/v1/anime/${id}`),
  
  create: (data: Record<string, unknown>) => api.post('/api/v1/anime', data),
  
  update: (id: string, data: Record<string, unknown>) => api.put(`/api/v1/anime/${id}`, data),
  
  delete: (id: string) => api.delete(`/api/v1/anime/${id}`),
};

// Scanner API
export const scannerAPI = {
  scan: (path: string) =>
    api.post('/api/v1/scanner/scan', { path }),
};

// Organizer API
export const organizerAPI = {
  organize: (animeId: string) =>
    api.post('/api/v1/organizer/organize', { anime_id: animeId }),
};

// Admin API
export const adminAPI = {
  listUsers: () => api.get('/api/v1/admin/users'),
  
  updateUserRole: (userId: string, role: string) =>
    api.patch(`/api/v1/admin/users/${userId}/role`, { role }),
  
  createUser: (data: {
    username: string;
    email: string;
    password: string;
    role: string;
    tier: string;
  }) => api.post('/api/v1/admin/users', data),
  
  deleteUser: (userId: string) => api.delete(`/api/v1/admin/users/${userId}`),
  
  getStats: () => api.get('/api/v1/admin/stats'),
};

// Posts API
export const postsAPI = {
  getAll: (status?: string) => {
    const params = status ? { status } : {};
    return api.get('/api/v1/posts', { params });
  },
  
  getById: (id: string) => api.get(`/api/v1/posts/${id}`),
  
  create: (data: {
    title: string;
    excerpt?: string;
    content: string;
    cover_image?: string;
    status: string;
    category?: string;
    tags?: string[];
  }) => api.post('/api/v1/posts', data),
  
  update: (id: string, data: {
    title?: string;
    excerpt?: string;
    content?: string;
    cover_image?: string;
    status?: string;
    category?: string;
    tags?: string[];
  }) => api.patch(`/api/v1/posts/${id}`, data),
  
  delete: (id: string) => api.delete(`/api/v1/posts/${id}`),
};

// Public Posts API (no auth required)
export const publicPostsAPI = {
  getAll: (category?: string, limit = 20, offset = 0) => {
    const params: Record<string, any> = { limit, offset };
    if (category) params.category = category;
    return api.get('/api/v1/posts/public/posts', { params });
  },
  
  getBySlug: (slug: string) => api.get(`/api/v1/posts/public/posts/${slug}`),
};

// Gamification API
export const gamificationAPI = {
  // Points
  getPoints: () => api.get('/api/v1/gamification/points'),
  
  trackActivity: (data: { activity_type: string; metadata?: Record<string, any> }) =>
    api.post('/api/v1/gamification/activity', data),
  
  // Quests
  getQuests: (questType?: string) => {
    const params = questType ? { quest_type: questType } : {};
    return api.get('/api/v1/gamification/quests', { params });
  },
  
  claimQuest: (questId: string) =>
    api.post(`/api/v1/gamification/quests/${questId}/claim`),
  
  // Collectibles
  getCollectibles: () => api.get('/api/v1/gamification/collectibles'),
  
  equipCollectible: (collectibleId: string) =>
    api.post(`/api/v1/gamification/collectibles/${collectibleId}/equip`),
  
  // Leaderboard
  getLeaderboard: (period = 'weekly', limit = 100) =>
    api.get('/api/v1/gamification/leaderboard', { params: { period, limit } }),
    
  // Gacha
  pullGacha: () => api.post('/api/v1/gamification/gacha/pull'),
};

export default api;
