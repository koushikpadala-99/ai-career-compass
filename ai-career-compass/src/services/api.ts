// API Service - Connects frontend to Django backend
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        
        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTH APIs
// ============================================

export const authAPI = {
  // Register new user
  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register/', {
      username,
      email,
      password,
    });
    return response.data;
  },

  // Login user
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login/', {
      email,
      password,
    });
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: any) => {
    const response = await api.put('/auth/profile/', data);
    return response.data;
  },
};

// ============================================
// CAREER APIs
// ============================================

export const careerAPI = {
  // Get all careers
  getAllCareers: async () => {
    const response = await api.get('/careers/list/');
    return response.data;
  },

  // Analyze user interests and get matched careers
  analyzeInterests: async (text: string, quizAnswers: any = {}, useLLM: boolean = false) => {
    const response = await api.post('/careers/analyze/', {
      text,
      quiz_answers: quizAnswers,
      use_llm: useLLM,
    });
    return response.data;
  },

  // Get saved careers
  getSavedCareers: async () => {
    const response = await api.get('/careers/saved/');
    return response.data;
  },

  // Save or unsave a career
  toggleSaveCareer: async (careerId: string) => {
    const response = await api.post('/careers/saved/', {
      career_id: careerId,
    });
    return response.data;
  },

  // Generate personalized roadmap
  generateRoadmap: async (careerId: string, useLLM: boolean = false) => {
    const response = await api.post('/careers/roadmap/generate/', {
      career_id: careerId,
      use_llm: useLLM,
    });
    return response.data;
  },

  // Get analysis history
  getAnalysisHistory: async () => {
    const response = await api.get('/careers/history/');
    return response.data;
  },
};

export default api;
