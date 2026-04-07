import api from '@/app/lib/api';

export const hiredService = {
  list: () => api.get('/api/hired'),

  finalise: (contractId) => api.post('/api/hired', { contractId }),
};
