'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PipelinePage.module.css';
import { applicationService } from '@/app/lib/services/applicationService';

const TABS = ['All', 'Interviews', 'Offers'];

const STATUS_META = {
  interview_scheduled: { label: 'Interview Scheduled', bg: '#dbeafe', color: '#1d4ed8' },
  offer_sent:          { label: 'Offer Sent',          bg: '#d1fae5', color: '#059669' },
};

export default function PipelinePage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');

  useEffect(() => {
    Promise.all([
      applicationService.list({ status: 'interview_scheduled', pageSize: 100 }),
      applicationService.list({ status: 'offer_sent', pageSize: 100 }),
    ])
      .then(([interviews, offers]) => {
        const i = Array.isArray(interviews) ? interviews : (interviews?.applications ?? []);
        const o = Array.isArray(offers)     ? offers     : (offers?.applications ?? []);
        setItems([...i, ...o].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((item) => {
    if (tab === 'Interviews') return item.status === 'interview_scheduled';
    if (tab === 'Offers')     return item.status === 'offer_sent';
    return true;
  });

  const interviewCount = items.filter((i) => i.status === 'interview_scheduled').length;
  const offerCount     = items.filter((i) => i.status === 'offer_sent').length;

  return (
    <div className={styles.page}>
      <div className={styles.summary}>
        <div className={styles.summaryCard} style={{ borderColor: '#bfdbfe' }}>
          <span className={styles.summaryNum} style={{ color: '#1d4ed8' }}>{interviewCount}</span>
          <span className={styles.summaryLabel}>Interviews Scheduled</span>
        </div>
        <div className={styles.summaryCard} style={{ borderColor: '#a7f3d0' }}>
          <span className={styles.summaryNum} style={{ color: '#059669' }}>{offerCount}</span>
          <span className={styles.summaryLabel}>Offers Sent</span>
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <p className={styles.empty}>Loading…</p>}
      {!loading && filtered.length === 0 && (
        <p className={styles.empty}>Nothing here yet. Schedule interviews or send offers from the Applicants page.</p>
      )}

      <div className={styles.list}>
        {filtered.map((item) => {
          const lec = item.lecturer ?? item;
          const sm  = STATUS_META[item.status];
          return (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardLeft}>
                {lec.avatarUrl ? (
                  <img src={lec.avatarUrl} alt={lec.name} className={styles.avatarImg} />
                ) : (
                  <div className={styles.avatar} style={{ background: lec.color ?? '#4f46e5' }}>{lec.initials}</div>
                )}
                <div className={styles.info}>
                  <p className={styles.name}>{lec.name}</p>
                  <p className={styles.jobTitle}>{item.job?.title ?? '—'}</p>
                  <div className={styles.meta}>
                    {lec.country       && <span>📍 {lec.country}</span>}
                    {lec.qualification && <span>🎓 {lec.qualification}</span>}
                    {lec.hourlyRate    && <span>💰 ${lec.hourlyRate}/hr</span>}
                  </div>
                </div>
              </div>

              <div className={styles.cardRight}>
                <span className={styles.badge} style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>

                {item.status === 'interview_scheduled' && (
                  <div className={styles.detailBox}>
                    {item.interviewDate && (
                      <p className={styles.detailRow}>
                        📅 {new Date(item.interviewDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    )}
                    {item.meetingLink && (
                      <a href={item.meetingLink} target="_blank" rel="noopener noreferrer" className={styles.meetLink}>
                        Join Meeting →
                      </a>
                    )}
                    {!item.interviewDate && !item.meetingLink && (
                      <p className={styles.detailNote}>Details pending</p>
                    )}
                  </div>
                )}

                {item.status === 'offer_sent' && (
                  <div className={styles.detailBox}>
                    <p className={styles.detailRow}>
                      Offer sent {item.appliedAt ? new Date(item.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
                    </p>
                    {Array.isArray(item.sentDocumentIds) && item.sentDocumentIds.length > 0 && (
                      <p className={styles.detailNote}>{item.sentDocumentIds.length} document{item.sentDocumentIds.length > 1 ? 's' : ''} sent</p>
                    )}
                  </div>
                )}

                <button
                  className={styles.viewBtn}
                  onClick={() => router.push(`/dashboard/jobs/${item.jobId}/applicants`)}
                >
                  View Job
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
