'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MOCK_INSTITUTIONS,
  MOCK_JOBS,
  MOCK_LECTURERS,
  MOCK_INSTITUTION_LECTURERS,
  MOCK_INSTITUTION_JOBS
} from '@/app/lib/mockData';
import styles from './InstitutionDetail.module.css';

const STATUS_COLORS = {
  active: { bg: '#d1fae5', text: '#065f46' },
  suspended: { bg: '#fee2e2', text: '#991b1b' },
};

const VERIFICATION_COLORS = {
  verified: { bg: '#dbeafe', text: '#1e40af' },
  in_review: { bg: '#fef3c7', text: '#92400e' },
  failed: { bg: '#fee2e2', text: '#991b1b' },
};

const TABS = ['Overview', 'Lecturers', 'Jobs', 'Revenue'];
const PLATFORM_COMMISSION = 0.10; // 10% commission

export default function InstitutionDetail({ id }) {
  const institution = MOCK_INSTITUTIONS.find((i) => i.id === id);
  const [activeTab, setActiveTab] = useState('Overview');
  const [actionModal, setActionModal] = useState(null);

  if (!institution) {
    return (
      <div className={styles.notFound}>
        <p>Institution not found.</p>
        <Link href="/admin/institutions" className={styles.backLink}>
          ← Back to institutions
        </Link>
      </div>
    );
  }

  const statusStyle = STATUS_COLORS[institution.status] || STATUS_COLORS.active;
  const verificationStyle = VERIFICATION_COLORS[institution.verificationStatus] || VERIFICATION_COLORS.verified;

  // Get lecturers for this institution
  const institutionLecturerAssignments = MOCK_INSTITUTION_LECTURERS[id] || [];
  const institutionLecturers = institutionLecturerAssignments.map((assignment) => {
    const lecturer = MOCK_LECTURERS.find((l) => l.id === assignment.lecturerId);
    return { ...lecturer, ...assignment };
  });

  // Get jobs for this institution
  const institutionJobIds = MOCK_INSTITUTION_JOBS[id] || [];
  const institutionJobs = institutionJobIds.map((jobId) =>
    MOCK_JOBS.find((j) => j.id === jobId)
  ).filter(Boolean);

  // Calculate revenue breakdown
  const lecturerPayments = institutionLecturers.map((lec) => ({
    lecturer: lec,
    hours: lec.hoursThisMonth,
    rate: lec.rate,
    grossPay: lec.hoursThisMonth * lec.rate,
    commission: lec.hoursThisMonth * lec.rate * PLATFORM_COMMISSION,
    netPay: lec.hoursThisMonth * lec.rate * (1 - PLATFORM_COMMISSION),
  }));

  const totalGrossPay = lecturerPayments.reduce((sum, p) => sum + p.grossPay, 0);
  const totalCommission = lecturerPayments.reduce((sum, p) => sum + p.commission, 0);
  const totalNetPay = lecturerPayments.reduce((sum, p) => sum + p.netPay, 0);

  const handleAction = (action) => {
    setActionModal(action);
    setTimeout(() => setActionModal(null), 2000);
  };

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/admin/institutions" className={styles.breadcrumbLink}>
          Institutions
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{institution.name}</span>
      </div>

      {/* Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.headerLeft}>
          <div className={styles.avatar} style={{ background: institution.color }}>
            {institution.initials}
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.instName}>{institution.name}</h1>
            <p className={styles.instMeta}>
              {institution.type} · {institution.city}, {institution.country} · {institution.plan} plan
            </p>
            <p className={styles.instJoined}>Joined {institution.joinedAt} · Last active {institution.lastActive}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span
            className={styles.statusBadge}
            style={{ background: statusStyle.bg, color: statusStyle.text }}
          >
            {institution.status}
          </span>
          <span
            className={styles.verificationBadge}
            style={{ background: verificationStyle.bg, color: verificationStyle.text }}
          >
            {institution.verificationStatus.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Active Jobs</p>
          <p className={styles.statValue}>{institutionJobs.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Lecturers</p>
          <p className={styles.statValue}>{institutionLecturers.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Hours (This Month)</p>
          <p className={styles.statValue}>
            {institutionLecturers.reduce((sum, l) => sum + l.hoursThisMonth, 0)}
          </p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Platform Commission</p>
          <p className={styles.statValue}>${totalCommission.toLocaleString()}</p>
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
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* Overview Tab */}
        {activeTab === 'Overview' && (
          <div className={styles.overviewGrid}>
            {/* Contact Info */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Contact Information</h3>
              <div className={styles.contactGrid}>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Contact Person</span>
                  <span className={styles.contactValue}>{institution.contact.name}</span>
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Email</span>
                  <a href={`mailto:${institution.contact.email}`} className={styles.contactLink}>
                    {institution.contact.email}
                  </a>
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Phone</span>
                  <span className={styles.contactValue}>{institution.contact.phone}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Actions</h3>
              <div className={styles.actions}>
                {institution.verificationStatus === 'in_review' && (
                  <>
                    <button
                      className={`${styles.actionBtn} ${styles.actionApprove}`}
                      onClick={() => handleAction('approve')}
                    >
                      ✓ Approve Verification
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.actionReject}`}
                      onClick={() => handleAction('reject')}
                    >
                      ✕ Reject Verification
                    </button>
                  </>
                )}
                {institution.status === 'active' && (
                  <button
                    className={`${styles.actionBtn} ${styles.actionSuspend}`}
                    onClick={() => handleAction('suspend')}
                  >
                    ⚠ Suspend Institution
                  </button>
                )}
                {institution.status === 'suspended' && (
                  <button
                    className={`${styles.actionBtn} ${styles.actionReactivate}`}
                    onClick={() => handleAction('reactivate')}
                  >
                    ↻ Reactivate Institution
                  </button>
                )}
                <button className={`${styles.actionBtn} ${styles.actionSecondary}`}>
                  📧 Send Email
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lecturers Tab */}
        {activeTab === 'Lecturers' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Attached Lecturers</h3>
              <span className={styles.sectionCount}>{institutionLecturers.length}</span>
            </div>
            {institutionLecturers.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>No lecturers attached</p>
                <p className={styles.emptySub}>This institution hasn&apos;t hired any lecturers yet.</p>
              </div>
            ) : (
              <div className={styles.lecturersList}>
                {institutionLecturers.map((lec) => (
                  <div key={lec.id} className={styles.lecturerRow}>
                    <div className={styles.lecturerLeft}>
                      <div className={styles.lecturerAvatar} style={{ background: lec.color }}>
                        {lec.initials}
                      </div>
                      <div className={styles.lecturerInfo}>
                        <p className={styles.lecturerName}>{lec.name}</p>
                        <p className={styles.lecturerTitle}>{lec.title}</p>
                        <p className={styles.lecturerMeta}>
                          {lec.field} · {lec.qualification} · Hired {lec.hiredDate}
                        </p>
                      </div>
                    </div>
                    <div className={styles.lecturerStats}>
                      <div className={styles.lecturerStat}>
                        <span className={styles.lecturerStatLabel}>Rate</span>
                        <span className={styles.lecturerStatValue}>${lec.rate}/hr</span>
                      </div>
                      <div className={styles.lecturerStat}>
                        <span className={styles.lecturerStatLabel}>Hours (This Month)</span>
                        <span className={styles.lecturerStatValue}>{lec.hoursThisMonth}h</span>
                      </div>
                      <div className={styles.lecturerStat}>
                        <span className={styles.lecturerStatLabel}>Gross Pay</span>
                        <span className={styles.lecturerStatValue}>
                          ${(lec.hoursThisMonth * lec.rate).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'Jobs' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Job Postings</h3>
              <span className={styles.sectionCount}>{institutionJobs.length}</span>
            </div>
            {institutionJobs.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>No jobs posted</p>
                <p className={styles.emptySub}>This institution hasn&apos;t created any job postings yet.</p>
              </div>
            ) : (
              <div className={styles.jobsList}>
                {institutionJobs.map((job) => (
                  <div key={job.id} className={styles.jobRow}>
                    <div className={styles.jobInfo}>
                      <p className={styles.jobTitle}>{job.title}</p>
                      <p className={styles.jobMeta}>
                        {job.field} · {job.contract} · ${job.salary}/hr · Posted {job.postedAt}
                      </p>
                      {job.description && (
                        <p className={styles.jobDesc}>{job.description.substring(0, 150)}...</p>
                      )}
                    </div>
                    <div className={styles.jobRight}>
                      <span className={`${styles.jobStatus} ${styles['jobStatus' + job.status]}`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'Revenue' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Revenue Breakdown (This Month)</h3>

            {/* Summary Cards */}
            <div className={styles.revenueCards}>
              <div className={styles.revenueCard}>
                <p className={styles.revenueLabel}>Total Lecturer Payments</p>
                <p className={styles.revenueValue}>${totalGrossPay.toLocaleString()}</p>
                <p className={styles.revenueSub}>Before commission</p>
              </div>
              <div className={styles.revenueCard}>
                <p className={styles.revenueLabel}>Platform Commission (10%)</p>
                <p className={styles.revenueValue} style={{ color: '#dc2626' }}>
                  ${totalCommission.toLocaleString()}
                </p>
                <p className={styles.revenueSub}>Revenue from this institution</p>
              </div>
              <div className={styles.revenueCard}>
                <p className={styles.revenueLabel}>Lecturer Net Pay</p>
                <p className={styles.revenueValue}>${totalNetPay.toLocaleString()}</p>
                <p className={styles.revenueSub}>After 10% commission</p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className={styles.paymentTable}>
              <h4 className={styles.paymentTableTitle}>Lecturer Payment Details</h4>
              {lecturerPayments.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyTitle}>No payments this month</p>
                  <p className={styles.emptySub}>No lecturers have logged hours yet.</p>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Lecturer</th>
                      <th>Hours</th>
                      <th>Rate</th>
                      <th>Gross Pay</th>
                      <th>Commission (10%)</th>
                      <th>Net Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lecturerPayments.map((payment) => (
                      <tr key={payment.lecturer.id}>
                        <td>
                          <div className={styles.tableInstCell}>
                            <div
                              className={styles.tableAvatar}
                              style={{ background: payment.lecturer.color }}
                            >
                              {payment.lecturer.initials}
                            </div>
                            <span className={styles.tableName}>{payment.lecturer.name}</span>
                          </div>
                        </td>
                        <td>{payment.hours}h</td>
                        <td>${payment.rate}/hr</td>
                        <td className={styles.tableAmount}>${payment.grossPay.toLocaleString()}</td>
                        <td className={styles.tableCommission}>
                          -${payment.commission.toLocaleString()}
                        </td>
                        <td className={styles.tableNetPay}>${payment.netPay.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className={styles.tableTotalRow}>
                      <td colSpan="3"><strong>Total</strong></td>
                      <td className={styles.tableAmount}>
                        <strong>${totalGrossPay.toLocaleString()}</strong>
                      </td>
                      <td className={styles.tableCommission}>
                        <strong>-${totalCommission.toLocaleString()}</strong>
                      </td>
                      <td className={styles.tableNetPay}>
                        <strong>${totalNetPay.toLocaleString()}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
              <div className={styles.paymentNote}>
                <strong>Payment Schedule:</strong> Lecturers are paid at the end of each month based on their logged hours.
                Platform retains 10% commission from all payments.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            ✓ Action &quot;{actionModal}&quot; simulated successfully
          </div>
        </div>
      )}
    </div>
  );
}
