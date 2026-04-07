import api from '@/app/lib/api';

export const reviewService = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/reviews${qs ? `?${qs}` : ''}`);
  },

  create: (body) => api.post('/api/reviews', body),

  byLecturer: (lecturerId) => api.get(`/api/reviews/${lecturerId}`),
};
