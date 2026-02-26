'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_INSTITUTIONS } from '@/app/lib/mockData';
import styles from './VerificationsPage.module.css';

const DOCUMENTS = [
  { id: 'doc1', name: 'Business Registration Certificate', icon: '📄' },
  { id: 'doc2', name: 'Tax Identification Document', icon: '🧾' },
  { id: 'doc3', name: 'Proof of Address', icon: '🏢' },
  { id: 'doc4', name: 'Director ID / Passport', icon: '🪪' },
  { id: 'doc5', name: 'Educational License / Accreditation', icon: '🎓' },
];

const TABS = ['Pending Review', 'Approved', 'Rejected'];

export default function VerificationsPage() {
  const [activeTab, setActiveTab] = useState('Pending Review');
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [institutions, setInstitutions] = useState(MOCK_INSTITUTIONS);

  const filterByTab = (tab) => {
    if (tab === 'Pending Review') return institutions.filter((i) => i.verificationStatus === 'in_review');
    if (tab === 'Approved') return institutions.filter((i) => i.verificationStatus === 'verified');
    if (tab === 'Rejected') return institutions.filter((i) => i.verificationStatus === 'failed');
    return institutions;
  };

  const filtered = filterByTab(activeTab);
  const pendingCount = institutions.filter((i) => i.verificationStatus === 'in_review').length;

  const handleApprove = (instId) => {
    setInstitutions((prev) =>
      prev.map((i) => (i.id === instId ? { ...i, verificationStatus: 'verified' } : i))
    );
    setSelectedInstitution(null);
  };

  const handleReject = (instId) => {
    setInstitutions((prev) =>
      prev.map((i) => (i.id === instId ? { ...i, verificationStatus: 'failed' } : i))
    );
    setSelectedInstitution(null);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Verifications</h2>
          <p className={styles.sub}>Review and approve institution verification requests</p>
        </div>
        {pendingCount > 0 && (
          <div className={styles.pendingAlert}>
            <span className={styles.pendingIcon}>⚠️</span>
            <span className={styles.pendingText}>
              {pendingCount} {pendingCount === 1 ? 'institution' : 'institutions'} awaiting review
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`}
            onClick={() => { setActiveTab(t); setSelectedInstitution(null); }}
          >
            {t}
            {t === 'Pending Review' && pendingCount > 0 && (
              <span className={styles.tabBadge}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* List */}
        <div className={styles.listSection}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No verifications here</p>
              <p className={styles.emptySub}>
                {activeTab === 'Pending Review' && 'All verification requests have been processed.'}
                {activeTab === 'Approved' && 'No approved verifications yet.'}
                {activeTab === 'Rejected' && 'No rejected verifications yet.'}
              </p>
            </div>
          ) : (
            <div className={styles.cardList}>
              {filtered.map((inst) => (
                <div
                  key={inst.id}
                  className={`${styles.card} ${selectedInstitution?.id === inst.id ? styles.cardActive : ''}`}
                  onClick={() => setSelectedInstitution(inst)}
                >
                  <div className={styles.cardLeft}>
                    <div className={styles.cardAvatar} style={{ background: inst.color }}>
                      {inst.initials}
                    </div>
                    <div className={styles.cardInfo}>
                      <p className={styles.cardName}>{inst.name}</p>
                      <p className={styles.cardMeta}>
                        {inst.type} · {inst.city}, {inst.country}
                      </p>
                      <p className={styles.cardDate}>Submitted {inst.joinedAt}</p>
                    </div>
                  </div>
                  {inst.verificationStatus === 'in_review' && (
                    <span className={styles.cardBadge}>Pending</span>
                  )}
                  {inst.verificationStatus === 'verified' && (
                    <span className={`${styles.cardBadge} ${styles.cardBadgeGreen}`}>Approved</span>
                  )}
                  {inst.verificationStatus === 'failed' && (
                    <span className={`${styles.cardBadge} ${styles.cardBadgeRed}`}>Rejected</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Panel */}
        {selectedInstitution && (
          <div className={styles.detailPanel}>
            <div className={styles.detailHeader}>
              <h3 className={styles.detailTitle}>Verification Documents</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedInstitution(null)}
              >
                ✕
              </button>
            </div>

            <div className={styles.instDetail}>
              <div className={styles.instDetailAvatar} style={{ background: selectedInstitution.color }}>
                {selectedInstitution.initials}
              </div>
              <div>
                <p className={styles.instDetailName}>{selectedInstitution.name}</p>
                <p className={styles.instDetailMeta}>
                  {selectedInstitution.type} · {selectedInstitution.city}, {selectedInstitution.country}
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className={styles.detailSection}>
              <p className={styles.sectionLabel}>Contact Information</p>
              <div className={styles.contactGrid}>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Name</span>
                  <span className={styles.contactValue}>{selectedInstitution.contact.name}</span>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Email</span>
                  <a href={`mailto:${selectedInstitution.contact.email}`} className={styles.contactLink}>
                    {selectedInstitution.contact.email}
                  </a>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Phone</span>
                  <span className={styles.contactValue}>{selectedInstitution.contact.phone}</span>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className={styles.detailSection}>
              <p className={styles.sectionLabel}>Submitted Documents</p>
              <div className={styles.docsList}>
                {DOCUMENTS.map((doc) => (
                  <button
                    key={doc.id}
                    className={styles.docRow}
                    onClick={() => setViewingDoc(doc)}
                  >
                    <span className={styles.docIcon}>{doc.icon}</span>
                    <span className={styles.docName}>{doc.name}</span>
                    <span className={styles.docAction}>View →</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            {selectedInstitution.verificationStatus === 'in_review' && (
              <div className={styles.actions}>
                <button
                  className={`${styles.actionBtn} ${styles.actionApprove}`}
                  onClick={() => handleApprove(selectedInstitution.id)}
                >
                  ✓ Approve Verification
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.actionReject}`}
                  onClick={() => handleReject(selectedInstitution.id)}
                >
                  ✕ Reject Verification
                </button>
              </div>
            )}

            {selectedInstitution.verificationStatus === 'verified' && (
              <div className={styles.statusNote}>
                ✓ This institution was approved on {selectedInstitution.joinedAt}
              </div>
            )}

            {selectedInstitution.verificationStatus === 'failed' && (
              <div className={styles.statusNoteRed}>
                ✕ This institution was rejected. Contact them to resubmit.
              </div>
            )}

            <Link
              href={`/admin/institutions/${selectedInstitution.id}`}
              className={styles.viewFullLink}
            >
              View full institution profile →
            </Link>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div className={styles.modal} onClick={() => setViewingDoc(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{viewingDoc.name}</h3>
              <button className={styles.modalClose} onClick={() => setViewingDoc(null)}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.docPreview}>
                <span className={styles.docPreviewIcon}>{viewingDoc.icon}</span>
                <p className={styles.docPreviewText}>Document preview</p>
                <p className={styles.docPreviewSub}>
                  In a real implementation, the document would be displayed here.
                </p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalBtn} onClick={() => setViewingDoc(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
