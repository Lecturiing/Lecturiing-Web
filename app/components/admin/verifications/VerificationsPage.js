'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './VerificationsPage.module.css';
import { adminService } from '@/app/lib/services/adminService';

const DOC_LABEL_MAP = {
  registration: 'Certificate of Incorporation / Registration',
  taxId: 'Tax Identification Certificate',
  authorizedId: 'Authorized Signatory ID',
  proofOfAddress: 'Proof of Address',
  letterhead: 'Official Letterhead Sample',
};

function docLabel(raw) {
  return DOC_LABEL_MAP[raw] || raw;
}

const TABS = ['Pending Review', 'Approved', 'Rejected'];
const SECTION_TABS = ['Institutions', 'Lecturers'];

export default function VerificationsPage() {
  const [activeSection, setActiveSection] = useState('Institutions');
  const [activeTab, setActiveTab] = useState('Pending Review');
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState(null);

  useEffect(() => {
    adminService.listVerifications()
      .then((data) => setInstitutions(Array.isArray(data) ? data : (data?.institutions ?? [])))
      .catch(() => {});
    adminService.listLecturerVerifications()
      .then((data) => setLecturers(Array.isArray(data?.lecturers) ? data.lecturers : []))
      .catch(() => {});
  }, []);

  const selectInstitution = (inst) => {
    setSelectedInstitution(inst);
    setSelectedDocs([]);
    setLoadingDocs(true);
    adminService.getVerificationDocs(inst.id)
      .then((docs) => setSelectedDocs(Array.isArray(docs) ? docs : []))
      .catch(() => setSelectedDocs([]))
      .finally(() => setLoadingDocs(false));
  };

  const filterByTab = (tab) => {
    if (tab === 'Pending Review') return institutions.filter((i) => i.verificationStatus === 'in_review');
    if (tab === 'Approved') return institutions.filter((i) => i.verificationStatus === 'verified');
    if (tab === 'Rejected') return institutions.filter((i) => i.verificationStatus === 'failed');
    return institutions;
  };

  const filtered = filterByTab(activeTab);
  const pendingCount = institutions.filter((i) => i.verificationStatus === 'in_review').length;

  const handleApprove = async (instId) => {
    try { await adminService.reviewVerification(instId, 'verified'); } catch (_) {}
    setInstitutions((prev) => prev.map((i) => i.id === instId ? { ...i, verificationStatus: 'verified' } : i));
    setSelectedInstitution(null);
  };

  const handleReject = async (instId) => {
    try { await adminService.reviewVerification(instId, 'failed'); } catch (_) {}
    setInstitutions((prev) => prev.map((i) => i.id === instId ? { ...i, verificationStatus: 'failed' } : i));
    setSelectedInstitution(null);
  };

  const handleApproveLecturer = async (lecturerId) => {
    try { await adminService.reviewLecturerVerification(lecturerId, 'approved'); } catch (_) {}
    setLecturers((prev) => prev.filter((l) => l.id !== lecturerId));
    setSelectedLecturer(null);
  };

  const handleRejectLecturer = async (lecturerId) => {
    try { await adminService.reviewLecturerVerification(lecturerId, 'rejected'); } catch (_) {}
    setLecturers((prev) => prev.filter((l) => l.id !== lecturerId));
    setSelectedLecturer(null);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Verifications</h2>
          <p className={styles.sub}>Review and approve verification requests</p>
        </div>
        {(pendingCount > 0 || lecturers.length > 0) && (
          <div className={styles.pendingAlert}>
            <span className={styles.pendingIcon}>⚠️</span>
            <span className={styles.pendingText}>
              {pendingCount + lecturers.length} request{(pendingCount + lecturers.length) !== 1 ? 's' : ''} awaiting review
            </span>
          </div>
        )}
      </div>

      {/* Section switcher */}
      <div className={styles.tabs} style={{ marginBottom: 0, borderBottom: 'none' }}>
        {SECTION_TABS.map((s) => (
          <button
            key={s}
            className={`${styles.tab} ${activeSection === s ? styles.tabActive : ''}`}
            onClick={() => { setActiveSection(s); setSelectedInstitution(null); setSelectedLecturer(null); }}
          >
            {s}
            {s === 'Lecturers' && lecturers.length > 0 && (
              <span className={styles.tabBadge}>{lecturers.length}</span>
            )}
            {s === 'Institutions' && pendingCount > 0 && (
              <span className={styles.tabBadge}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Status Tabs (institutions only) */}
      {activeSection === 'Institutions' && (
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
      )}

      {/* Lecturer Verification Content */}
      {activeSection === 'Lecturers' && (
        <div className={styles.content}>
          <div className={styles.listSection}>
            {lecturers.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>No pending lecturer verifications</p>
                <p className={styles.emptySub}>All lecturer requests have been processed.</p>
              </div>
            ) : (
              <div className={styles.cardList}>
                {lecturers.map((lect) => (
                  <div
                    key={lect.id}
                    className={`${styles.card} ${selectedLecturer?.id === lect.id ? styles.cardActive : ''}`}
                    onClick={() => setSelectedLecturer(lect)}
                  >
                    <div className={styles.cardLeft}>
                      <div className={styles.cardAvatar} style={{ background: lect.color ?? '#6C63FF' }}>
                        {lect.initials ?? lect.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div className={styles.cardInfo}>
                        <p className={styles.cardName}>{lect.name}</p>
                        <p className={styles.cardMeta}>{lect.field} · {lect.qualification}</p>
                        <p className={styles.cardDate}>{lect.email}</p>
                      </div>
                    </div>
                    <span className={styles.cardBadge}>Pending</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedLecturer && (
            <div className={styles.detailPanel}>
              <div className={styles.detailHeader}>
                <h3 className={styles.detailTitle}>Lecturer Details</h3>
                <button className={styles.closeBtn} onClick={() => setSelectedLecturer(null)}>✕</button>
              </div>
              <div className={styles.instDetail}>
                <div className={styles.instDetailAvatar} style={{ background: selectedLecturer.color ?? '#6C63FF' }}>
                  {selectedLecturer.initials ?? selectedLecturer.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className={styles.instDetailName}>{selectedLecturer.name}</p>
                  <p className={styles.instDetailMeta}>{selectedLecturer.field} · {selectedLecturer.qualification}</p>
                </div>
              </div>
              <div className={styles.detailSection}>
                <p className={styles.sectionLabel}>Contact</p>
                <div className={styles.contactGrid}>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>Email</span>
                    <a href={`mailto:${selectedLecturer.email}`} className={styles.contactLink}>{selectedLecturer.email}</a>
                  </div>
                  {selectedLecturer.country && (
                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Country</span>
                      <span className={styles.contactValue}>{selectedLecturer.country}</span>
                    </div>
                  )}
                  {selectedLecturer.yearsOfExperience && (
                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Experience</span>
                      <span className={styles.contactValue}>{selectedLecturer.yearsOfExperience} yrs</span>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.actions}>
                <button className={`${styles.actionBtn} ${styles.actionApprove}`} onClick={() => handleApproveLecturer(selectedLecturer.id)}>
                  ✓ Approve Verification
                </button>
                <button className={`${styles.actionBtn} ${styles.actionReject}`} onClick={() => handleRejectLecturer(selectedLecturer.id)}>
                  ✕ Reject Verification
                </button>
              </div>
              <Link href={`/admin/lecturers/${selectedLecturer.id}`} className={styles.viewFullLink}>
                View full lecturer profile →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Institution Content */}
      {activeSection === 'Institutions' && (
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
                  onClick={() => selectInstitution(inst)}
                >
                  <div className={styles.cardLeft}>
                    <div className={styles.cardAvatar} style={{ background: inst.avatarColor ?? inst.color }}>
                      {inst.initials}
                    </div>
                    <div className={styles.cardInfo}>
                      <p className={styles.cardName}>{inst.name}</p>
                      <p className={styles.cardMeta}>
                        {inst.type} · {inst.city}, {inst.country}
                      </p>
                      <p className={styles.cardDate}>Submitted {inst.submittedAt ?? inst.joinedAt}</p>
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
              <button className={styles.closeBtn} onClick={() => setSelectedInstitution(null)}>✕</button>
            </div>

            <div className={styles.instDetail}>
              <div className={styles.instDetailAvatar} style={{ background: selectedInstitution.avatarColor ?? selectedInstitution.color }}>
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
            {(selectedInstitution.contactName || selectedInstitution.contactEmail) && (
              <div className={styles.detailSection}>
                <p className={styles.sectionLabel}>Contact Information</p>
                <div className={styles.contactGrid}>
                  {selectedInstitution.contactName && (
                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Name</span>
                      <span className={styles.contactValue}>{selectedInstitution.contactName}</span>
                    </div>
                  )}
                  {selectedInstitution.contactEmail && (
                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Email</span>
                      <a href={`mailto:${selectedInstitution.contactEmail}`} className={styles.contactLink}>
                        {selectedInstitution.contactEmail}
                      </a>
                    </div>
                  )}
                  {selectedInstitution.contactPhone && (
                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Phone</span>
                      <span className={styles.contactValue}>{selectedInstitution.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Info */}
            {(selectedInstitution.website || selectedInstitution.linkedIn || selectedInstitution.verificationNotes) && (
              <div className={styles.detailSection}>
                <p className={styles.sectionLabel}>Additional Information</p>
                <div className={styles.contactGrid}>
                  {selectedInstitution.website && (
                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>Website</span>
                      <a href={selectedInstitution.website} target="_blank" rel="noreferrer" className={styles.contactLink}>
                        {selectedInstitution.website}
                      </a>
                    </div>
                  )}
                  {selectedInstitution.linkedIn && (
                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>LinkedIn</span>
                      <a href={selectedInstitution.linkedIn} target="_blank" rel="noreferrer" className={styles.contactLink}>
                        {selectedInstitution.linkedIn}
                      </a>
                    </div>
                  )}
                  {selectedInstitution.verificationNotes && (
                    <div className={styles.contactItem} style={{ gridColumn: '1 / -1' }}>
                      <span className={styles.contactLabel}>Notes</span>
                      <span className={styles.contactValue}>{selectedInstitution.verificationNotes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents */}
            <div className={styles.detailSection}>
              <p className={styles.sectionLabel}>Submitted Documents</p>
              {loadingDocs ? (
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Loading documents…</p>
              ) : selectedDocs.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No documents submitted yet.</p>
              ) : (
                <div className={styles.docsList}>
                  {selectedDocs.map((doc) => (
                    <button key={doc.id} className={styles.docRow} onClick={() => setViewingDoc(doc)}>
                      <span className={styles.docIcon}>📄</span>
                      <span className={styles.docName}>{docLabel(doc.label)}</span>
                      <span className={styles.docAction}>View →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedInstitution.verificationStatus === 'in_review' && (
              <div className={styles.actions}>
                <button className={`${styles.actionBtn} ${styles.actionApprove}`} onClick={() => handleApprove(selectedInstitution.id)}>
                  ✓ Approve Verification
                </button>
                <button className={`${styles.actionBtn} ${styles.actionReject}`} onClick={() => handleReject(selectedInstitution.id)}>
                  ✕ Reject Verification
                </button>
              </div>
            )}

            {selectedInstitution.verificationStatus === 'verified' && (
              <div className={styles.statusNote}>
                ✓ This institution was approved on {selectedInstitution.approvedAt ?? selectedInstitution.joinedAt}
              </div>
            )}

            {selectedInstitution.verificationStatus === 'failed' && (
              <div className={styles.statusNoteRed}>
                ✕ This institution was rejected. Contact them to resubmit.
              </div>
            )}

            <Link href={`/admin/institutions/${selectedInstitution.id}`} className={styles.viewFullLink}>
              View full institution profile →
            </Link>
          </div>
        )}
      </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div className={styles.modal} onClick={() => setViewingDoc(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{docLabel(viewingDoc.label ?? viewingDoc.name)}</h3>
              <button className={styles.modalClose} onClick={() => setViewingDoc(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {viewingDoc.fileUrl ? (
                viewingDoc.mimeType === 'application/pdf' ? (
                  <iframe
                    src={viewingDoc.fileUrl}
                    title={viewingDoc.label}
                    className={styles.previewIframe}
                  />
                ) : viewingDoc.mimeType?.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={viewingDoc.fileUrl} alt={viewingDoc.label} className={styles.previewImage} />
                ) : (
                  <div className={styles.docPreview}>
                    <span className={styles.docPreviewIcon}>📄</span>
                    <p className={styles.docPreviewText}>{viewingDoc.label}</p>
                    <a href={viewingDoc.fileUrl} target="_blank" rel="noreferrer" className={styles.downloadLink}>
                      Download to view
                    </a>
                  </div>
                )
              ) : (
                <div className={styles.docPreview}>
                  <span className={styles.docPreviewIcon}>📄</span>
                  <p className={styles.docPreviewText}>No file available</p>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalBtn} onClick={() => setViewingDoc(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
