import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/communication/`;

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const communicationService = {
  getConversations: async () => {
    const response = await apiClient.get('conversations/');
    return response.data;
  },

  createConversation: async (propertyId) => {
    const response = await apiClient.post('conversations/', { property: propertyId });
    return response.data;
  },

  getMessages: async (conversationId) => {
    const response = await apiClient.get(`conversations/${conversationId}/messages/`);
    return response.data;
  },

  sendMessage: async (conversationId, content) => {
    const response = await apiClient.post(`conversations/${conversationId}/send_message/`, { content });
    return response.data;
  },

  getNotifications: async () => {
    const response = await apiClient.get('notifications/');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await apiClient.patch(`notifications/${notificationId}/mark_read/`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.post('notifications/mark_all_read/');
    return response.data;
  }
};
