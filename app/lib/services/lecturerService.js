import api from '@/app/lib/api';

export const lecturerService = {
  search: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/lecturers${qs ? `?${qs}` : ''}`);
  },

  get: (id) => api.get(`/api/lecturers/${id}`),

  browseJobs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/lecturers/jobs${qs ? `?${qs}` : ''}`);
  },

  getSavedJobs: () => api.get('/api/lecturers/saved'),
  saveJob: (jobId) => api.post(`/api/lecturers/saved/${jobId}`, {}),
  unsaveJob: (jobId) => api.delete(`/api/lecturers/saved/${jobId}`),
};
