'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_INSTITUTIONS } from '@/app/lib/mockData';
import styles from './InstitutionsPage.module.css';

const STATUS_COLORS = {
  active: { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  suspended: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
  pending: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
};

const VERIFICATION_COLORS = {
  verified: { bg: '#dbeafe', text: '#1e40af', icon: '✓' },
  in_review: { bg: '#fef3c7', text: '#92400e', icon: '⏳' },
  failed: { bg: '#fee2e2', text: '#991b1b', icon: '✕' },
};

const TABS = ['All', 'Active', 'Pending Verification', 'Suspended'];

function filterByTab(institutions, tab) {
  if (tab === 'All') return institutions;
  if (tab === 'Active') return institutions.filter((i) => i.status === 'active');
  if (tab === 'Pending Verification') return institutions.filter((i) => i.verificationStatus === 'in_review');
  if (tab === 'Suspended') return institutions.filter((i) => i.status === 'suspended');
  return institutions;
}

export default function InstitutionsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [institutions] = useState(MOCK_INSTITUTIONS);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = filterByTab(institutions, activeTab).filter((inst) =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingVerificationCount = institutions.filter((i) => i.verificationStatus === 'in_review').length;
  const suspendedCount = institutions.filter((i) => i.status === 'suspended').length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Institutions</h2>
          <p className={styles.sub}>
            {institutions.length} total institutions · {pendingVerificationCount} pending verification
          </p>
        </div>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search institutions..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
            {t === 'Pending Verification' && pendingVerificationCount > 0 && (
              <span className={styles.tabBadge}>{pendingVerificationCount}</span>
            )}
            {t === 'Suspended' && suspendedCount > 0 && (
              <span className={styles.tabBadge}>{suspendedCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Institution</th>
              <th>Type</th>
              <th>Location</th>
              <th>Status</th>
              <th>Verification</th>
              <th>Jobs</th>
              <th>Lecturers</th>
              <th>Revenue/mo</th>
              <th>Last Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="10" className={styles.empty}>
                  No institutions found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((inst) => {
                const statusStyle = STATUS_COLORS[inst.status] || STATUS_COLORS.active;
                const verificationStyle = VERIFICATION_COLORS[inst.verificationStatus] || VERIFICATION_COLORS.verified;

                return (
                  <tr key={inst.id} className={styles.row}>
                    <td>
                      <div className={styles.instCell}>
                        <div
                          className={styles.instAvatar}
                          style={{ background: inst.color }}
                        >
                          {inst.initials}
                        </div>
                        <div className={styles.instInfo}>
                          <p className={styles.instName}>{inst.name}</p>
                          <p className={styles.instPlan}>{inst.plan} plan</p>
                        </div>
                      </div>
                    </td>
                    <td>{inst.type}</td>
                    <td>
                      {inst.city}, {inst.country}
                    </td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{ background: statusStyle.bg, color: statusStyle.text }}
                      >
                        <span
                          className={styles.statusDot}
                          style={{ background: statusStyle.dot }}
                        />
                        {inst.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={styles.verificationBadge}
                        style={{ background: verificationStyle.bg, color: verificationStyle.text }}
                      >
                        {verificationStyle.icon} {inst.verificationStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{inst.stats.jobs}</td>
                    <td>{inst.stats.lecturers}</td>
                    <td className={styles.revenue}>${inst.monthlySpend.toLocaleString()}</td>
                    <td className={styles.lastActive}>{inst.lastActive}</td>
                    <td>
                      <Link
                        href={`/admin/institutions/${inst.id}`}
                        className={styles.viewBtn}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
