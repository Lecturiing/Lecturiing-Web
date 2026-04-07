import api from '@/app/lib/api';

export const notificationService = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/notifications${qs ? `?${qs}` : ''}`);
  },

  markRead: (id) => api.patch(`/api/notifications/${id}/read`, {}),

  markAllRead: () => api.patch('/api/notifications/read-all', {}),

  delete: (id) => api.delete(`/api/notifications/${id}`),
};
