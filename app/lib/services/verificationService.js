import api from '@/app/lib/api';

export const verificationService = {
  getStatus: () => api.get('/api/verification'),

  submit: (formData) => api.post('/api/verification/submit', formData),

  resubmit: () => api.patch('/api/verification/resubmit', {}),
};
