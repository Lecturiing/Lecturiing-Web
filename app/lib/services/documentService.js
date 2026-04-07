import api from '@/app/lib/api';

export const documentService = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/documents${qs ? `?${qs}` : ''}`);
  },

  get: (id) => api.get(`/api/documents/${id}`),

  upload: (formData) => api.post('/api/documents', formData),

  update: (id, body) => api.patch(`/api/documents/${id}`, body),

  delete: (id) => api.delete(`/api/documents/${id}`),
};
