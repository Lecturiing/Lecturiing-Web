import api from '@/app/lib/api';

export const lecturerService = {
  search: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/lecturers${qs ? `?${qs}` : ''}`);
  },

  get: (id) => api.get(`/api/lecturers/${id}`),
};
