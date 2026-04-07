'use client';

import { useState, useEffect } from 'react';
import styles from './HiredPage.module.css';
import { hiredService } from '@/app/lib/services/hiredService';
import { documentService } from '@/app/lib/services/documentService';

const STATUS_META = {
  active:        { label: 'Active',         bg: '#d1fae5', color: '#059669' },
  starting_soon: { label: 'Starting Soon',  bg: '#dbeafe', color: '#1d4ed8' },
  completed:     { label: 'Completed',      bg: '#f3f4f6', color: '#6b7280' },
};

export default function HiredPage() {
  const [hiredList, setHiredList] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [viewDoc, setViewDoc] = useState(null);

  useEffect(() => {
    hiredService.list()
      .then((data) => setHiredList(Array.isArray(data) ? data : []))
      .catch(() => {});
    documentService.list()
      .then((data) => setAllDocs(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className={styles.page}>
      {/* ── Summary ── */}
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryNum}>{hiredList.length}</span>
          <span className={styles.summaryLabel}>Total Hired</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryNum}>{hiredList.filter((h) => h.status === 'active').length}</span>
          <span className={styles.summaryLabel}>Currently Active</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryNum}>
            {hiredList.reduce((acc, h) => acc + (h.signedDocumentIds?.length ?? 0), 0)}
          </span>
          <span className={styles.summaryLabel}>Signed Documents</span>
        </div>
      </div>

      {/* ── Hired List ── */}
      <div className={styles.list}>
        {hiredList.length === 0 && (
          <div className={styles.empty}>
            <p>No hired lecturers yet.</p>
            <p className={styles.emptyNote}>Once a candidate signs their contract documents, they will appear here.</p>
          </div>
        )}

        {hiredList.map((hire) => {
          const sm = STATUS_META[hire.status] ?? STATUS_META.completed;
          const signedDocs = allDocs.filter((d) => (hire.signedDocumentIds ?? []).includes(d.id));
          const isOpen = expanded === hire.id;

          return (
            <div key={hire.id} className={`${styles.card} ${isOpen ? styles.cardOpen : ''}`}>
              {/* ── Card Header ── */}
              <div className={styles.cardHeader} onClick={() => toggle(hire.id)}>
                <div className={styles.avatar} style={{ background: hire.lecturerColor }}>
                  {hire.lecturerInitials}
                </div>
                <div className={styles.headerInfo}>
                  <div className={styles.headerTop}>
                    <h3 className={styles.lecturerName}>{hire.lecturerName}</h3>
                    <span className={styles.statusBadge} style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
                  </div>
                  <p className={styles.jobTitle}>{hire.jobTitle}</p>
                  <div className={styles.metaRow}>
                      {hire.country && <><span>📍 {hire.country}</span><span>·</span></>}
                      {hire.qualification && <><span>🎓 {hire.qualification}</span><span>·</span></>}
                      <span>⚡ {hire.contractType}</span>
                      <span>·</span>
                      <span className={styles.rateChip}>${hire.hourlyRate}/hr</span>
                    </div>
                </div>
                <div className={styles.headerRight}>
                  <div className={styles.signedCount}>
                    <span className={styles.signedNum}>{(hire.signedDocumentIds ?? []).length}</span>
                    <span className={styles.signedLabel}>docs signed</span>
                  </div>
                  <span className={styles.chevron}>{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* ── Expanded: Terms + Signed Documents ── */}
              {isOpen && (
                <div className={styles.expandedBody}>
                  {/* Contract Terms */}
                  <div className={styles.termsSection}>
                    <h4 className={styles.sectionTitle}>Contract Terms</h4>
                    <div className={styles.termsGrid}>
                      <div className={styles.termItem}>
                        <span className={styles.termLabel}>Start Date</span>
                        <span className={styles.termValue}>{hire.startDate}</span>
                      </div>
                      <div className={styles.termItem}>
                        <span className={styles.termLabel}>End Date</span>
                        <span className={styles.termValue}>{hire.endDate}</span>
                      </div>
                      <div className={styles.termItem}>
                        <span className={styles.termLabel}>Contract Type</span>
                        <span className={styles.termValue}>{hire.contractType}</span>
                      </div>
                      <div className={styles.termItem}>
                        <span className={styles.termLabel}>Rate</span>
                        <span className={styles.termValue}>${hire.rate} {hire.currency}/hr</span>
                      </div>
                      <div className={styles.termItem}>
                        <span className={styles.termLabel}>Hired Date</span>
                        <span className={styles.termValue}>{hire.hiredAt}</span>
                      </div>
                      <div className={styles.termItem}>
                        <span className={styles.termLabel}>Status</span>
                        <span className={styles.termValue} style={{ color: sm.color, fontWeight: 700 }}>{sm.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Signed Documents */}
                  <div className={styles.docsSection}>
                    <h4 className={styles.sectionTitle}>Signed Documents</h4>
                    <div className={styles.docList}>
                      {signedDocs.map((doc) => {
                        const cc = { Contract: '#4f46e5', NDA: '#1d4ed8', IP: '#059669', Policy: '#d97706' }[doc.category] ?? '#6b7280';
                        return (
                          <div key={doc.id} className={styles.docRow}>
                            <div className={styles.docLeft}>
                              <div className={styles.docIcon}><DocIcon /></div>
                              <div>
                                <p className={styles.docName}>{doc.title}</p>
                                <p className={styles.docMeta}>{doc.category} · {doc.pages} pages</p>
                              </div>
                            </div>
                            <div className={styles.docRight}>
                              <span className={styles.signedBadge}>✓ Signed</span>
                              <button className={styles.viewDocBtn} onClick={() => setViewDoc(doc)}>View</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Document Viewer Modal ── */}
      {viewDoc && (
        <div className={styles.modalOverlay} onClick={() => setViewDoc(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>{viewDoc.title}</h2>
                <p className={styles.modalSub}>{viewDoc.category} · {viewDoc.pages} pages · Signed ✓</p>
              </div>
              <button className={styles.modalClose} onClick={() => setViewDoc(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.signedStamp}>
                <span className={styles.stampIcon}>✓</span>
                <div>
                  <p className={styles.stampTitle}>Digitally Signed</p>
                  <p className={styles.stampSub}>This document has been signed by all parties and is legally binding.</p>
                </div>
              </div>
              <div className={styles.previewDoc}>
                <div className={styles.previewDocHeader}>
                  <p className={styles.previewDocTitle}>{viewDoc.title}</p>
                  <p className={styles.previewDocSub}>Lecturiing Institution Platform · Signed Copy</p>
                </div>
                <div className={styles.previewDocBody}>
                  <p><strong>1. Parties</strong><br />This agreement is entered into between the Institution ("Employer") and the Lecturer ("Contractor") as identified in the offer letter attached hereto.</p>
                  <p><strong>2. Scope of Engagement</strong><br />The Contractor agrees to deliver the services described in the associated Job Posting, including but not limited to curriculum delivery, student assessment, and related academic duties.</p>
                  <p><strong>3. Remuneration</strong><br />Compensation shall be paid as specified in the offer letter, subject to successful completion of deliverables and applicable tax withholdings.</p>
                  <p className={styles.previewEllipsis}>[ … {viewDoc.pages - 1} more pages ]</p>
                </div>
                <div className={styles.signatureSection}>
                  <div className={styles.sigBlock}>
                    <div className={styles.sigSigned}>Authorised Signature</div>
                    <p className={styles.sigLabel}>Institution Representative</p>
                    <p className={styles.sigDate}>Signed electronically</p>
                  </div>
                  <div className={styles.sigBlock}>
                    <div className={styles.sigSigned}>Lecturer Signature</div>
                    <p className={styles.sigLabel}>Lecturer</p>
                    <p className={styles.sigDate}>Signed electronically</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.downloadBtn}>⬇ Download Signed Copy</button>
              <button className={styles.modalClose2} onClick={() => setViewDoc(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}
