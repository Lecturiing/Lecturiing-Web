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

export default function InstitutionDetail({ id }) {
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [viewingJob, setViewingJob] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewingApplications, setViewingApplications] = useState(null); // { job, applications }
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [suspendError, setSuspendError] = useState(null);
  const [emailModal, setEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [expandedLec, setExpandedLec] = useState(null);
  const [lecTxs, setLecTxs] = useState({}); // { [lecturerId]: { loading, transactions } }

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

  const institutionLecturers = institution.lecturers ?? [];
  const institutionJobs = institution.jobs ?? [];
  const verificationDocs = institution.verificationDocs ?? [];
  const revenue = institution.revenue ?? { allTime: 0, thisMonth: 0 };

  const handleAction = async (decision) => {
    setVerifyLoading(true);
    try {
      await adminService.reviewVerification(id, decision);
      setInstitution((prev) => ({
        ...prev,
        verificationStatus: decision === 'approve' ? 'verified' : 'failed',
      }));
    } catch (_) {}
    setVerifyLoading(false);
  };

  const handleToggleLec = (lecturerId) => {
    if (expandedLec === lecturerId) { setExpandedLec(null); return; }
    setExpandedLec(lecturerId);
    if (!lecTxs[lecturerId]) {
      setLecTxs((prev) => ({ ...prev, [lecturerId]: { loading: true, transactions: [] } }));
      adminService.getLecturerTransactions(id, lecturerId)
        .then((data) => setLecTxs((prev) => ({ ...prev, [lecturerId]: { loading: false, transactions: data?.transactions ?? [] } })))
        .catch(() => setLecTxs((prev) => ({ ...prev, [lecturerId]: { loading: false, transactions: [] } })));
    }
  };

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

  const handleViewApplications = async (job) => {
    setApplicationsLoading(true);
    setViewingApplications({ job, applications: [] });
    try {
      const data = await adminService.getJobApplications(id, job.id);
      setViewingApplications({ job, applications: data?.applications ?? [] });
    } catch (_) {
      setViewingApplications({ job, applications: [] });
    } finally {
      setApplicationsLoading(false);
    }
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
            {(institution.verificationStatus ?? '').replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Jobs Posted</p>
          <p className={styles.statValue}>{institutionJobs.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Hired Lecturers</p>
          <p className={styles.statValue}>{institutionLecturers.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Commission (This Month)</p>
          <p className={styles.statValue}>${revenue.thisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Commission (All Time)</p>
          <p className={styles.statValue}>${revenue.allTime.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
            {/* Profile Info */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Institution Profile</h3>
              <div className={styles.contactGrid}>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Email</span>
                  <a href={`mailto:${institution.email}`} className={styles.contactLink}>{institution.email}</a>
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Contact Person</span>
                  <span className={styles.contactValue}>{institution.contactName || '—'}</span>
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Contact Email</span>
                  {institution.contactEmail ? (
                    <a href={`mailto:${institution.contactEmail}`} className={styles.contactLink}>{institution.contactEmail}</a>
                  ) : <span className={styles.contactValue}>—</span>}
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Phone</span>
                  <span className={styles.contactValue}>{institution.contactPhone || '—'}</span>
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Address</span>
                  <span className={styles.contactValue}>{institution.address || '—'}</span>
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Size</span>
                  <span className={styles.contactValue}>{institution.size || '—'}</span>
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Website</span>
                  {institution.website ? (
                    <a href={institution.website} target="_blank" rel="noreferrer" className={styles.contactLink}>{institution.website}</a>
                  ) : <span className={styles.contactValue}>—</span>}
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>LinkedIn</span>
                  {institution.linkedIn ? (
                    <a href={institution.linkedIn} target="_blank" rel="noreferrer" className={styles.contactLink}>{institution.linkedIn}</a>
                  ) : <span className={styles.contactValue}>—</span>}
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Email Verified</span>
                  <span className={styles.contactValue}>{institution.emailVerified ? '✓ Yes' : '✕ No'}</span>
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Onboarding</span>
                  <span className={styles.contactValue}>{institution.onboardingComplete ? '✓ Complete' : 'Incomplete'}</span>
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Plan</span>
                  <span className={styles.contactValue}>{institution.plan}</span>
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Joined</span>
                  <span className={styles.contactValue}>{institution.joinedAt ? new Date(institution.joinedAt).toLocaleDateString() : '—'}</span>
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Last Active</span>
                  <span className={styles.contactValue}>{institution.lastActive ? new Date(institution.lastActive).toLocaleDateString() : '—'}</span>
                </div>
              </div>
            </div>

            {/* Verification Documents */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Verification Documents</h3>
              {verificationDocs.length === 0 ? (
                <p className={styles.contactValue} style={{ color: '#9ca3af' }}>No documents submitted.</p>
              ) : (
                <div className={styles.docList}>
                  {verificationDocs.map((doc) => (
                    <div key={doc.id} className={styles.docRow}>
                      <div className={styles.docInfo}>
                        <p className={styles.docLabel}>{doc.label}</p>
                        {doc.description && <p className={styles.docDesc}>{doc.description}</p>}
                        <p className={styles.docMeta}>
                          Submitted {doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString() : '—'}
                          {doc.reviewedAt ? ` · Reviewed ${new Date(doc.reviewedAt).toLocaleDateString()}` : ''}
                        </p>
                        {doc.reviewNote && <p className={styles.docNote}>{doc.reviewNote}</p>}
                      </div>
                      <div className={styles.docRight}>
                        <span
                          className={styles.docStatus}
                          style={{
                            background: doc.status === 'approved' ? '#d1fae5' : doc.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                            color: doc.status === 'approved' ? '#065f46' : doc.status === 'rejected' ? '#991b1b' : '#92400e',
                          }}
                        >
                          {doc.status}
                        </span>
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className={styles.docLink}>
                          View →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                      disabled={verifyLoading}
                    >
                      ✓ Approve Verification
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.actionReject}`}
                      onClick={() => handleAction('reject')}
                      disabled={verifyLoading}
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
                <p className={styles.emptyTitle}>No lecturers hired yet</p>
                <p className={styles.emptySub}>This institution hasn&apos;t hired any lecturers yet.</p>
              </div>
            ) : (
              <div className={styles.lecturersList}>
                {institutionLecturers.map((lec) => {
                  const isOpen = expandedLec === lec.id;
                  const txData = lecTxs[lec.id] ?? { loading: false, transactions: [] };
                  const totalPaid = txData.transactions
                    .filter((t) => t.status !== 'failed')
                    .reduce((s, t) => s + parseFloat(t.amount ?? 0), 0);

                  return (
                    <div key={lec.hireId} className={`${styles.lecturerCard} ${isOpen ? styles.lecturerCardOpen : ''}`}>
                      {/* Header row — click to expand */}
                      <div className={styles.lecturerRow} onClick={() => handleToggleLec(lec.id)} style={{ cursor: 'pointer' }}>
                        <div className={styles.lecturerLeft}>
                          <div className={styles.lecturerAvatar} style={{ background: lec.color }}>
                            {lec.initials}
                          </div>
                          <div className={styles.lecturerInfo}>
                            <p className={styles.lecturerName}>{lec.name}</p>
                            <p className={styles.lecturerTitle}>{lec.title || '—'}</p>
                            <p className={styles.lecturerMeta}>
                              {lec.field || '—'} · {lec.qualification || '—'} · Hired {lec.hiredAt ? new Date(lec.hiredAt).toLocaleDateString() : '—'}
                            </p>
                            {lec.jobTitle && <p className={styles.lecturerMeta}>Job: {lec.jobTitle}</p>}
                          </div>
                        </div>
                        <div className={styles.lecturerStats}>
                          <div className={styles.lecturerStat}>
                            <span className={styles.lecturerStatLabel}>Rate</span>
                            <span className={styles.lecturerStatValue}>${lec.hourlyRate}/{lec.contractType === 'monthly' ? 'mo' : 'hr'}</span>
                          </div>
                          <div className={styles.lecturerStat}>
                            <span className={styles.lecturerStatLabel}>Contract</span>
                            <span className={styles.lecturerStatValue}>{lec.contractType}</span>
                          </div>
                          <div className={styles.lecturerStat}>
                            <span className={styles.lecturerStatLabel}>Status</span>
                            <span className={styles.lecturerStatValue} style={{ color: lec.hireStatus === 'active' ? '#059669' : '#f59e0b' }}>
                              {lec.hireStatus}
                            </span>
                          </div>
                          {(lec.startDate || lec.endDate) && (
                            <div className={styles.lecturerStat}>
                              <span className={styles.lecturerStatLabel}>Period</span>
                              <span className={styles.lecturerStatValue}>
                                {lec.startDate ? new Date(lec.startDate).toLocaleDateString() : '—'}
                                {' → '}
                                {lec.endDate ? new Date(lec.endDate).toLocaleDateString() : 'Ongoing'}
                              </span>
                            </div>
                          )}
                          <div className={styles.lecturerStat}>
                            <span className={styles.lecturerStatLabel}>Total Paid</span>
                            <span className={styles.lecturerStatValue} style={{ color: '#4f46e5' }}>
                              {totalPaid > 0 ? `$${totalPaid.toFixed(2)}` : '—'}
                            </span>
                          </div>
                        </div>
                        <span className={styles.lecChevron} style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                      </div>

                      {/* Expanded: transaction history */}
                      {isOpen && (
                        <div className={styles.lecTxPanel}>
                          <p className={styles.lecTxTitle}>Payment History</p>
                          {txData.loading ? (
                            <p className={styles.lecTxEmpty}>Loading…</p>
                          ) : txData.transactions.length === 0 ? (
                            <p className={styles.lecTxEmpty}>No payments made to this lecturer yet.</p>
                          ) : (
                            <>
                              <div className={styles.lecTxList}>
                                {txData.transactions.map((tx) => {
                                  const gross      = parseFloat(tx.amount ?? 0);
                                  const commission = parseFloat(tx.metadata?.commission ?? 0);
                                  const payout     = parseFloat(tx.metadata?.payout ?? 0);
                                  const isFailed   = tx.status === 'failed';
                                  return (
                                    <div key={tx.id} className={`${styles.lecTxRow} ${isFailed ? styles.lecTxRowFailed : ''}`}>
                                      <div className={styles.lecTxInfo}>
                                        <p className={styles.lecTxDesc}>{tx.description || 'Direct payment'}</p>
                                        <p className={styles.lecTxMeta}>
                                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                          {commission > 0 && <> · Fee: ${commission.toFixed(2)}</>}
                                          {payout > 0 && <> · Lecturer got: ${payout.toFixed(2)}</>}
                                        </p>
                                      </div>
                                      <div className={styles.lecTxRight}>
                                        <span className={`${styles.lecTxAmount} ${isFailed ? styles.lecTxAmountFailed : ''}`}>
                                          − {tx.currency ?? 'USD'} {gross.toFixed(2)}
                                        </span>
                                        {isFailed && <span className={styles.lecTxFailedBadge}>Failed</span>}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className={styles.lecTxSummary}>
                                <span>Total paid</span>
                                <span>${totalPaid.toFixed(2)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
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
                      <span className={styles.jobApplicantCount}>
                        {job.applicantCount ?? 0} applicant{job.applicantCount !== 1 ? 's' : ''}
                      </span>
                      <div className={styles.jobActions}>
                        <button className={styles.jobActionBtn} onClick={() => setViewingJob(job)}>
                          Details
                        </button>
                        <button className={`${styles.jobActionBtn} ${styles.jobApplicantsBtn}`} onClick={() => handleViewApplications(job)}>
                          Applicants
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
            <h3 className={styles.sectionTitle}>Platform Commission</h3>
            <div className={styles.revenueCards}>
              <div className={styles.revenueCard}>
                <p className={styles.revenueLabel}>This Month</p>
                <p className={styles.revenueValue} style={{ color: '#dc2626' }}>
                  ${revenue.thisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={styles.revenueSub}>Reimbursement commissions + escrow fees</p>
              </div>
              <div className={styles.revenueCard}>
                <p className={styles.revenueLabel}>All Time</p>
                <p className={styles.revenueValue} style={{ color: '#dc2626' }}>
                  ${revenue.allTime.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={styles.revenueSub}>Total platform revenue from this institution</p>
              </div>
              <div className={styles.revenueCard}>
                <p className={styles.revenueLabel}>Hired Lecturers</p>
                <p className={styles.revenueValue}>{institutionLecturers.length}</p>
                <p className={styles.revenueSub}>Active engagements</p>
              </div>
            </div>
            <div className={styles.paymentNote}>
              Commission is collected at 10% on direct lecturer reimbursements and 2% on escrow contract locks.
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

      {/* Job Applications Modal */}
      {viewingApplications && (
        <div className={styles.modal} onClick={() => setViewingApplications(null)}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Applicants — {viewingApplications.job.title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                  {viewingApplications.job.field} · {viewingApplications.job.contractType} · ${viewingApplications.job.budgetMin}–${viewingApplications.job.budgetMax} {viewingApplications.job.currency}
                </p>
              </div>
              <button className={styles.modalClose} onClick={() => setViewingApplications(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {applicationsLoading ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>Loading applicants…</p>
              ) : viewingApplications.applications.length === 0 ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>No applications yet for this job.</p>
              ) : (
                <div className={styles.appList}>
                  {viewingApplications.applications.map((app) => {
                    const lec = app.lecturer ?? {};
                    const statusMeta = {
                      pending:              { label: 'Pending',    bg: '#f3f4f6', color: '#6b7280' },
                      shortlisted:          { label: 'Shortlisted', bg: '#ede9fe', color: '#4f46e5' },
                      interview_scheduled:  { label: 'Interview',  bg: '#dbeafe', color: '#1d4ed8' },
                      declined:             { label: 'Declined',   bg: '#fee2e2', color: '#dc2626' },
                      offer_sent:           { label: 'Offer Sent', bg: '#d1fae5', color: '#059669' },
                    }[app.status] ?? { label: app.status, bg: '#f3f4f6', color: '#6b7280' };
                    return (
                      <div key={app.id} className={styles.appRow}>
                        <div className={styles.appAvatar} style={{ background: lec.color }}>
                          {lec.initials || '?'}
                        </div>
                        <div className={styles.appInfo}>
                          <p className={styles.appName}>{lec.name || 'Unknown'}</p>
                          <p className={styles.appMeta}>
                            {lec.title || '—'} · {lec.country || '—'}
                            {lec.hourlyRate ? ` · $${lec.hourlyRate}/hr` : ''}
                            {lec.rating ? ` · ★ ${Number(lec.rating).toFixed(1)}` : ''}
                          </p>
                          {app.coverNote && (
                            <p className={styles.appCover}>&ldquo;{app.coverNote}&rdquo;</p>
                          )}
                        </div>
                        <div className={styles.appRight}>
                          <span className={styles.appStatus} style={{ background: statusMeta.bg, color: statusMeta.color }}>
                            {statusMeta.label}
                          </span>
                          <span className={styles.appDate}>
                            {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>
                {viewingApplications.applications.length} total applicant{viewingApplications.applications.length !== 1 ? 's' : ''}
              </span>
              <button className={styles.jobActionBtn} onClick={() => setViewingApplications(null)}>Close</button>
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
