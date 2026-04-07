'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './LecturerDetail.module.css';
import { adminService } from '@/app/lib/services/adminService';

const STATUS_COLORS = {
  active: { bg: '#d1fae5', text: '#065f46' },
  suspended: { bg: '#fee2e2', text: '#991b1b' },
};

const APPROVAL_COLORS = {
  approved: { bg: '#dbeafe', text: '#1e40af' },
  pending: { bg: '#fef3c7', text: '#92400e' },
  rejected: { bg: '#fee2e2', text: '#991b1b' },
};

export default function LecturerDetail({ id }) {
  const [lecturer, setLecturer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [suspendError, setSuspendError] = useState(null);
  const [confirmApproval, setConfirmApproval] = useState(null); // 'approved' | 'rejected'
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvalError, setApprovalError] = useState(null);
  const [emailModal, setEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    adminService.getLecturer(id)
      .then((data) => setLecturer(data))
      .catch(() => setLecturer(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.notFound}><p>Loading…</p></div>;

  if (!lecturer) {
    return (
      <div className={styles.notFound}>
        <p>Lecturer not found.</p>
        <Link href="/admin/lecturers" className={styles.backLink}>← Back to lecturers</Link>
      </div>
    );
  }

  const statusStyle = STATUS_COLORS[lecturer.accountStatus] || STATUS_COLORS.active;
  const approvalStyle = APPROVAL_COLORS[lecturer.approvalStatus] || APPROVAL_COLORS.pending;

  // Safe parsing for json fields that may be null
  const specializations = Array.isArray(lecturer.specializations) ? lecturer.specializations : [];
  const workExperience = Array.isArray(lecturer.workExperience) ? lecturer.workExperience : [];
  const education = Array.isArray(lecturer.education) ? lecturer.education : [];
  const certifications = Array.isArray(lecturer.certifications) ? lecturer.certifications : [];
  const portfolio = Array.isArray(lecturer.portfolio) ? lecturer.portfolio : [];
  const languages = Array.isArray(lecturer.languages) ? lecturer.languages : [];

  // Certifications can be strings or objects
  const renderCert = (cert) => typeof cert === 'string' ? cert : (cert.name || cert.title || '');

  const handleSuspendToggle = async () => {
    const newStatus = lecturer.accountStatus === 'active' ? 'suspended' : 'active';
    setSuspendLoading(true);
    setSuspendError(null);
    try {
      await adminService.updateLecturerStatus(id, newStatus);
      setLecturer((prev) => ({ ...prev, accountStatus: newStatus }));
      setConfirmSuspend(false);
    } catch (err) {
      setSuspendError(err?.message || 'Failed to update status');
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleApprovalDecision = async () => {
    setApprovalLoading(true);
    setApprovalError(null);
    try {
      await adminService.updateLecturerApproval(id, confirmApproval);
      setLecturer((prev) => ({ ...prev, approvalStatus: confirmApproval }));
      setConfirmApproval(null);
    } catch (err) {
      setApprovalError(err?.message || 'Failed to update approval');
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleSendEmail = () => {
    const mailto = `mailto:${lecturer.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailto, '_blank');
    setEmailSent(true);
    setTimeout(() => { setEmailModal(false); setEmailSent(false); setEmailSubject(''); setEmailBody(''); }, 1500);
  };

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/admin/lecturers" className={styles.breadcrumbLink}>
          Lecturers
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{lecturer.name}</span>
      </div>

      {/* Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.headerLeft}>
          {lecturer.avatarUrl ? (
            <img src={lecturer.avatarUrl} alt={lecturer.name} className={styles.avatarImg} />
          ) : (
            <div className={styles.avatar} style={{ background: lecturer.color }}>
              {lecturer.initials}
            </div>
          )}
          <div className={styles.headerInfo}>
            <h1 className={styles.lecturerName}>{lecturer.name}</h1>
            <p className={styles.lecturerTitle}>{lecturer.title || '—'}</p>
            <p className={styles.lecturerMeta}>
              {lecturer.field} · {lecturer.qualification} · {lecturer.yearsOfExperience ?? 0} years experience
            </p>
            <p className={styles.lecturerContact}>
              📧 {lecturer.email}
              {lecturer.phone && <> · 📞 {lecturer.phone}</>}
              {lecturer.linkedIn && (
                <> · <a href={lecturer.linkedIn} target="_blank" rel="noreferrer" className={styles.linkedIn}>LinkedIn</a></>
              )}
            </p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.statusBadge} style={{ background: statusStyle.bg, color: statusStyle.text }}>
            {lecturer.accountStatus}
          </span>
          <span className={styles.approvalBadge} style={{ background: approvalStyle.bg, color: approvalStyle.text }}>
            {lecturer.approvalStatus}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Hourly Rate</p>
          <p className={styles.statValue}>${Number(lecturer.hourlyRate ?? 0).toLocaleString()} <span style={{ fontSize: 13, fontWeight: 400 }}>{lecturer.currency || 'USD'}</span></p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Rating</p>
          <p className={styles.statValue}>{lecturer.rating ? `${Number(lecturer.rating).toFixed(1)} ★` : 'N/A'}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Reviews</p>
          <p className={styles.statValue}>{lecturer.reviewCount ?? 0}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Experience</p>
          <p className={styles.statValue}>{lecturer.yearsOfExperience ?? 0} yrs</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* About */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>About</h3>
            {lecturer.bio ? (
              <p className={styles.bio}>{lecturer.bio}</p>
            ) : (
              <p className={styles.bio} style={{ color: '#9ca3af' }}>No bio provided.</p>
            )}
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Country</span>
                <span className={styles.infoValue}>{lecturer.country || '—'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Nationality</span>
                <span className={styles.infoValue}>{lecturer.nationality || '—'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Timezone</span>
                <span className={styles.infoValue}>{lecturer.timezone || '—'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Availability</span>
                <span className={styles.infoValue}>{lecturer.availability || '—'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Gender</span>
                <span className={styles.infoValue}>{lecturer.gender || '—'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Languages</span>
                <span className={styles.infoValue}>{languages.length > 0 ? languages.join(', ') : '—'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Joined</span>
                <span className={styles.infoValue}>
                  {lecturer.joinedAt ? new Date(lecturer.joinedAt).toLocaleDateString() : '—'}
                </span>
              </div>
            </div>
            {lecturer.teachingPhilosophy && (
              <div style={{ marginTop: 12 }}>
                <p className={styles.infoLabel} style={{ marginBottom: 4 }}>Teaching Philosophy</p>
                <p className={styles.bio}>{lecturer.teachingPhilosophy}</p>
              </div>
            )}
          </div>

          {/* Specializations */}
          {specializations.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Specializations</h3>
              <div className={styles.tags}>
                {specializations.map((spec, idx) => (
                  <span key={idx} className={styles.tag}>{spec}</span>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {workExperience.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Work Experience</h3>
              <div className={styles.timeline}>
                {workExperience.map((exp, idx) => (
                  <div key={idx} className={styles.timelineItem}>
                    <h4 className={styles.timelineRole}>{exp.role || exp.title || exp.position}</h4>
                    <p className={styles.timelineInstitution}>{exp.institution || exp.company || exp.organization}</p>
                    <p className={styles.timelinePeriod}>{exp.period || exp.duration || [exp.startDate, exp.endDate].filter(Boolean).join(' – ')}</p>
                    {exp.description && <p className={styles.timelineDesc}>{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Education</h3>
              <div className={styles.eduList}>
                {education.map((edu, idx) => (
                  <div key={idx} className={styles.eduItem}>
                    <p className={styles.eduDegree}>{edu.degree || edu.qualification}</p>
                    <p className={styles.eduInstitution}>{edu.institution || edu.school || edu.university}</p>
                    <p className={styles.eduYear}>{edu.year || edu.graduationYear}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Certifications</h3>
              <div className={styles.certList}>
                {certifications.map((cert, idx) => (
                  typeof cert === 'string' ? (
                    <div key={idx} className={styles.certItem}>
                      <span className={styles.certBadge}>✓</span>
                      <span className={styles.certName}>{cert}</span>
                    </div>
                  ) : (
                    <div key={idx} className={styles.certItem}>
                      <span className={styles.certBadge}>✓</span>
                      <div>
                        <p className={styles.certName}>{cert.name || cert.title}</p>
                        {(cert.issuer || cert.issuedBy) && (
                          <p className={styles.certMeta}>{cert.issuer || cert.issuedBy}{cert.year || cert.date ? ` · ${cert.year || cert.date}` : ''}</p>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </div>
              {lecturer.certificationsText && (
                <p className={styles.bio} style={{ marginTop: 12 }}>{lecturer.certificationsText}</p>
              )}
            </div>
          )}

          {/* Portfolio */}
          {portfolio.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Portfolio & Publications</h3>
              <div className={styles.portfolioGrid}>
                {portfolio.map((item, idx) => (
                  <div key={idx} className={styles.portfolioCard}>
                    <span className={styles.portfolioType}>{item.type}</span>
                    <p className={styles.portfolioTitle}>{item.title}</p>
                    <div className={styles.portfolioFooter}>
                      <span className={styles.portfolioYear}>{item.year}</span>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noreferrer" className={styles.linkedIn}>View →</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Honors & Awards */}
          {lecturer.honorsAwards && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Honors & Awards</h3>
              <p className={styles.bio}>{lecturer.honorsAwards}</p>
            </div>
          )}

          {/* Documents */}
          {(lecturer.resumeUrl || lecturer.idDocumentUrl || lecturer.certificateUrl || lecturer.transcriptUrl || lecturer.professionalCertUrl) && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Uploaded Documents</h3>
              <div className={styles.infoGrid}>
                {lecturer.resumeUrl && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Resume / CV</span>
                    <a href={lecturer.resumeUrl} target="_blank" rel="noreferrer" className={styles.linkedIn}>
                      {lecturer.resumeFileName || 'View'}
                    </a>
                  </div>
                )}
                {lecturer.idDocumentUrl && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>ID Document</span>
                    <a href={lecturer.idDocumentUrl} target="_blank" rel="noreferrer" className={styles.linkedIn}>
                      {lecturer.idDocumentFileName || 'View'}
                    </a>
                  </div>
                )}
                {lecturer.certificateUrl && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Certificate</span>
                    <a href={lecturer.certificateUrl} target="_blank" rel="noreferrer" className={styles.linkedIn}>
                      {lecturer.certificateFileName || 'View'}
                    </a>
                  </div>
                )}
                {lecturer.transcriptUrl && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Transcript</span>
                    <a href={lecturer.transcriptUrl} target="_blank" rel="noreferrer" className={styles.linkedIn}>
                      {lecturer.transcriptFileName || 'View'}
                    </a>
                  </div>
                )}
                {lecturer.professionalCertUrl && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Professional Cert</span>
                    <a href={lecturer.professionalCertUrl} target="_blank" rel="noreferrer" className={styles.linkedIn}>
                      {lecturer.professionalCertFileName || 'View'}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Actions */}
        <div className={styles.rightColumn}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Actions</h3>
            <div className={styles.actions}>
              {lecturer.approvalStatus === 'pending' && (
                <>
                  <button
                    className={`${styles.actionBtn} ${styles.actionApprove}`}
                    onClick={() => { setApprovalError(null); setConfirmApproval('approved'); }}
                  >
                    ✓ Approve Lecturer
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.actionReject}`}
                    onClick={() => { setApprovalError(null); setConfirmApproval('rejected'); }}
                  >
                    ✕ Reject Application
                  </button>
                </>
              )}
              {lecturer.accountStatus === 'active' && (
                <button
                  className={`${styles.actionBtn} ${styles.actionWarn}`}
                  onClick={() => { setSuspendError(null); setConfirmSuspend(true); }}
                >
                  ⚠ Suspend Account
                </button>
              )}
              {lecturer.accountStatus === 'suspended' && (
                <>
                  <button
                    className={`${styles.actionBtn} ${styles.actionReactivate}`}
                    onClick={() => { setSuspendError(null); setConfirmSuspend(true); }}
                  >
                    ↻ Reactivate Account
                  </button>
                  {lecturer.suspensionReason && (
                    <div className={styles.suspensionNote}>
                      <strong>Suspension Reason:</strong><br />
                      {lecturer.suspensionReason}
                    </div>
                  )}
                </>
              )}
              <button className={`${styles.actionBtn} ${styles.actionSecondary}`} onClick={() => setEmailModal(true)}>
                📧 Send Email
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Account Info</h3>
            <div className={styles.accountList}>
              <div className={styles.accountRow}>
                <span className={styles.accountLabel}>Username</span>
                <span className={styles.accountValue}>{lecturer.username || '—'}</span>
              </div>
              <div className={styles.accountRow}>
                <span className={styles.accountLabel}>Email Verified</span>
                <span className={lecturer.emailVerified ? styles.accountBadgeGreen : styles.accountBadgeRed}>
                  {lecturer.emailVerified ? '✓ Verified' : '✗ Not verified'}
                </span>
              </div>
              <div className={styles.accountRow}>
                <span className={styles.accountLabel}>2FA</span>
                <span className={lecturer.twoFactorEnabled ? styles.accountBadgeGreen : styles.accountBadgeGray}>
                  {lecturer.twoFactorEnabled ? '✓ Enabled' : 'Disabled'}
                </span>
              </div>
              <div className={styles.accountRow}>
                <span className={styles.accountLabel}>Sign-in Method</span>
                <span className={styles.accountValue}>
                  {lecturer.googleId ? '🔗 Google' : '🔑 Password'}
                </span>
              </div>
              <div className={styles.accountRow}>
                <span className={styles.accountLabel}>Date of Birth</span>
                <span className={styles.accountValue}>{lecturer.dateOfBirth || '—'}</span>
              </div>
              <div className={styles.accountRow}>
                <span className={styles.accountLabel}>Field</span>
                <span className={styles.accountValue}>{lecturer.field || '—'}</span>
              </div>
              <div className={styles.accountRow}>
                <span className={styles.accountLabel}>Qualification</span>
                <span className={styles.accountValue}>{lecturer.qualification || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approve / Reject Confirm Modal */}
      {confirmApproval && (
        <div className={styles.modal} onClick={() => !approvalLoading && setConfirmApproval(null)}>
          <div className={styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {confirmApproval === 'approved' ? 'Approve Lecturer' : 'Reject Application'}
              </h3>
              <button className={styles.modalClose} onClick={() => setConfirmApproval(null)} disabled={approvalLoading}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ color: '#374151', marginBottom: 0 }}>
                {confirmApproval === 'approved'
                  ? <>Approve <strong>{lecturer.name}</strong>? They will be able to receive job offers.</>
                  : <>Reject <strong>{lecturer.name}</strong>&apos;s application? This will mark their profile as rejected.</>}
              </p>
              {approvalError && <p style={{ color: '#dc2626', marginTop: 8, marginBottom: 0 }}>{approvalError}</p>}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalCancelBtn} onClick={() => setConfirmApproval(null)} disabled={approvalLoading}>Cancel</button>
              <button
                className={`${styles.modalConfirmBtn} ${confirmApproval === 'approved' ? styles.confirmApprove : styles.confirmReject}`}
                onClick={handleApprovalDecision}
                disabled={approvalLoading}
              >
                {approvalLoading ? 'Processing…' : confirmApproval === 'approved' ? 'Yes, Approve' : 'Yes, Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend / Reactivate Confirm Modal */}
      {confirmSuspend && (
        <div className={styles.modal} onClick={() => !suspendLoading && setConfirmSuspend(false)}>
          <div className={styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {lecturer.accountStatus === 'active' ? 'Suspend Account' : 'Reactivate Account'}
              </h3>
              <button className={styles.modalClose} onClick={() => setConfirmSuspend(false)} disabled={suspendLoading}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ color: '#374151', marginBottom: 0 }}>
                {lecturer.accountStatus === 'active'
                  ? <>Suspend <strong>{lecturer.name}</strong>? They will no longer be able to log in.</>
                  : <>Reactivate <strong>{lecturer.name}</strong>? They will regain full access.</>}
              </p>
              {suspendError && <p style={{ color: '#dc2626', marginTop: 8, marginBottom: 0 }}>{suspendError}</p>}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalCancelBtn} onClick={() => setConfirmSuspend(false)} disabled={suspendLoading}>Cancel</button>
              <button
                className={`${styles.modalConfirmBtn} ${lecturer.accountStatus === 'active' ? styles.confirmReject : styles.confirmApprove}`}
                onClick={handleSuspendToggle}
                disabled={suspendLoading}
              >
                {suspendLoading ? 'Processing…' : lecturer.accountStatus === 'active' ? 'Yes, Suspend' : 'Yes, Reactivate'}
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
              <h3 className={styles.modalTitle}>Send Email to {lecturer.name}</h3>
              <button className={styles.modalClose} onClick={() => setEmailModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ color: '#6b7280', marginBottom: 12 }}>
                To: <strong>{lecturer.email}</strong>
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
              <button className={styles.modalCancelBtn} onClick={() => setEmailModal(false)}>Cancel</button>
              <button
                className={`${styles.modalConfirmBtn} ${styles.confirmApprove}`}
                onClick={handleSendEmail}
                disabled={!emailSubject || !emailBody || emailSent}
              >
                {emailSent ? '✓ Opened' : '📧 Open in Mail App'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
