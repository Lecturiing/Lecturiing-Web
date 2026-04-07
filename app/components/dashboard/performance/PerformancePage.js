'use client';

import { useState, useEffect } from 'react';
import styles from './PerformancePage.module.css';
import { reviewService } from '@/app/lib/services/reviewService';
import { contractService } from '@/app/lib/services/contractService';

const CATEGORIES = ['teaching', 'punctuality', 'communication', 'studentFeedback'];
const CATEGORY_LABELS = { teaching: 'Teaching Quality', punctuality: 'Punctuality', communication: 'Communication', studentFeedback: 'Student Feedback' };

function StarRating({ value, onChange, readonly = false }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className={`${styles.star} ${s <= Math.round(value) ? styles.starFilled : ''}`}
          onClick={() => !readonly && onChange?.(s)}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
          aria-label={`${s} star${s !== 1 ? 's' : ''}`}
        >★</button>
      ))}
      {value > 0 && <span className={styles.starVal}>{Number(value).toFixed(1)}</span>}
    </div>
  );
}

export default function PerformancePage() {
  const [reviews, setReviews] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [formData, setFormData] = useState({ overallRating: 0, teaching: 0, punctuality: 0, communication: 0, studentFeedback: 0, review: '' });
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    reviewService.list().then((data) => setReviews(Array.isArray(data) ? data : (data?.reviews ?? []))).catch(() => {});
    contractService.list().then((data) => setContracts(Array.isArray(data) ? data : (data?.contracts ?? []))).catch(() => {});
  }, []);

  const reviewedContractIds = new Set(reviews.map((r) => r.contractId).filter(Boolean));
  const reviewableContracts = contracts.filter((c) => !reviewedContractIds.has(c.id));
  const pendingContracts = reviewableContracts.filter((c) => c.status === 'completed');

  const selectedContract = contracts.find((c) => c.id === selectedContractId);
  const selectedLecturer = selectedContract?.lecturer;

  const openForm = (contractId = '') => {
    setSelectedContractId(contractId);
    setFormData({ overallRating: 0, teaching: 0, punctuality: 0, communication: 0, studentFeedback: 0, review: '' });
    setSubmitError('');
    setShowForm(true);
  };

  const submitReview = async () => {
    if (!selectedContract) return;
    setSubmitError('');
    const payload = {
      contractId: selectedContract.id,
      lecturerId: selectedContract.lecturerId,
      overallRating: formData.overallRating,
      categories: { teaching: formData.teaching, punctuality: formData.punctuality, communication: formData.communication, studentFeedback: formData.studentFeedback },
      review: formData.review,
    };
    const optimistic = {
      id: `r${Date.now()}`,
      contractId: selectedContract.id,
      lecturerId: selectedContract.lecturerId,
      lecturerName: selectedLecturer?.name || 'Unknown',
      lecturerInitials: selectedLecturer?.initials || '??',
      lecturerColor: selectedLecturer?.color || '#7c3aed',
      jobTitle: selectedContract.job?.title || '',
      overallRating: formData.overallRating,
      categories: payload.categories,
      review: formData.review,
      completedAt: selectedContract.endDate,
      reviewedAt: new Date().toISOString(),
    };
    setReviews((prev) => [...prev, optimistic]);
    setShowForm(false);
    try {
      const created = await reviewService.create(payload);
      setReviews((prev) => prev.map((r) => r.id === optimistic.id ? { ...optimistic, ...created } : r));
    } catch (err) {
      setReviews((prev) => prev.filter((r) => r.id !== optimistic.id));
      setSubmitError(err.message || 'Failed to submit review.');
      setShowForm(true);
    }
  };

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length).toFixed(1) : '—';

  return (
    <div className={styles.page}>
      {/* Summary strip */}
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryVal}>{reviews.length}</p>
          <p className={styles.summaryLabel}>Total Reviews</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryVal}>★ {avgRating}</p>
          <p className={styles.summaryLabel}>Avg. Rating</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryVal}>{pendingContracts.length}</p>
          <p className={styles.summaryLabel}>Pending Reviews</p>
        </div>
        <button className={styles.newReviewBtn} onClick={() => openForm()}>+ Submit Review</button>
      </div>

      {/* Pending review prompt */}
      {pendingContracts.length > 0 && (
        <div className={styles.pendingBanner}>
          <p>⏳ You have {pendingContracts.length} completed engagement{pendingContracts.length > 1 ? 's' : ''} awaiting a review.</p>
          <button className={styles.btnReviewNow} onClick={() => openForm(pendingContracts[0].id)}>Review Now</button>
        </div>
      )}

      {/* Reviews list */}
      <div className={styles.list}>
        {reviews.map((r) => (
          <div key={r.id} className={styles.reviewCard}>
            <div className={styles.reviewTop}>
              <div className={styles.avatar} style={{ background: r.lecturerColor }}>{r.lecturerInitials}</div>
              <div className={styles.reviewInfo}>
                <h3 className={styles.reviewName}>{r.lecturerName}</h3>
                <p className={styles.reviewJob}>{r.jobTitle}</p>
                <p className={styles.reviewDate}>Completed {r.completedAt} · Reviewed {r.reviewedAt}</p>
              </div>
              <div className={styles.overallRating}>
                <StarRating value={r.overallRating} readonly />
              </div>
            </div>
            <div className={styles.categories}>
              {CATEGORIES.map((cat) => (
                <div key={cat} className={styles.catRow}>
                  <span className={styles.catLabel}>{CATEGORY_LABELS[cat]}</span>
                  <div className={styles.catBar}>
                    <div className={styles.catFill} style={{ width: `${(r.categories[cat] / 5) * 100}%` }} />
                  </div>
                  <span className={styles.catVal}>{r.categories[cat]}</span>
                </div>
              ))}
            </div>
            {r.review && <p className={styles.reviewText}>"{r.review}"</p>}
          </div>
        ))}
        {reviews.length === 0 && <p className={styles.empty}>No reviews yet. Complete an engagement to leave a review.</p>}
      </div>

      {/* Review form modal */}
      {showForm && (
        <div className={styles.overlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Submit Performance Review</h3>
              <button className={styles.modalClose} onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div className={styles.formFields}>
              <div className={styles.formField}>
                <label className={styles.label}>Select Engagement *</label>
                <select
                  className={styles.input}
                  value={selectedContractId}
                  onChange={(e) => setSelectedContractId(e.target.value)}
                >
                  <option value="">— Choose a lecturer / contract —</option>
                  {reviewableContracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.lecturer?.name || 'Unknown Lecturer'} — {c.job?.title || 'Unknown Job'} ({c.status})
                    </option>
                  ))}
                </select>
              </div>

              {selectedLecturer && (
                <div className={styles.lecturerPreview}>
                  <div className={styles.lecturerAvatar} style={{ background: selectedLecturer.color || '#7c3aed' }}>
                    {selectedLecturer.initials || '??'}
                  </div>
                  <div>
                    <p className={styles.lecturerPreviewName}>{selectedLecturer.name}</p>
                    <p className={styles.lecturerPreviewJob}>{selectedContract.job?.title}</p>
                  </div>
                </div>
              )}

              <div className={styles.formField}>
                <label className={styles.label}>Overall Rating</label>
                <StarRating value={formData.overallRating} onChange={(v) => setFormData((p) => ({ ...p, overallRating: v }))} />
              </div>

              {CATEGORIES.map((cat) => (
                <div key={cat} className={styles.formField}>
                  <label className={styles.label}>{CATEGORY_LABELS[cat]}</label>
                  <StarRating value={formData[cat]} onChange={(v) => setFormData((p) => ({ ...p, [cat]: v }))} />
                </div>
              ))}

              <div className={styles.formField}>
                <label className={styles.label}>Written Review</label>
                <textarea className={`${styles.input} ${styles.textarea}`} value={formData.review} onChange={(e) => setFormData((p) => ({ ...p, review: e.target.value }))} placeholder="Share your experience working with this lecturer…" rows={4} />
              </div>

              {submitError && <p className={styles.errorText}>{submitError}</p>}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={styles.btnSubmit} onClick={submitReview} disabled={!selectedContractId || formData.overallRating === 0}>Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
