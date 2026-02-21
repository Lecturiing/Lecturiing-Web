'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MOCK_APPLICANTS, MOCK_LECTURERS, MOCK_JOBS, MOCK_LECTURER_DETAILS } from '@/app/lib/mockData';
import styles from './ApplicantsPage.module.css';

const STATUS_TABS = ['All', 'Pending', 'Shortlisted', 'Interview', 'Declined', 'Offer Sent'];

const STATUS_META = {
  pending:              { label: 'Pending',       bg: '#f3f4f6', color: '#6b7280' },
  shortlisted:          { label: 'Shortlisted',   bg: '#ede9fe', color: '#4f46e5' },
  interview_scheduled:  { label: 'Interview',     bg: '#dbeafe', color: '#1d4ed8' },
  declined:             { label: 'Declined',      bg: '#fee2e2', color: '#dc2626' },
  offer_sent:           { label: 'Offer Sent',    bg: '#d1fae5', color: '#059669' },
};

const TAB_STATUS_MAP = {
  All: null,
  Pending: 'pending',
  Shortlisted: 'shortlisted',
  Interview: 'interview_scheduled',
  Declined: 'declined',
  'Offer Sent': 'offer_sent',
};

export default function ApplicantsPage({ jobId }) {
  const router = useRouter();
  const job = MOCK_JOBS.find((j) => j.id === jobId);
  const baseApplicants = MOCK_APPLICANTS.filter((a) => a.jobId === jobId).map((a) => ({
    ...a,
    lecturer: MOCK_LECTURERS.find((l) => l.id === a.lecturerId),
  }));

  const [applicants, setApplicants] = useState(baseApplicants);
  const [tab, setTab] = useState('All');
  const [selected, setSelected] = useState(null);
  const [expandedSection, setExpandedSection] = useState('about');

  const filtered = applicants.filter((a) => {
    const statusFilter = TAB_STATUS_MAP[tab];
    return statusFilter === null || a.status === statusFilter;
  });

  const counts = STATUS_TABS.reduce((acc, t) => {
    const s = TAB_STATUS_MAP[t];
    acc[t] = s === null ? applicants.length : applicants.filter((a) => a.status === s).length;
    return acc;
  }, {});

  const updateStatus = (appId, newStatus) => {
    setApplicants((prev) => prev.map((a) => a.id === appId ? { ...a, status: newStatus } : a));
    if (selected?.id === appId) setSelected((s) => ({ ...s, status: newStatus }));
  };

  if (!job) return <div className={styles.notFound}>Job not found. <Link href="/dashboard/jobs">Back to jobs</Link></div>;

  const details = selected ? MOCK_LECTURER_DETAILS[selected.lecturerId] : null;

  return (
    <div className={styles.page}>
      {/* ── Breadcrumb ── */}
      <div className={styles.breadcrumb}>
        <Link href="/dashboard/jobs" className={styles.breadcrumbLink}>Job Postings</Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span className={styles.breadcrumbCurrent}>{job.title}</span>
        <span className={styles.breadcrumbSep}>›</span>
        <span className={styles.breadcrumbCurrent}>Applicants</span>
      </div>

      {/* ── Job Summary ── */}
      <div className={styles.jobSummary}>
        <div>
          <h1 className={styles.jobTitle}>{job.title}</h1>
          <div className={styles.jobMeta}>
            <span>{job.field}</span><span>·</span>
            <span>{job.contractType}</span><span>·</span>
            <span>{job.duration}</span><span>·</span>
            <span className={styles.budget}>${job.budgetMin}–${job.budgetMax}/mo</span>
          </div>
        </div>
        <div className={styles.totalBadge}>{applicants.length} Applicants</div>
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
            <span className={styles.tabCount}>{counts[t]}</span>
          </button>
        ))}
      </div>

      {/* ── List ── */}
      <div className={styles.list}>
        {filtered.length === 0 && (
          <p className={styles.empty}>No applicants in this category.</p>
        )}
        {filtered.map((app) => {
          const lec = app.lecturer;
          if (!lec) return null;
          const sm = STATUS_META[app.status] ?? STATUS_META.pending;

          return (
            <div key={app.id} className={`${styles.row} ${app.status === 'declined' ? styles.rowDeclined : ''}`}>
              {/* Avatar + Info */}
              <div className={styles.rowLeft} onClick={() => setSelected(app)}>
                <div className={styles.avatar} style={{ background: lec.color }}>{lec.initials}</div>
                <div className={styles.rowInfo}>
                  <p className={styles.rowName}>{lec.name}</p>
                  <p className={styles.rowTitle}>{lec.title}</p>
                  <div className={styles.rowMeta}>
                    <span>{lec.country}</span>
                    <span>·</span>
                    <span>{lec.qualification}</span>
                    <span>·</span>
                    <span>★ {lec.rating}</span>
                    <span>·</span>
                    <span>${lec.rate}/hr</span>
                  </div>
                </div>
              </div>

              {/* Status + Date + Actions */}
              <div className={styles.rowRight}>
                <span className={styles.statusBadge} style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
                <span className={styles.appliedDate}>Applied {app.appliedAt}</span>
                {app.interviewDate && (
                  <span className={styles.interviewDate}>
                    📅 {new Date(app.interviewDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                <div className={styles.actions}>
                  <button className={styles.viewBtn} onClick={() => setSelected(app)}>View</button>
                  {app.status === 'pending' && (
                    <>
                      <button className={styles.shortlistBtn} onClick={() => updateStatus(app.id, 'shortlisted')}>Shortlist</button>
                      <button className={styles.declineBtn} onClick={() => updateStatus(app.id, 'declined')}>Decline</button>
                    </>
                  )}
                  {app.status === 'shortlisted' && (
                    <>
                      <button className={styles.interviewBtn} onClick={() => updateStatus(app.id, 'interview_scheduled')}>Schedule Interview</button>
                      <button className={styles.declineBtn} onClick={() => updateStatus(app.id, 'declined')}>Decline</button>
                    </>
                  )}
                  {app.status === 'interview_scheduled' && (
                    <button className={styles.offerBtn} onClick={() => updateStatus(app.id, 'offer_sent')}>Send Offer</button>
                  )}
                  {app.status === 'declined' && (
                    <button className={styles.restoreBtn} onClick={() => updateStatus(app.id, 'pending')}>Restore</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Profile Drawer ── */}
      {selected && selected.lecturer && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            {/* Drawer top bar */}
            <div className={styles.drawerTopBar}>
              <button className={styles.drawerClose} onClick={() => setSelected(null)}>✕</button>
              <button
                className={styles.drawerExpand}
                title="View full profile"
                onClick={() => router.push(`/dashboard/lecturers/${selected.lecturerId}`)}
              >
                <ExpandIcon />
              </button>
            </div>

            {/* Header */}
            <div className={styles.drawerAvatar} style={{ background: selected.lecturer.color }}>
              {selected.lecturer.initials}
            </div>
            <div>
              <h2 className={styles.drawerName}>{selected.lecturer.name}</h2>
              <p className={styles.drawerTitle}>{selected.lecturer.title}</p>
            </div>
            <div className={styles.drawerMeta}>
              <span>📍 {selected.lecturer.country}</span>
              <span>🕐 {selected.lecturer.timezone}</span>
              <span>🎓 {selected.lecturer.qualification}</span>
              <span>⏱ {selected.lecturer.experience} yrs</span>
            </div>

            {/* Status badge */}
            {(() => {
              const sm = STATUS_META[selected.status] ?? STATUS_META.pending;
              return (
                <span className={styles.drawerStatus} style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
              );
            })()}

            {/* Collapsible Sections */}
            <DrawerSection
              title="About"
              open={expandedSection === 'about'}
              onToggle={() => setExpandedSection(expandedSection === 'about' ? null : 'about')}
            >
              <p className={styles.drawerBio}>{selected.lecturer.bio}</p>
              <div className={styles.drawerTags}>
                {selected.lecturer.specializations.map((s) => <span key={s} className={styles.tag}>{s}</span>)}
              </div>
            </DrawerSection>

            {details && (
              <>
                <DrawerSection
                  title="Experience"
                  open={expandedSection === 'exp'}
                  onToggle={() => setExpandedSection(expandedSection === 'exp' ? null : 'exp')}
                >
                  {details.experience.map((e, i) => (
                    <div key={i} className={styles.expItem}>
                      <p className={styles.expRole}>{e.role}</p>
                      <p className={styles.expInst}>{e.institution || 'Self-employed'} · {e.period}</p>
                      <p className={styles.expDesc}>{e.description}</p>
                    </div>
                  ))}
                </DrawerSection>

                <DrawerSection
                  title="Education"
                  open={expandedSection === 'edu'}
                  onToggle={() => setExpandedSection(expandedSection === 'edu' ? null : 'edu')}
                >
                  {details.education.map((e, i) => (
                    <div key={i} className={styles.eduItem}>
                      <p className={styles.eduDeg}>{e.degree}</p>
                      <p className={styles.eduInst}>{e.institution} · {e.year}</p>
                    </div>
                  ))}
                </DrawerSection>

                <DrawerSection
                  title="Portfolio"
                  open={expandedSection === 'port'}
                  onToggle={() => setExpandedSection(expandedSection === 'port' ? null : 'port')}
                >
                  {details.portfolio.map((p, i) => (
                    <div key={i} className={styles.portItem}>
                      <span className={styles.portType}>{p.type}</span>
                      <p className={styles.portTitle}>{p.title}</p>
                      <span className={styles.portYear}>{p.year}</span>
                    </div>
                  ))}
                </DrawerSection>
              </>
            )}

            {/* Drawer Actions */}
            <div className={styles.drawerActions}>
              {selected.status === 'pending' && (
                <>
                  <button className={styles.shortlistBtn} onClick={() => updateStatus(selected.id, 'shortlisted')}>Shortlist</button>
                  <button className={styles.declineBtn} onClick={() => { updateStatus(selected.id, 'declined'); setSelected(null); }}>Decline</button>
                </>
              )}
              {selected.status === 'shortlisted' && (
                <>
                  <button className={styles.interviewBtn} onClick={() => updateStatus(selected.id, 'interview_scheduled')}>Schedule Interview</button>
                  <button className={styles.declineBtn} onClick={() => { updateStatus(selected.id, 'declined'); setSelected(null); }}>Decline</button>
                </>
              )}
              {selected.status === 'interview_scheduled' && (
                <button className={styles.offerBtn} onClick={() => updateStatus(selected.id, 'offer_sent')}>Send Offer</button>
              )}
              {selected.status === 'declined' && (
                <button className={styles.restoreBtn} onClick={() => updateStatus(selected.id, 'pending')}>Restore Application</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DrawerSection({ title, open, onToggle, children }) {
  return (
    <div className={styles.section}>
      <button className={styles.sectionToggle} onClick={onToggle}>
        <span>{title}</span>
        <span className={styles.sectionChevron}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className={styles.sectionContent}>{children}</div>}
    </div>
  );
}

function ExpandIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}
