'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_LECTURERS } from '@/app/lib/mockData';
import styles from './LecturersPage.module.css';

const TABS = ['All', 'Pending Approval', 'Active', 'Suspended'];

const STATUS_COLORS = {
  active: { bg: '#d1fae5', text: '#065f46' },
  suspended: { bg: '#fee2e2', text: '#991b1b' },
  deleted: { bg: '#f3f4f6', text: '#6b7280' },
};

const APPROVAL_COLORS = {
  approved: { bg: '#dbeafe', text: '#1e40af' },
  pending: { bg: '#fef3c7', text: '#92400e' },
  rejected: { bg: '#fee2e2', text: '#991b1b' },
};

export default function LecturersPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [lecturers, setLecturers] = useState(MOCK_LECTURERS);
  const [searchQuery, setSearchQuery] = useState('');

  const filterByTab = (tab) => {
    if (tab === 'All') return lecturers;
    if (tab === 'Pending Approval') return lecturers.filter((l) => l.approvalStatus === 'pending');
    if (tab === 'Active') return lecturers.filter((l) => l.accountStatus === 'active' && l.approvalStatus === 'approved');
    if (tab === 'Suspended') return lecturers.filter((l) => l.accountStatus === 'suspended');
    return lecturers;
  };

  const filtered = filterByTab(activeTab).filter((lec) =>
    lec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lec.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lec.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = lecturers.filter((l) => l.approvalStatus === 'pending').length;
  const suspendedCount = lecturers.filter((l) => l.accountStatus === 'suspended').length;

  const handleApprove = (id) => {
    setLecturers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, approvalStatus: 'approved' } : l))
    );
  };

  const handleReject = (id) => {
    setLecturers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, approvalStatus: 'rejected' } : l))
    );
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Lecturers</h2>
          <p className={styles.sub}>
            {lecturers.length} total lecturers · {pendingCount} pending approval
          </p>
        </div>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search lecturers..."
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
            {t === 'Pending Approval' && pendingCount > 0 && (
              <span className={styles.tabBadge}>{pendingCount}</span>
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
              <th>Lecturer</th>
              <th>Field</th>
              <th>Qualification</th>
              <th>Location</th>
              <th>Rate</th>
              <th>Account Status</th>
              <th>Approval</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" className={styles.empty}>
                  No lecturers found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((lec) => {
                const statusStyle = STATUS_COLORS[lec.accountStatus] || STATUS_COLORS.active;
                const approvalStyle = APPROVAL_COLORS[lec.approvalStatus] || APPROVAL_COLORS.approved;

                return (
                  <tr key={lec.id} className={styles.row}>
                    <td>
                      <div className={styles.lecturerCell}>
                        <div
                          className={styles.lecturerAvatar}
                          style={{ background: lec.color }}
                        >
                          {lec.initials}
                        </div>
                        <div className={styles.lecturerInfo}>
                          <p className={styles.lecturerName}>{lec.name}</p>
                          <p className={styles.lecturerTitle}>{lec.title}</p>
                        </div>
                      </div>
                    </td>
                    <td>{lec.field}</td>
                    <td>{lec.qualification}</td>
                    <td>{lec.country}</td>
                    <td className={styles.rate}>${lec.rate}/hr</td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{ background: statusStyle.bg, color: statusStyle.text }}
                      >
                        {lec.accountStatus}
                      </span>
                    </td>
                    <td>
                      <span
                        className={styles.approvalBadge}
                        style={{ background: approvalStyle.bg, color: approvalStyle.text }}
                      >
                        {lec.approvalStatus}
                      </span>
                    </td>
                    <td className={styles.joined}>{lec.joinedAt}</td>
                    <td>
                      <div className={styles.actionBtns}>
                        {lec.approvalStatus === 'pending' && (
                          <>
                            <button
                              className={styles.approveBtn}
                              onClick={() => handleApprove(lec.id)}
                              title="Approve"
                            >
                              ✓
                            </button>
                            <button
                              className={styles.rejectBtn}
                              onClick={() => handleReject(lec.id)}
                              title="Reject"
                            >
                              ✕
                            </button>
                          </>
                        )}
                        <Link
                          href={`/admin/lecturers/${lec.id}`}
                          className={styles.viewBtn}
                          title="View Details"
                        >
                          →
                        </Link>
                      </div>
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
