import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/payments/`;

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

export const paymentService = {
  getPayments: async () => {
    const response = await apiClient.get('');
    return response.data;
  },

  createCheckoutSession: async (bookingId) => {
    const response = await apiClient.post('create_checkout_session/', { booking_id: bookingId });
    return response.data;
  }
};
