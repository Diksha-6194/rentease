import axios from 'axios';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/properties/`,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const propertyService = {
  getAllProperties: async (params) => {
    const response = await apiClient.get('', { params });
    return response.data;
  },

  getPropertyById: async (id) => {
    const response = await apiClient.get(`${id}/`);
    return response.data;
  },

  createProperty: async (formData) => {
    const response = await apiClient.post('', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProperty: async (id, formData) => {
    const response = await apiClient.put(`${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProperty: async (id) => {
    const response = await apiClient.delete(`${id}/`);
    return response.data;
  },
};
