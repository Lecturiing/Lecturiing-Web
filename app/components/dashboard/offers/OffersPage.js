'use client';

import { useState } from 'react';
import { MOCK_OFFERS, MOCK_CONTRACT_DOCS, MOCK_JOB_DOCS, MOCK_LECTURERS } from '@/app/lib/mockData';
import styles from './OffersPage.module.css';

const STATUS_TABS = ['All', 'Pending', 'Approved', 'Declined'];
const TAB_MAP = { All: null, Pending: 'pending', Approved: 'approved', Declined: 'declined' };

const STATUS_META = {
  pending:  { label: 'Pending Response', bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  approved: { label: 'Offer Approved',   bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  declined: { label: 'Offer Declined',   bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

export default function OffersPage() {
  const [offers, setOffers] = useState(MOCK_OFFERS);
  const [tab, setTab] = useState('All');
  const [sendModal, setSendModal] = useState(null); // offer object
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [sentState, setSentState] = useState({}); // offerId → sentDocs

  const updateOfferStatus = (id, status) => {
    setOffers((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  };

  const openSendModal = (offer) => {
    const jobDocs = MOCK_JOB_DOCS[offer.jobId] ?? [];
    setSendModal(offer);
    setSelectedDocs(jobDocs); // pre-select all linked docs
  };

  const toggleDoc = (docId) => {
    setSelectedDocs((prev) =>
      prev.includes(docId) ? prev.filter((d) => d !== docId) : [...prev, docId]
    );
  };

  const sendDocs = () => {
    if (!sendModal || selectedDocs.length === 0) return;
    setSentState((prev) => ({ ...prev, [sendModal.id]: selectedDocs }));
    setSendModal(null);
    setSelectedDocs([]);
  };

  const filtered = offers.filter((o) => {
    const s = TAB_MAP[tab];
    return s === null || o.status === s;
  });

  const counts = STATUS_TABS.reduce((acc, t) => {
    const s = TAB_MAP[t];
    acc[t] = s === null ? offers.length : offers.filter((o) => o.status === s).length;
    return acc;
  }, {});

  return (
    <div className={styles.page}>
      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {STATUS_TABS.map((t) => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {t} <span className={styles.tabCount}>{counts[t]}</span>
          </button>
        ))}
      </div>

      {/* ── Offer Cards ── */}
      <div className={styles.list}>
        {filtered.length === 0 && <p className={styles.empty}>No offers in this category.</p>}
        {filtered.map((offer) => {
          const sm = STATUS_META[offer.status];
          const lecturer = MOCK_LECTURERS.find((l) => l.id === offer.lecturerId);
          const jobDocIds = MOCK_JOB_DOCS[offer.jobId] ?? [];
          const sent = sentState[offer.id] ?? offer.sentDocs;
          const signed = offer.signedDocs;
          const allSigned = sent.length > 0 && sent.every((d) => signed.includes(d));

          return (
            <div key={offer.id} className={styles.card} style={{ borderColor: sm.border }}>
              {/* ── Card Header ── */}
              <div className={styles.cardHeader}>
                <div className={styles.avatar} style={{ background: offer.lecturerColor }}>
                  {offer.lecturerInitials}
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{offer.lecturerName}</h3>
                  <p className={styles.cardJob}>{offer.jobTitle}</p>
                  {lecturer && (
                    <div className={styles.cardMeta}>
                      <span>{lecturer.country}</span>
                      <span>·</span>
                      <span>{lecturer.qualification}</span>
                      <span>·</span>
                      <span>★ {lecturer.rating}</span>
                    </div>
                  )}
                </div>
                <div className={styles.cardRight}>
                  <span className={styles.statusBadge} style={{ background: sm.bg, color: sm.color }}>
                    {sm.label}
                  </span>
                  <span className={styles.offeredDate}>Offered {offer.offeredAt}</span>
                </div>
              </div>

              {/* ── Candidate Response Section ── */}
              {offer.status === 'pending' && (
                <div className={styles.responseBox} style={{ background: sm.bg }}>
                  <p className={styles.responseLabel}>Awaiting candidate response</p>
                  <p className={styles.responseNote}>The candidate has been notified via email and can approve or decline from their portal.</p>
                  <div className={styles.responseActions}>
                    <span className={styles.simulateNote}>Demo — simulate candidate action:</span>
                    <button className={styles.approveBtn} onClick={() => updateOfferStatus(offer.id, 'approved')}>✓ Candidate Approves</button>
                    <button className={styles.declineBtn} onClick={() => updateOfferStatus(offer.id, 'declined')}>✕ Candidate Declines</button>
                  </div>
                </div>
              )}

              {offer.status === 'declined' && (
                <div className={styles.responseBox} style={{ background: sm.bg }}>
                  <p className={styles.responseLabel} style={{ color: sm.color }}>Candidate declined this offer</p>
                  <p className={styles.responseNote}>You may resubmit a revised offer or move to another shortlisted candidate.</p>
                </div>
              )}

              {/* ── Approved: Contract Documents ── */}
              {offer.status === 'approved' && (
                <div className={styles.contractSection}>
                  <div className={styles.contractHeader}>
                    <div className={styles.contractTitle}>
                      <span className={styles.contractIcon}>📄</span>
                      <span>Contract Documents</span>
                    </div>
                    {sent.length === 0 ? (
                      <button className={styles.sendDocsBtn} onClick={() => openSendModal(offer)}>
                        Send for E-Signature
                      </button>
                    ) : (
                      <span className={styles.sentBadge}>
                        {allSigned ? '✓ All Signed' : '⏳ Awaiting Signatures'}
                      </span>
                    )}
                  </div>

                  {sent.length > 0 && (
                    <div className={styles.docList}>
                      {sent.map((docId) => {
                        const doc = MOCK_CONTRACT_DOCS.find((d) => d.id === docId);
                        if (!doc) return null;
                        const isSigned = signed.includes(docId);
                        return (
                          <div key={docId} className={styles.docRow}>
                            <span className={styles.docName}>{doc.title}</span>
                            <span className={`${styles.docStatus} ${isSigned ? styles.docSigned : styles.docPending}`}>
                              {isSigned ? '✓ Signed' : '⏳ Pending'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {sent.length === 0 && jobDocIds.length > 0 && (
                    <p className={styles.noDocsNote}>
                      {jobDocIds.length} document{jobDocIds.length !== 1 ? 's' : ''} linked to this job. Click "Send for E-Signature" to select and send.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Send Documents Modal ── */}
      {sendModal && (() => {
        const jobDocIds = MOCK_JOB_DOCS[sendModal.jobId] ?? [];
        const allJobDocs = MOCK_CONTRACT_DOCS.filter((d) => jobDocIds.includes(d.id));
        return (
          <div className={styles.modalOverlay} onClick={() => setSendModal(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Send Contract Documents</h2>
                <button className={styles.modalClose} onClick={() => setSendModal(null)}>✕</button>
              </div>
              <p className={styles.modalSub}>
                Select documents to send to <strong>{sendModal.lecturerName}</strong> for e-signature.
              </p>

              <div className={styles.modalDocList}>
                {allJobDocs.length === 0 && (
                  <p className={styles.noDocsNote}>No documents are linked to this job. Add documents via the Doc Library and link them in the job settings.</p>
                )}
                {allJobDocs.map((doc) => (
                  <label key={doc.id} className={`${styles.modalDocRow} ${selectedDocs.includes(doc.id) ? styles.modalDocSelected : ''}`}>
                    <input
                      type="checkbox"
                      className={styles.modalCheckbox}
                      checked={selectedDocs.includes(doc.id)}
                      onChange={() => toggleDoc(doc.id)}
                    />
                    <div className={styles.modalDocInfo}>
                      <p className={styles.modalDocTitle}>{doc.title}</p>
                      <p className={styles.modalDocMeta}>{doc.category} · {doc.pages} pages · Updated {doc.lastUpdated}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.modalCancel} onClick={() => setSendModal(null)}>Cancel</button>
                <button
                  className={styles.modalSend}
                  disabled={selectedDocs.length === 0}
                  onClick={sendDocs}
                >
                  Send {selectedDocs.length > 0 ? `${selectedDocs.length} ` : ''}Document{selectedDocs.length !== 1 ? 's' : ''} for E-Signature
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
