import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/auth/`;

export const authService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}login/`, { email, password });
    if (response.data.access) {
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post(`${API_URL}register/`, userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
  },

  getProfile: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
      const response = await axios.get(`${API_URL}profile/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return null;
    }
  }
};
