import api from '@/app/lib/api';

export const authService = {
  signup: (body) => api.post('/api/auth/signup', body),

  login: (body) => api.post('/api/auth/login', body),

  verifyOtp: (body, role = 'institution') =>
    api.post(`/api/auth/verify-otp?role=${role}`, body),

  setup2fa: () => api.get('/api/auth/setup-2fa'),

  confirm2fa: (body) => api.post('/api/auth/confirm-2fa', body),

  verify2fa: (body) => api.post('/api/auth/verify-2fa', body),

  refresh: () => api.post('/api/auth/refresh'),

  logout: () => api.post('/api/auth/logout'),

  googleAuthUrl: (role = 'institution') =>
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}/api/auth/google?role=${role}`,

  // Uses the refreshToken cookie set by the backend during OAuth — no body/param needed
  googleSession: () => api.get('/api/auth/google/session'),

  getMe: () => api.get('/api/auth/me'),

  disable2FA: (body) => api.post('/api/auth/2fa/disable', body),

  changePassword: (body) => api.post('/api/auth/change-password', body),
};
