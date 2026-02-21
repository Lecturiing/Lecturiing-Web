'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_JOBS } from '@/app/lib/mockData';
import styles from './JobsPage.module.css';

const TABS = ['All', 'Active', 'Draft', 'Closed'];

export default function JobsPage() {
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');

  const jobs = MOCK_JOBS.filter((j) => {
    if (tab !== 'All' && j.status !== tab.toLowerCase()) return false;
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.field.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <input className={styles.search} placeholder="Search job postings…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Link href="/dashboard/jobs/new" className={styles.postBtn}>+ Post a Job</Link>
      </div>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {t}
            <span className={styles.tabCount}>{t === 'All' ? MOCK_JOBS.length : MOCK_JOBS.filter((j) => j.status === t.toLowerCase()).length}</span>
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {jobs.map((job) => (
          <div key={job.id} className={styles.jobCard}>
            <div className={styles.jobLeft}>
              <div className={styles.jobIconWrap}><BriefcaseIcon /></div>
              <div>
                <h3 className={styles.jobTitle}>{job.title}</h3>
                <div className={styles.jobMeta}>
                  <span>{job.field}</span>
                  <span>·</span>
                  <span>{job.contractType}</span>
                  <span>·</span>
                  <span>{job.duration}</span>
                  <span>·</span>
                  <span className={styles.budget}>${job.budgetMin}–${job.budgetMax}/mo</span>
                </div>
                <p className={styles.jobDesc}>{job.description.slice(0, 100)}…</p>
              </div>
            </div>
            <div className={styles.jobRight}>
              <StatusBadge status={job.status} />
              <div className={styles.jobStats}>
                <span className={styles.applicants}>{job.applicants} applicants</span>
                <span className={styles.deadline}>Closes {job.deadline}</span>
              </div>
              <div className={styles.jobActions}>
                <button className={styles.actionBtn}>Edit</button>
                <Link href={`/dashboard/jobs/${job.id}/applicants`} className={`${styles.actionBtn} ${styles.viewBtn}`}>
                  View Applicants
                </Link>
              </div>
            </div>
          </div>
        ))}
        {jobs.length === 0 && <p className={styles.empty}>No job postings match your criteria.</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { active: ['Active', '#d1fae5', '#059669'], draft: ['Draft', '#f3f4f6', '#6b7280'], closed: ['Closed', '#fee2e2', '#dc2626'] };
  const [label, bg, color] = map[status] ?? ['Unknown', '#f3f4f6', '#6b7280'];
  return <span style={{ background: bg, color, padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, display: 'inline-block' }}>{label}</span>;
}

function BriefcaseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>;
}
