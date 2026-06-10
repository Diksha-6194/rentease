import axios from 'axios';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/bookings/`,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const bookingService = {
  getMyBookings: async () => {
    const response = await apiClient.get('');
    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await apiClient.post('', bookingData);
    return response.data;
  },

  updateBookingStatus: async (id, status) => {
    const response = await apiClient.patch(`${id}/update_status/`, { status });
    return response.data;
  }
};
