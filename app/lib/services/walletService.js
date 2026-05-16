import api from '@/app/lib/api';

export const walletService = {
  get: () => api.get('/api/wallet'),

  transactions: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', params.page);
    if (params.pageSize) qs.set('pageSize', params.pageSize);
    if (params.category) qs.set('category', params.category);
    if (params.type) qs.set('type', params.type);
    if (params.lecturerId) qs.set('lecturerId', params.lecturerId);
    const query = qs.toString();
    return api.get(`/api/wallet/transactions${query ? `?${query}` : ''}`);
  },

  fund: (amount, currency) =>
    api.post('/api/wallet/fund', { amount, currency }),

  withdraw: (amount, currency, bankDetails) =>
    api.post('/api/wallet/withdraw', { amount, currency, bankDetails }),

  reimburse: (lecturerId, amount, currency, description) =>
    api.post('/api/wallet/reimburse', { lecturerId, amount, currency, description }),
};
