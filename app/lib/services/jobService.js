import api from '@/app/lib/api';

export const jobService = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/jobs${qs ? `?${qs}` : ''}`);
  },

  get: (id) => api.get(`/api/jobs/${id}`),

  create: (body) => api.post('/api/jobs', body),

  update: (id, body) => api.patch(`/api/jobs/${id}`, body),

  delete: (id) => api.delete(`/api/jobs/${id}`),

  getApplicants: (id, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/jobs/${id}/applicants${qs ? `?${qs}` : ''}`);
  },

  linkDocuments: (id, documentIds) =>
    api.patch(`/api/jobs/${id}/documents`, { documentIds }),
};
