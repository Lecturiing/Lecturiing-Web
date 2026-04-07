import api from '@/app/lib/api';

export const contractService = {
  list: () => api.get('/api/contracts'),

  get: (id) => api.get(`/api/contracts/${id}`),

  create: (body) => api.post('/api/contracts', body),

  updateStatus: (id, status) =>
    api.patch(`/api/contracts/${id}/status`, { status }),

  initiateEscrow: (id, amount) =>
    api.post(`/api/contracts/${id}/escrow`, { amount }),

  releaseEscrow: (id) =>
    api.patch(`/api/contracts/${id}/escrow/release`, {}),

  disputeEscrow: (id, reason) =>
    api.patch(`/api/contracts/${id}/escrow/dispute`, { reason }),
};
