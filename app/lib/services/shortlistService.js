import api from '@/app/lib/api';

export const shortlistService = {
  list: () => api.get('/api/shortlist'),

  add: (body) => api.post('/api/shortlist', body),

  remove: (id) => api.delete(`/api/shortlist/${id}`),

  update: (id, body) => api.patch(`/api/shortlist/${id}`, body),

  scheduleInterview: (id, body) => api.post(`/api/shortlist/${id}/schedule`, body),
};
