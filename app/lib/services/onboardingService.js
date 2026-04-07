import api from '@/app/lib/api';

export const onboardingService = {
  saveStep: (step, body) => api.patch(`/api/onboarding/${step}`, body),
};
