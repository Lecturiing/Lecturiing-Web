'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './InstitutionDetail.module.css';
import { adminService } from '@/app/lib/services/adminService';

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
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [viewingJob, setViewingJob] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [suspendError, setSuspendError] = useState(null);
  const [emailModal, setEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    adminService.getInstitution(id)
      .then((data) => setInstitution(data))
      .catch(() => setInstitution(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.notFound}><p>Loading…</p></div>;

  if (!institution) {
    return (
      <div className={styles.notFound}>
        <p>Institution not found.</p>
        <Link href="/admin/institutions" className={styles.backLink}>← Back to institutions</Link>
      </div>
    );
  }

  const statusStyle = STATUS_COLORS[institution.status] || STATUS_COLORS.active;
  const verificationStyle = VERIFICATION_COLORS[institution.verificationStatus] || VERIFICATION_COLORS.verified;

  // Get lecturers and jobs from populated API response
  const institutionLecturers = institution.lecturers ?? [];
  const institutionJobs = institution.jobs ?? [];

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

  const handleSuspendToggle = async () => {
    const newStatus = institution.status === 'active' ? 'suspended' : 'active';
    setSuspendLoading(true);
    setSuspendError(null);
    try {
      await adminService.updateInstitutionStatus(id, newStatus);
      setInstitution((prev) => ({ ...prev, status: newStatus }));
      setConfirmSuspend(false);
    } catch (err) {
      setSuspendError(err?.message || 'Failed to update status');
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleSendEmail = () => {
    const recipient = institution.contactEmail || institution.email;
    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailto, '_blank');
    setEmailSent(true);
    setTimeout(() => { setEmailModal(false); setEmailSent(false); setEmailSubject(''); setEmailBody(''); }, 1500);
  };

  const handleDeactivateJob = async (job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      await adminService.updateJobStatus(id, job.id, newStatus);
      setInstitution((prev) => ({
        ...prev,
        jobs: prev.jobs.map((j) => j.id === job.id ? { ...j, status: newStatus } : j),
      }));
    } catch (_) {}
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await adminService.deleteJob(id, jobId);
      setInstitution((prev) => ({ ...prev, jobs: prev.jobs.filter((j) => j.id !== jobId) }));
      setConfirmDelete(null);
    } catch (_) {}
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
                  <span className={styles.contactValue}>{institution.contactName || '—'}</span>
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Email</span>
                  {institution.contactEmail ? (
                    <a href={`mailto:${institution.contactEmail}`} className={styles.contactLink}>
                      {institution.contactEmail}
                    </a>
                  ) : <span className={styles.contactValue}>—</span>}
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Phone</span>
                  <span className={styles.contactValue}>{institution.contactPhone || '—'}</span>
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
                    onClick={() => { setSuspendError(null); setConfirmSuspend(true); }}
                  >
                    ⚠ Suspend Institution
                  </button>
                )}
                {institution.status === 'suspended' && (
                  <button
                    className={`${styles.actionBtn} ${styles.actionReactivate}`}
                    onClick={() => { setSuspendError(null); setConfirmSuspend(true); }}
                  >
                    ↻ Reactivate Institution
                  </button>
                )}
                <button className={`${styles.actionBtn} ${styles.actionSecondary}`} onClick={() => setEmailModal(true)}>
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
                        {job.field} · {job.contractType} · ${job.budgetMin}–${job.budgetMax} {job.currency} · Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—'}
                      </p>
                      {job.description && (
                        <p className={styles.jobDesc}>{job.description.substring(0, 150)}…</p>
                      )}
                    </div>
                    <div className={styles.jobRight}>
                      <span className={`${styles.jobStatus} ${styles['jobStatus_' + job.status]}`}>
                        {job.status}
                      </span>
                      <div className={styles.jobActions}>
                        <button className={styles.jobActionBtn} onClick={() => setViewingJob(job)}>
                          View
                        </button>
                        <button
                          className={`${styles.jobActionBtn} ${job.status === 'active' ? styles.jobDeactivateBtn : styles.jobActivateBtn}`}
                          onClick={() => handleDeactivateJob(job)}
                        >
                          {job.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className={`${styles.jobActionBtn} ${styles.jobDeleteBtn}`} onClick={() => setConfirmDelete(job)}>
                          Delete
                        </button>
                      </div>
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

      {/* Suspend / Reactivate Confirm Modal */}
      {confirmSuspend && (
        <div className={styles.modal} onClick={() => !suspendLoading && setConfirmSuspend(false)}>
          <div className={styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {institution.status === 'active' ? 'Suspend Institution' : 'Reactivate Institution'}
              </h3>
              <button className={styles.modalClose} onClick={() => setConfirmSuspend(false)} disabled={suspendLoading}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ color: '#374151', marginBottom: 0 }}>
                {institution.status === 'active'
                  ? <>Are you sure you want to suspend <strong>{institution.name}</strong>? They will no longer be able to log in.</>
                  : <>Reactivate <strong>{institution.name}</strong>? They will regain full access.</>}
              </p>
              {suspendError && <p style={{ color: '#dc2626', marginTop: 8, marginBottom: 0 }}>{suspendError}</p>}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.jobActionBtn} onClick={() => setConfirmSuspend(false)} disabled={suspendLoading}>Cancel</button>
              <button
                className={`${styles.jobActionBtn} ${institution.status === 'active' ? styles.jobDeleteBtn : styles.jobActivateBtn}`}
                onClick={handleSuspendToggle}
                disabled={suspendLoading}
              >
                {suspendLoading ? 'Processing…' : institution.status === 'active' ? 'Yes, Suspend' : 'Yes, Reactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {emailModal && (
        <div className={styles.modal} onClick={() => setEmailModal(false)}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Send Email to {institution.name}</h3>
              <button className={styles.modalClose} onClick={() => setEmailModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ color: '#6b7280', marginBottom: 12 }}>
                To: <strong>{institution.contactEmail || institution.email}</strong>
              </p>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter subject…"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>Message</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Write your message…"
                  rows={6}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.jobActionBtn} onClick={() => setEmailModal(false)}>Cancel</button>
              <button
                className={`${styles.jobActionBtn} ${styles.jobActivateBtn}`}
                onClick={handleSendEmail}
                disabled={!emailSubject || !emailBody || emailSent}
              >
                {emailSent ? '✓ Opened' : '📧 Open in Mail App'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {viewingJob && (
        <div className={styles.modal} onClick={() => setViewingJob(null)}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{viewingJob.title}</h3>
              <button className={styles.modalClose} onClick={() => setViewingJob(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.jobDetailGrid}>
                <div className={styles.jobDetailRow}><span className={styles.jobDetailLabel}>Field</span><span>{viewingJob.field}</span></div>
                <div className={styles.jobDetailRow}><span className={styles.jobDetailLabel}>Contract Type</span><span>{viewingJob.contractType}</span></div>
                <div className={styles.jobDetailRow}><span className={styles.jobDetailLabel}>Budget</span><span>${viewingJob.budgetMin}–${viewingJob.budgetMax} {viewingJob.currency}</span></div>
                <div className={styles.jobDetailRow}><span className={styles.jobDetailLabel}>Duration</span><span>{viewingJob.duration || '—'}</span></div>
                <div className={styles.jobDetailRow}><span className={styles.jobDetailLabel}>Status</span><span className={`${styles.jobStatus} ${styles['jobStatus_' + viewingJob.status]}`}>{viewingJob.status}</span></div>
                <div className={styles.jobDetailRow}><span className={styles.jobDetailLabel}>Deadline</span><span>{viewingJob.deadline ? new Date(viewingJob.deadline).toLocaleDateString() : '—'}</span></div>
                <div className={styles.jobDetailRow}><span className={styles.jobDetailLabel}>Posted</span><span>{viewingJob.createdAt ? new Date(viewingJob.createdAt).toLocaleDateString() : '—'}</span></div>
                <div className={styles.jobDetailRow}><span className={styles.jobDetailLabel}>Applicants</span><span>{viewingJob.applicantCount ?? 0}</span></div>
              </div>
              {viewingJob.description && (
                <div className={styles.jobDetailSection}>
                  <p className={styles.jobDetailLabel}>Description</p>
                  <p className={styles.jobDetailText}>{viewingJob.description}</p>
                </div>
              )}
              {Array.isArray(viewingJob.requirements) && viewingJob.requirements.length > 0 && (
                <div className={styles.jobDetailSection}>
                  <p className={styles.jobDetailLabel}>Requirements</p>
                  <ul className={styles.jobDetailList}>
                    {viewingJob.requirements.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.jobActionBtn} ${viewingJob.status === 'active' ? styles.jobDeactivateBtn : styles.jobActivateBtn}`}
                onClick={() => { handleDeactivateJob(viewingJob); setViewingJob((j) => ({ ...j, status: j.status === 'active' ? 'closed' : 'active' })); }}
              >
                {viewingJob.status === 'active' ? 'Deactivate Job' : 'Activate Job'}
              </button>
              <button className={`${styles.jobActionBtn} ${styles.jobDeleteBtn}`} onClick={() => { setViewingJob(null); setConfirmDelete(viewingJob); }}>
                Delete Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className={styles.modal} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Delete Job</h3>
              <button className={styles.modalClose} onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ color: '#374151', marginBottom: 0 }}>
                Are you sure you want to permanently delete <strong>{confirmDelete.title}</strong>? This cannot be undone.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.jobActionBtn} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className={`${styles.jobActionBtn} ${styles.jobDeleteBtn}`} onClick={() => handleDeleteJob(confirmDelete.id)}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
