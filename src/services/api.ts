// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: async (username: string, email: string, password: string, password2: string) => {
    const response = await api.post('/auth/register/', {
      username,
      email,
      password,
      password2,
    });
    return response.data;
  },

  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login/', {
      username,
      password,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout/');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },
};

// Dataset API
export const datasetAPI = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/datasets/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  list: async () => {
    const response = await api.get('/datasets/');
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get(`/datasets/${id}/`);
    return response.data;
  },

  getSummary: async (id: number) => {
    const response = await api.get(`/datasets/${id}/summary/`);
    return response.data;
  },

  getData: async (id: number, page = 1, pageSize = 100) => {
    const response = await api.get(`/datasets/${id}/data/`, {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/datasets/history/');
    return response.data;
  },

  generateReport: async (id: number) => {
    const response = await api.post(`/datasets/${id}/generate_report/`);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/datasets/${id}/`);
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  list: async () => {
    const response = await api.get('/reports/');
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get(`/reports/${id}/`);
    return response.data;
  },
};

export default api;