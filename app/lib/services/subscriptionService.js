import api from '@/app/lib/api';

export const subscriptionService = {
  get: () => api.get('/api/subscription'),
  upgrade: (plan, currency = 'USD') => api.post('/api/subscription/upgrade', { plan, currency }),
};
