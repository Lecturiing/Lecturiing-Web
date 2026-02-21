'use client';

import { useState } from 'react';
import { MOCK_SHORTLIST } from '@/app/lib/mockData';
import styles from './ShortlistPage.module.css';

const STATUS_MAP = {
  new: { label: 'New', bg: '#f3f4f6', color: '#6b7280' },
  interview_scheduled: { label: 'Interview Scheduled', bg: '#dbeafe', color: '#1d4ed8' },
  offer_sent: { label: 'Offer Sent', bg: '#fef3c7', color: '#d97706' },
  accepted: { label: 'Accepted', bg: '#d1fae5', color: '#059669' },
  rejected: { label: 'Rejected', bg: '#fee2e2', color: '#dc2626' },
};

// Calendly embed component
function CalendlyEmbed({ url }) {
  return (
    <iframe
      src={`${url}?hide_gdpr_banner=1&hide_landing_page_details=1`}
      width="100%"
      height="580"
      frameBorder="0"
      title="Schedule Interview"
      style={{ borderRadius: 12 }}
    />
  );
}

export default function ShortlistPage() {
  const [items, setItems] = useState(MOCK_SHORTLIST);
  const [scheduleFor, setScheduleFor] = useState(null); // shortlist item
  const [calendlyUrl, setCalendlyUrl] = useState('');
  const [showCalendlyInput, setShowCalendlyInput] = useState(false);

  const updateStatus = (id, status) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));

  const openSchedule = (item) => {
    setScheduleFor(item);
    setCalendlyUrl('');
    setShowCalendlyInput(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.summary}>
        {Object.entries(STATUS_MAP).map(([k, v]) => (
          <div key={k} className={styles.summaryChip} style={{ background: v.bg, color: v.color }}>
            <span className={styles.summaryCount}>{items.filter((i) => i.status === k).length}</span>
            <span>{v.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.table}>
        <div className={styles.thead}>
          <span>Lecturer</span><span>Job</span><span>Status</span><span>Interview</span><span>Actions</span>
        </div>
        {items.map((item) => {
          const s = STATUS_MAP[item.status] ?? STATUS_MAP.new;
          return (
            <div key={item.id} className={styles.row}>
              <span className={styles.lecturerCell}>
                <div className={styles.avatar} style={{ background: item.lecturerColor }}>{item.lecturerInitials}</div>
                <span>{item.lecturerName}</span>
              </span>
              <span className={styles.jobCell}>{item.jobTitle}</span>
              <span>
                <span className={styles.statusBadge} style={{ background: s.bg, color: s.color }}>{s.label}</span>
              </span>
              <span className={styles.interviewCell}>
                {item.interviewDate
                  ? new Date(item.interviewDate).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                  : <span className={styles.noInterview}>Not scheduled</span>}
              </span>
              <span className={styles.actions}>
                <button className={styles.actionBtn} onClick={() => openSchedule(item)}>
                  <CalIcon /> Schedule
                </button>
                {item.status !== 'accepted' && item.status !== 'rejected' && (
                  <>
                    <button className={`${styles.actionBtn} ${styles.offerBtn}`} onClick={() => updateStatus(item.id, 'offer_sent')}>Offer</button>
                    <button className={`${styles.actionBtn} ${styles.rejectBtn}`} onClick={() => updateStatus(item.id, 'rejected')}>Reject</button>
                  </>
                )}
              </span>
            </div>
          );
        })}
        {items.length === 0 && <p className={styles.empty}>No lecturers shortlisted yet. Go to <strong>Find Lecturers</strong> to add some.</p>}
      </div>

      {/* Schedule Interview Modal */}
      {scheduleFor && (
        <div className={styles.overlay} onClick={() => setScheduleFor(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Schedule Interview</h3>
                <p className={styles.modalSub}>
                  Scheduling with <strong>{scheduleFor.lecturerName}</strong> for <em>{scheduleFor.jobTitle}</em>
                </p>
              </div>
              <button className={styles.modalClose} onClick={() => setScheduleFor(null)}>✕</button>
            </div>

            {!calendlyUrl && !showCalendlyInput && (
              <div className={styles.calendlyIntro}>
                <div className={styles.calendlyIcon}><CalIcon /></div>
                <p className={styles.calendlyDesc}>
                  Use your Calendly link to let the lecturer pick a time that works for both of you. The invite will be sent automatically.
                </p>
                <button className={styles.calendlySetupBtn} onClick={() => setShowCalendlyInput(true)}>
                  Enter Calendly Link
                </button>
                <p className={styles.calendlyNote}>Don't have Calendly? <a href="https://calendly.com" target="_blank" rel="noreferrer">Create a free account →</a></p>
              </div>
            )}

            {showCalendlyInput && !calendlyUrl && (
              <div className={styles.calendlyInputWrap}>
                <label className={styles.label}>Your Calendly Event URL</label>
                <input
                  className={styles.calendlyInput}
                  placeholder="https://calendly.com/your-name/30min"
                  onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value.startsWith('https://calendly.com')) setCalendlyUrl(e.target.value); }}
                  autoFocus
                />
                <p className={styles.calendlyNote}>Press Enter to load the scheduler.</p>
                <button className={styles.calendlySetupBtn} onClick={(e) => {
                  const input = e.target.previousElementSibling.previousElementSibling;
                  if (input && input.value.includes('calendly.com')) setCalendlyUrl(input.value);
                }}>Load Scheduler</button>
              </div>
            )}

            {calendlyUrl && (
              <div className={styles.calendlyEmbed}>
                <CalendlyEmbed url={calendlyUrl} />
              </div>
            )}

            <div className={styles.modalFooter}>
              <button className={styles.btnConfirm} onClick={() => {
                updateStatus(scheduleFor.id, 'interview_scheduled');
                setScheduleFor(null);
              }}>Mark as Scheduled</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CalIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
}
