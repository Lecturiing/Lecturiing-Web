import api from '@/app/lib/api';

export const applicationService = {
  apply: (body) => api.post('/api/applications', body),

  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/applications${qs ? `?${qs}` : ''}`);
  },

  updateStatus: (id, status, extra = {}) =>
    api.patch(`/api/applications/${id}/status`, { status, ...extra }),
};
