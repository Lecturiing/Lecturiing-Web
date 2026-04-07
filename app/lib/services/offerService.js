import api from '@/app/lib/api';

export const offerService = {
  list: () => api.get('/api/offers'),

  create: (body) => api.post('/api/offers', body),

  updateStatus: (id, status) =>
    api.patch(`/api/offers/${id}/status`, { status }),

  sendDocuments: (id, documentIds) =>
    api.post(`/api/offers/${id}/send-documents`, { documentIds }),

  updateSignedDocuments: (id, signedDocumentIds) =>
    api.patch(`/api/offers/${id}/documents`, { signedDocumentIds }),
};
