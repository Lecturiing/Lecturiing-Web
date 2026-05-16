'use client';

import { useState, useEffect } from 'react';
import styles from './OffersPage.module.css';
import { offerService } from '@/app/lib/services/offerService';
import { documentService } from '@/app/lib/services/documentService';

const STATUS_TABS = ['All', 'Pending', 'Approved', 'Declined'];
const TAB_MAP = { All: null, Pending: 'pending', Approved: 'approved', Declined: 'declined' };

const STATUS_META = {
  pending:  { label: 'Pending Response', bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  approved: { label: 'Offer Approved',   bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  declined: { label: 'Offer Declined',   bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [tab, setTab] = useState('All');
  const [sendModal, setSendModal] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [sentState, setSentState] = useState({});
  const [availableDocs, setAvailableDocs] = useState([]);

  useEffect(() => {
    offerService.list()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setOffers(list.map((o) => ({
          ...o,
          lecturerName: o.lecturer?.name ?? o.lecturerName ?? '—',
          lecturerInitials: o.lecturer?.initials ?? o.lecturerInitials ?? '?',
          lecturerColor: o.lecturer?.color ?? o.lecturerColor ?? '#4f46e5',
          country: o.lecturer?.country ?? o.country,
          qualification: o.lecturer?.qualification ?? o.qualification,
          rating: o.lecturer?.rating ?? o.rating,
          jobTitle: o.job?.title ?? o.jobTitle ?? '—',
          offeredAt: o.offeredAt
            ? new Date(o.offeredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—',
        })));
      })
      .catch(() => {});
    documentService.list()
      .then((data) => setAvailableDocs(Array.isArray(data) ? data : (data?.documents ?? [])))
      .catch(() => {});
  }, []);

  const openSendModal = (offer) => {
    const jobDocs = offer.sentDocumentIds ?? [];
    setSendModal(offer);
    setSelectedDocs(jobDocs);
  };

  const toggleDoc = (docId) => {
    setSelectedDocs((prev) =>
      prev.includes(docId) ? prev.filter((d) => d !== docId) : [...prev, docId]
    );
  };

  const sendDocs = async () => {
    if (!sendModal || selectedDocs.length === 0) return;
    try { await offerService.sendDocuments(sendModal.id, selectedDocs); } catch (_) {}
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
          const sent = sentState[offer.id] ?? offer.sentDocumentIds ?? [];
          const signed = offer.signedDocumentIds ?? [];
          const allSigned = sent.length > 0 && sent.every((d) => signed.includes(d));
          const hasHellosign = !!offer.hellosignRequestId;

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
                  {(offer.country || offer.qualification || offer.rating) && (
                    <div className={styles.cardMeta}>
                      {offer.country && <span>{offer.country}</span>}
                      {offer.qualification && <><span>·</span><span>{offer.qualification}</span></>}
                      {offer.rating && <><span>·</span><span>★ {offer.rating}</span></>}
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
                  <p className={styles.responseNote}>The candidate has been notified and can approve or decline from their portal.</p>
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
                    ) : allSigned ? (
                      <span className={styles.sentBadge} style={{ background: '#d1fae5', color: '#065f46' }}>
                        ✓ All Signed
                      </span>
                    ) : hasHellosign ? (
                      <span className={styles.sentBadge} style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                        ✍ Signing via HelloSign
                      </span>
                    ) : (
                      <span className={styles.sentBadge}>
                        ⏳ Awaiting Signatures
                      </span>
                    )}
                  </div>

                  {sent.length > 0 && (
                    <div className={styles.docList}>
                      {sent.map((docId) => {
                        const doc = availableDocs.find((d) => d.id === docId);
                        const isSigned = signed.includes(docId);
                        return (
                          <div key={docId} className={styles.docRow}>
                            <span className={styles.docName}>{doc?.title ?? docId}</span>
                            <span className={`${styles.docStatus} ${isSigned ? styles.docSigned : styles.docPending}`}>
                              {isSigned ? '✓ Signed' : '⏳ Pending'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Send Documents Modal ── */}
      {sendModal && (() => {
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
                {availableDocs.length === 0 && (
                  <p className={styles.noDocsNote}>No documents in library. Add documents via the Doc Library first.</p>
                )}
                {availableDocs.map((doc) => (
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
