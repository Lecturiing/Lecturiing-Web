'use client';

import { useState, useRef } from 'react';
import styles from './VerificationPage.module.css';

const REQUIRED_DOCS = [
  {
    id: 'registration',
    label: 'Certificate of Incorporation / Registration',
    description: 'Official document proving the institution is legally registered.',
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    id: 'taxId',
    label: 'Tax Identification Certificate',
    description: 'TIN or equivalent tax registration document.',
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    id: 'authorizedId',
    label: 'Authorized Signatory ID',
    description: "Government-issued photo ID of the institution's authorized representative.",
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    id: 'proofOfAddress',
    label: 'Proof of Address',
    description: `Utility bill or official letter showing the institution's physical address (not older than 3 months).`,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    id: 'letterhead',
    label: 'Official Letterhead Sample',
    description: `A letter or document printed on the institution's official letterhead.`,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
];

// For demo purposes — change this to 'pending' | 'in_review' | 'reviewed' | 'failed'
const DEMO_STATUS = 'pending';
const DEMO_FAILURE_REASON =
  'The submitted Certificate of Incorporation appears to be expired. Please upload a current, valid document and resubmit.';

const STATUS_META = {
  pending: { label: 'Not Submitted', color: '#6b7280', bg: '#f3f4f6', icon: '○' },
  in_review: { label: 'In Review', color: '#d97706', bg: '#fffbeb', icon: '◉' },
  reviewed: { label: 'Verified', color: '#059669', bg: '#ecfdf5', icon: '✓' },
  failed: { label: 'Verification Failed', color: '#dc2626', bg: '#fef2f2', icon: '✕' },
};

export default function VerificationPage() {
  const [status, setStatus] = useState(DEMO_STATUS);
  const [files, setFiles] = useState({});
  const [additionalInfo, setAdditionalInfo] = useState({ website: '', linkedin: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);
  const fileRefs = useRef({});

  const handleFile = (docId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFiles((prev) => ({ ...prev, [docId]: file }));
  };

  const removeFile = (docId) => {
    setFiles((prev) => { const n = { ...prev }; delete n[docId]; return n; });
    if (fileRefs.current[docId]) fileRefs.current[docId].value = '';
  };

  const allUploaded = REQUIRED_DOCS.every((d) => files[d.id]);

  const handleSubmit = () => {
    if (!allUploaded) return;
    setStatus('in_review');
    setSubmitted(true);
  };

  const handleResubmit = () => {
    setStatus('pending');
    setFiles({});
    setSubmitted(false);
  };

  const meta = STATUS_META[status];

  const isEditable = status === 'pending' || status === 'failed';

  return (
    <div className={styles.page}>
      {/* ── Status Banner ── */}
      <div className={styles.statusBanner} style={{ background: meta.bg, borderColor: meta.color + '40' }}>
        <div className={styles.statusIcon} style={{ color: meta.color }}>{meta.icon}</div>
        <div className={styles.statusText}>
          <p className={styles.statusLabel} style={{ color: meta.color }}>{meta.label}</p>
          {status === 'pending' && !submitted && (
            <p className={styles.statusSub}>Upload the required documents below to begin verification. Your account features will be fully unlocked once verified.</p>
          )}
          {status === 'in_review' && (
            <p className={styles.statusSub}>Your documents have been submitted and are currently being reviewed by our team. This typically takes 1–3 business days.</p>
          )}
          {status === 'reviewed' && (
            <p className={styles.statusSub}>Your institution has been successfully verified. All platform features are now fully available.</p>
          )}
          {status === 'failed' && (
            <p className={styles.statusSub}>{DEMO_FAILURE_REASON}</p>
          )}
        </div>
        {status === 'failed' && (
          <button className={styles.resubmitBtn} onClick={handleResubmit}>Resubmit Documents</button>
        )}
      </div>

      {/* ── Stage Tracker ── */}
      <div className={styles.stages}>
        {[
          { key: 'pending', label: 'Submitted' },
          { key: 'in_review', label: 'In Review' },
          { key: 'reviewed', label: 'Reviewed' },
        ].map((stage, i, arr) => {
          const order = ['pending', 'in_review', 'reviewed', 'failed'];
          const currentIdx = order.indexOf(status);
          const stageIdx = order.indexOf(stage.key);
          const isDone = status !== 'failed' && currentIdx > stageIdx;
          const isCurrent = status !== 'failed' && currentIdx === stageIdx;
          const isFailed = status === 'failed';

          return (
            <div key={stage.key} className={styles.stageItem}>
              <div className={`${styles.stageDot} ${isDone ? styles.stageDone : ''} ${isCurrent ? styles.stageCurrent : ''} ${isFailed && i === 0 ? styles.stageFailed : ''}`}>
                {isDone ? '✓' : i + 1}
              </div>
              <span className={`${styles.stageLabel} ${isCurrent ? styles.stageLabelActive : ''}`}>{stage.label}</span>
              {i < arr.length - 1 && <div className={`${styles.stageLine} ${isDone ? styles.stageLineDone : ''}`} />}
            </div>
          );
        })}
        {/* Failed state */}
        {status === 'failed' && (
          <div className={styles.stageItem}>
            <div className={`${styles.stageDot} ${styles.stageFailed}`}>✕</div>
            <span className={`${styles.stageLabel} ${styles.stageLabelFailed}`}>Failed</span>
          </div>
        )}
      </div>

      <div className={styles.body}>
        {/* ── Required Documents ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Required Documents</h2>
          <p className={styles.sectionSub}>All five documents are mandatory. Accepted formats: PDF, JPG, PNG.</p>

          <div className={styles.docList}>
            {REQUIRED_DOCS.map((doc) => {
              const uploaded = files[doc.id];
              return (
                <div key={doc.id} className={`${styles.docRow} ${uploaded ? styles.docUploaded : ''}`}>
                  <div className={styles.docInfo}>
                    <div className={styles.docCheck}>{uploaded ? '✓' : '○'}</div>
                    <div>
                      <p className={styles.docLabel}>{doc.label}</p>
                      <p className={styles.docDesc}>{doc.description}</p>
                      {uploaded && (
                        <p className={styles.docFilename}>
                          <span className={styles.fileIcon}>📎</span> {uploaded.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {isEditable && (
                    <div className={styles.docActions}>
                      {!uploaded ? (
                        <>
                          <input
                            ref={(el) => (fileRefs.current[doc.id] = el)}
                            type="file"
                            accept={doc.accept}
                            id={`file-${doc.id}`}
                            className={styles.fileInput}
                            onChange={(e) => handleFile(doc.id, e)}
                          />
                          <label htmlFor={`file-${doc.id}`} className={styles.uploadBtn}>
                            Upload
                          </label>
                        </>
                      ) : (
                        <button className={styles.removeBtn} onClick={() => removeFile(doc.id)}>Remove</button>
                      )}
                    </div>
                  )}

                  {!isEditable && uploaded && (
                    <span className={styles.uploadedBadge}>Uploaded</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Additional Information ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Additional Information</h2>
          <p className={styles.sectionSub}>Optional but helps speed up the review process.</p>

          <div className={styles.infoGrid}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Institution Website</label>
              <input
                className={styles.fieldInput}
                type="url"
                placeholder="https://yourinstitution.edu"
                value={additionalInfo.website}
                onChange={(e) => setAdditionalInfo((p) => ({ ...p, website: e.target.value }))}
                disabled={!isEditable}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>LinkedIn / Official Social</label>
              <input
                className={styles.fieldInput}
                type="url"
                placeholder="https://linkedin.com/school/…"
                value={additionalInfo.linkedin}
                onChange={(e) => setAdditionalInfo((p) => ({ ...p, linkedin: e.target.value }))}
                disabled={!isEditable}
              />
            </div>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.fieldLabel}>Additional Notes</label>
              <textarea
                className={styles.fieldTextarea}
                placeholder="Any context that may help the reviewer, e.g. your institution operates under a parent company…"
                rows={3}
                value={additionalInfo.notes}
                onChange={(e) => setAdditionalInfo((p) => ({ ...p, notes: e.target.value }))}
                disabled={!isEditable}
              />
            </div>
          </div>
        </section>

        {/* ── Submit ── */}
        {isEditable && (
          <div className={styles.submitRow}>
            <div className={styles.submitInfo}>
              <span className={`${styles.uploadCount} ${allUploaded ? styles.uploadCountDone : ''}`}>
                {Object.keys(files).length} / {REQUIRED_DOCS.length} documents uploaded
              </span>
              {!allUploaded && <span className={styles.uploadHint}>Upload all required documents to submit.</span>}
            </div>
            <button
              className={styles.submitBtn}
              disabled={!allUploaded}
              onClick={handleSubmit}
            >
              Submit for Verification
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
