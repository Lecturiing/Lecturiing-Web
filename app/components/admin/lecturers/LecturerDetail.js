'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_LECTURERS, MOCK_LECTURER_DETAILS, MOCK_INSTITUTION_LECTURERS } from '@/app/lib/mockData';
import styles from './LecturerDetail.module.css';

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
  const lecturer = MOCK_LECTURERS.find((l) => l.id === id);
  const details = MOCK_LECTURER_DETAILS[id] || {};
  const [actionModal, setActionModal] = useState(null);

  if (!lecturer) {
    return (
      <div className={styles.notFound}>
        <p>Lecturer not found.</p>
        <Link href="/admin/lecturers" className={styles.backLink}>
          ← Back to lecturers
        </Link>
      </div>
    );
  }

  const statusStyle = STATUS_COLORS[lecturer.accountStatus] || STATUS_COLORS.active;
  const approvalStyle = APPROVAL_COLORS[lecturer.approvalStatus] || APPROVAL_COLORS.approved;

  // Find institutions this lecturer is attached to
  const attachedInstitutions = [];
  Object.entries(MOCK_INSTITUTION_LECTURERS).forEach(([instId, lecturers]) => {
    if (lecturers.find((l) => l.lecturerId === id)) {
      attachedInstitutions.push(instId);
    }
  });

  const handleAction = (action) => {
    setActionModal(action);
    setTimeout(() => setActionModal(null), 2000);
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
          <div className={styles.avatar} style={{ background: lecturer.color }}>
            {lecturer.initials}
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.lecturerName}>{lecturer.name}</h1>
            <p className={styles.lecturerTitle}>{lecturer.title}</p>
            <p className={styles.lecturerMeta}>
              {lecturer.field} · {lecturer.qualification} · {lecturer.experience} years experience
            </p>
            <p className={styles.lecturerContact}>
              📧 {lecturer.email} · 📞 {lecturer.phone}
            </p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span
            className={styles.statusBadge}
            style={{ background: statusStyle.bg, color: statusStyle.text }}
          >
            {lecturer.accountStatus}
          </span>
          <span
            className={styles.approvalBadge}
            style={{ background: approvalStyle.bg, color: approvalStyle.text }}
          >
            {lecturer.approvalStatus}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Hourly Rate</p>
          <p className={styles.statValue}>${lecturer.rate}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Rating</p>
          <p className={styles.statValue}>{lecturer.rating || 'N/A'}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Reviews</p>
          <p className={styles.statValue}>{lecturer.reviews}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Institutions</p>
          <p className={styles.statValue}>{attachedInstitutions.length}</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* About */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>About</h3>
            <p className={styles.bio}>{lecturer.bio}</p>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Country</span>
                <span className={styles.infoValue}>{lecturer.country}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Timezone</span>
                <span className={styles.infoValue}>{lecturer.timezone}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Availability</span>
                <span className={styles.infoValue}>{lecturer.availability}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Joined</span>
                <span className={styles.infoValue}>{lecturer.joinedAt}</span>
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Specializations</h3>
            <div className={styles.tags}>
              {lecturer.specializations.map((spec, idx) => (
                <span key={idx} className={styles.tag}>{spec}</span>
              ))}
            </div>
          </div>

          {/* Experience */}
          {details.experience && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Work Experience</h3>
              <div className={styles.timeline}>
                {details.experience.map((exp, idx) => (
                  <div key={idx} className={styles.timelineItem}>
                    <h4 className={styles.timelineRole}>{exp.role}</h4>
                    <p className={styles.timelineInstitution}>{exp.institution}</p>
                    <p className={styles.timelinePeriod}>{exp.period}</p>
                    <p className={styles.timelineDesc}>{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {details.education && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Education</h3>
              <div className={styles.eduList}>
                {details.education.map((edu, idx) => (
                  <div key={idx} className={styles.eduItem}>
                    <p className={styles.eduDegree}>{edu.degree}</p>
                    <p className={styles.eduInstitution}>{edu.institution}</p>
                    <p className={styles.eduYear}>{edu.year}</p>
                  </div>
                ))}
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
                    onClick={() => handleAction('approve')}
                  >
                    ✓ Approve Lecturer
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.actionReject}`}
                    onClick={() => handleAction('reject')}
                  >
                    ✕ Reject Application
                  </button>
                </>
              )}
              {lecturer.accountStatus === 'active' && (
                <button
                  className={`${styles.actionBtn} ${styles.actionWarn}`}
                  onClick={() => handleAction('suspend')}
                >
                  ⚠ Suspend Account
                </button>
              )}
              {lecturer.accountStatus === 'suspended' && (
                <>
                  <button
                    className={`${styles.actionBtn} ${styles.actionReactivate}`}
                    onClick={() => handleAction('reactivate')}
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
              <button className={`${styles.actionBtn} ${styles.actionSecondary}`}>
                📧 Send Email
              </button>
              <Link
                href="/admin/moderation"
                className={`${styles.actionBtn} ${styles.actionDanger}`}
              >
                🗑 Manage Account
              </Link>
            </div>
          </div>

          {/* Attached Institutions */}
          {attachedInstitutions.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Attached To</h3>
              <p className={styles.attachedCount}>
                {attachedInstitutions.length} institution{attachedInstitutions.length > 1 ? 's' : ''}
              </p>
              <Link href="/admin/institutions" className={styles.viewInstitutionsLink}>
                View institutions →
              </Link>
            </div>
          )}
        </div>
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
