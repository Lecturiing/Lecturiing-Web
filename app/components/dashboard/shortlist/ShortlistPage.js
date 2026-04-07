'use client';

import { useState, useEffect } from 'react';
import styles from './ShortlistPage.module.css';
import { shortlistService } from '@/app/lib/services/shortlistService';

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
  const [items, setItems] = useState([]);

  useEffect(() => {
    shortlistService.list()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        // Normalise to flat shape frontend expects
        setItems(list.map((item) => ({
          ...item,
          lecturerName: item.lecturer?.name ?? item.lecturerName ?? '—',
          lecturerInitials: item.lecturer?.initials ?? item.lecturerInitials ?? '?',
          lecturerColor: item.lecturer?.color ?? item.lecturerColor ?? '#4f46e5',
          lecturerEmail: item.lecturer?.email ?? item.lecturerEmail,
          jobTitle: item.job?.title ?? item.jobTitle ?? '—',
        })));
      })
      .catch(() => {});
  }, []);
  const [scheduleFor, setScheduleFor] = useState(null);
  const [meetingType, setMeetingType] = useState('meet');
  const [meetingLink, setMeetingLink] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [scheduleLoading, setScheduleLoading] = useState(false);
  // Keep calendly embed state for optional embed
  const [calendlyUrl, setCalendlyUrl] = useState('');
  const [showCalendlyInput, setShowCalendlyInput] = useState(false);

  const updateStatus = async (id, status) => {
    try { await shortlistService.update(id, { status }); } catch (_) {}
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const openSchedule = (item) => {
    setScheduleFor(item);
    setMeetingType('meet');
    setMeetingLink('');
    setInterviewDate('');
    setCalendlyUrl('');
    setShowCalendlyInput(false);
  };

  const confirmSchedule = async () => {
    if (!scheduleFor || !meetingLink) return;
    setScheduleLoading(true);
    try {
      await shortlistService.scheduleInterview(scheduleFor.id, {
        meetingLink,
        interviewDate: interviewDate || undefined,
      });
      setItems((prev) => prev.map((i) =>
        i.id === scheduleFor.id
          ? { ...i, status: 'interview_scheduled', interviewDate: interviewDate || null, calendlyLink: meetingLink }
          : i
      ));
    } catch (_) {}
    setScheduleLoading(false);
    setScheduleFor(null);
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

            <div className={styles.meetingTypeTabs}>
              {[['meet', 'Google Meet'], ['calendly', 'Calendly'], ['custom', 'Custom Link']].map(([k, label]) => (
                <button
                  key={k}
                  className={`${styles.meetingTypeBtn} ${meetingType === k ? styles.meetingTypeActive : ''}`}
                  onClick={() => { setMeetingType(k); setMeetingLink(''); setCalendlyUrl(''); }}
                >
                  {label}
                </button>
              ))}
            </div>

            {meetingType === 'meet' && (
              <div className={styles.meetingNote}>
                <p>Create a Google Meet link and paste it below. An invite email will be sent to the lecturer.</p>
                <a href="https://meet.google.com/new" target="_blank" rel="noreferrer" className={styles.meetingExternalLink}>
                  Open Google Meet →
                </a>
              </div>
            )}
            {meetingType === 'calendly' && (
              <div className={styles.meetingNote}>
                <p>Paste your Calendly event link. The lecturer can pick a time, and an invite email will be sent.</p>
                <a href="https://calendly.com" target="_blank" rel="noreferrer" className={styles.meetingExternalLink}>
                  Open Calendly →
                </a>
              </div>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Meeting Link *</label>
              <input
                className={styles.calendlyInput}
                placeholder={meetingType === 'meet' ? 'https://meet.google.com/abc-defg-hij' : meetingType === 'calendly' ? 'https://calendly.com/your-name/30min' : 'https://...'}
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Interview Date & Time (optional)</label>
              <input
                type="datetime-local"
                className={styles.calendlyInput}
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
              />
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setScheduleFor(null)}>Cancel</button>
              <button
                className={styles.btnConfirm}
                disabled={!meetingLink || scheduleLoading}
                onClick={confirmSchedule}
              >
                {scheduleLoading ? 'Sending…' : 'Schedule & Send Invite'}
              </button>
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
