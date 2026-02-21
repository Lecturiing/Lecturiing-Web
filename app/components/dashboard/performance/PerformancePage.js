'use client';

import { useState } from 'react';
import { MOCK_REVIEWS, MOCK_CONTRACTS } from '@/app/lib/mockData';
import styles from './PerformancePage.module.css';

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
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ lecturerName: '', jobTitle: '', overallRating: 0, teaching: 0, punctuality: 0, communication: 0, studentFeedback: 0, review: '' });

  // Completed contracts not yet reviewed
  const completed = MOCK_CONTRACTS.filter((c) => c.status === 'completed' && !reviews.find((r) => r.lecturerId === c.lecturerId));

  const submitReview = () => {
    const newReview = {
      id: `r${Date.now()}`,
      lecturerId: String(Date.now()),
      lecturerName: formData.lecturerName,
      lecturerInitials: formData.lecturerName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
      lecturerColor: '#7c3aed',
      jobTitle: formData.jobTitle,
      overallRating: formData.overallRating,
      categories: { teaching: formData.teaching, punctuality: formData.punctuality, communication: formData.communication, studentFeedback: formData.studentFeedback },
      review: formData.review,
      completedAt: new Date().toISOString().split('T')[0],
      reviewedAt: new Date().toISOString().split('T')[0],
    };
    setReviews((prev) => [...prev, newReview]);
    setShowForm(false);
    setFormData({ lecturerName: '', jobTitle: '', overallRating: 0, teaching: 0, punctuality: 0, communication: 0, studentFeedback: 0, review: '' });
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
          <p className={styles.summaryVal}>{completed.length}</p>
          <p className={styles.summaryLabel}>Pending Reviews</p>
        </div>
        <button className={styles.newReviewBtn} onClick={() => setShowForm(true)}>+ Submit Review</button>
      </div>

      {/* Pending review prompt */}
      {completed.length > 0 && (
        <div className={styles.pendingBanner}>
          <p>⏳ You have {completed.length} completed engagement{completed.length > 1 ? 's' : ''} awaiting a review.</p>
          <button className={styles.btnReviewNow} onClick={() => { setFormData((p) => ({ ...p, lecturerName: completed[0].lecturerName, jobTitle: completed[0].jobTitle })); setShowForm(true); }}>Review Now</button>
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
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.label}>Lecturer Name</label>
                  <input className={styles.input} value={formData.lecturerName} onChange={(e) => setFormData((p) => ({ ...p, lecturerName: e.target.value }))} placeholder="Full name" />
                </div>
                <div className={styles.formField}>
                  <label className={styles.label}>Job / Engagement</label>
                  <input className={styles.input} value={formData.jobTitle} onChange={(e) => setFormData((p) => ({ ...p, jobTitle: e.target.value }))} placeholder="Job title" />
                </div>
              </div>

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
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={styles.btnSubmit} onClick={submitReview} disabled={!formData.lecturerName || formData.overallRating === 0}>Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
