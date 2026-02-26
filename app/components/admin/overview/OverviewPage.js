'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_ADMIN_STATS, MOCK_ADMIN_ACTIVITIES } from '@/app/lib/mockData';
import styles from './OverviewPage.module.css';

const ACTIVITY_ICONS = {
  institution_joined: '🏢',
  verification_submitted: '📄',
  verification_approved: '✅',
  contract_signed: '📝',
  institution_suspended: '⚠️',
  job_posted: '💼',
  lecturer_hired: '👨‍🏫',
  payment_received: '💰',
};

export default function OverviewPage() {
  const stats = MOCK_ADMIN_STATS;
  const [activities] = useState(MOCK_ADMIN_ACTIVITIES);

  return (
    <div className={styles.page}>
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dbeafe' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Institutions</p>
            <p className={styles.statValue}>{stats.institutions.total}</p>
            <p className={styles.statMeta}>
              <span className={styles.statActive}>{stats.institutions.active} active</span>
              {stats.institutions.suspended > 0 && (
                <span className={styles.statSuspended}> · {stats.institutions.suspended} suspended</span>
              )}
            </p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dcfce7' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Lecturers</p>
            <p className={styles.statValue}>{stats.lecturers.total}</p>
            <p className={styles.statMeta}>
              <span className={styles.statActive}>{stats.lecturers.active} active</span>
            </p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fef3c7' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a16207" strokeWidth="2.5">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Active Jobs</p>
            <p className={styles.statValue}>{stats.jobs.active}</p>
            <p className={styles.statMeta}>
              <span className={styles.statActive}>{stats.jobs.filled} filled</span>
            </p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fee2e2' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Revenue (This Month)</p>
            <p className={styles.statValue}>${(stats.revenue.thisMonth / 1000).toFixed(1)}k</p>
            <p className={styles.statMeta}>
              <span className={styles.statGrowth}>
                ↑ {stats.revenue.growth}% vs last month
              </span>
            </p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f3e8ff' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b21a8" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Active Contracts</p>
            <p className={styles.statValue}>{stats.contracts.active}</p>
            <p className={styles.statMeta}>
              <span className={styles.statActive}>All signed</span>
            </p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fce7f3' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9f1239" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Pending Verifications</p>
            <p className={styles.statValue}>{stats.verifications.pending}</p>
            <p className={styles.statMeta}>
              <span className={styles.statActive}>{stats.verifications.approved} approved</span>
              {stats.verifications.rejected > 0 && (
                <span className={styles.statSuspended}> · {stats.verifications.rejected} rejected</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.activitySection}>
        <div className={styles.activityHeader}>
          <h2 className={styles.activityTitle}>Recent Activity</h2>
          <p className={styles.activitySub}>Latest platform-wide events</p>
        </div>

        <div className={styles.activityList}>
          {activities.map((act) => (
            <div key={act.id} className={styles.activityRow}>
              <div className={styles.activityIcon}>
                {ACTIVITY_ICONS[act.type] || '📌'}
              </div>
              <div className={styles.activityBody}>
                <div className={styles.activityTop}>
                  <p className={styles.activityTitle2}>{act.title}</p>
                  <span className={styles.activityTime}>{act.time}</span>
                </div>
                <p className={styles.activityText}>{act.body}</p>
                {act.institutionId && (
                  <Link
                    href={`/admin/institutions/${act.institutionId}`}
                    className={styles.activityLink}
                  >
                    View institution →
                  </Link>
                )}
              </div>
              <div
                className={styles.activityAvatar}
                style={{ background: act.color }}
              >
                {act.initials}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
