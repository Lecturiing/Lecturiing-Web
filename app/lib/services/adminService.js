import api from '@/app/lib/api';

export const adminService = {
  // Stats & activity
  getStats: () => api.get('/api/admin/stats'),
  getActivity: (limit = 20) => api.get(`/api/admin/activity?limit=${limit}`),
  getAnalytics: () => api.get('/api/admin/analytics'),
  getModeration: () => api.get('/api/admin/moderation'),

  // Institutions
  listInstitutions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/admin/institutions${qs ? `?${qs}` : ''}`);
  },
  getInstitution: (id) => api.get(`/api/admin/institutions/${id}`),
  updateInstitutionStatus: (id, status, reason) =>
    api.patch(`/api/admin/institutions/${id}/status`, { status, reason }),
  updateJobStatus: (institutionId, jobId, status) =>
    api.patch(`/api/admin/institutions/${institutionId}/jobs/${jobId}/status`, { status }),
  deleteJob: (institutionId, jobId) =>
    api.delete(`/api/admin/institutions/${institutionId}/jobs/${jobId}`),
  getJobApplications: (institutionId, jobId) =>
    api.get(`/api/admin/institutions/${institutionId}/jobs/${jobId}/applications`),

  // Lecturers
  listLecturers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/admin/lecturers${qs ? `?${qs}` : ''}`);
  },
  getLecturer: (id) => api.get(`/api/admin/lecturers/${id}`),
  updateLecturerApproval: (id, approvalStatus, reason) =>
    api.patch(`/api/admin/lecturers/${id}/approval`, { approvalStatus, reason }),
  updateLecturerStatus: (id, status, reason) =>
    api.patch(`/api/admin/lecturers/${id}/status`, { status, reason }),

  // Verifications (institutions)
  listVerifications: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/admin/verifications${qs ? `?${qs}` : ''}`);
  },

  // Lecturer verifications
  listLecturerVerifications: () => api.get('/api/admin/lecturers/verifications'),
  reviewLecturerVerification: (lecturerId, approvalStatus) =>
    api.patch(`/api/admin/lecturers/${lecturerId}/approval`, { approvalStatus }),
  getVerificationDocs: (institutionId) =>
    api.get(`/api/admin/verifications/${institutionId}/documents`),
  reviewVerification: (institutionId, decision, note) =>
    api.patch(`/api/admin/verifications/${institutionId}`, { decision, note }),
};
