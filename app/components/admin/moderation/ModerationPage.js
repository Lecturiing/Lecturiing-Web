'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_INSTITUTIONS, MOCK_LECTURERS } from '@/app/lib/mockData';
import styles from './ModerationPage.module.css';

const TABS = ['Institutions', 'Lecturers'];

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState('Institutions');
  const [institutions, setInstitutions] = useState(MOCK_INSTITUTIONS);
  const [lecturers, setLecturers] = useState(MOCK_LECTURERS);
  const [confirmModal, setConfirmModal] = useState(null);

  const handleSuspendInstitution = (id) => {
    setInstitutions((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'suspended' } : i))
    );
    setConfirmModal(null);
  };

  const handleReactivateInstitution = (id) => {
    setInstitutions((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'active' } : i))
    );
    setConfirmModal(null);
  };

  const handleDeleteInstitution = (id) => {
    setInstitutions((prev) => prev.filter((i) => i.id !== id));
    setConfirmModal(null);
  };

  const handleSuspendLecturer = (id) => {
    setLecturers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, accountStatus: 'suspended' } : l))
    );
    setConfirmModal(null);
  };

  const handleReactivateLecturer = (id) => {
    setLecturers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, accountStatus: 'active' } : l))
    );
    setConfirmModal(null);
  };

  const handleDeleteLecturer = (id) => {
    setLecturers((prev) => prev.filter((l) => l.id !== id));
    setConfirmModal(null);
  };

  const openConfirmModal = (action, type, item) => {
    setConfirmModal({ action, type, item });
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Account Moderation</h2>
          <p className={styles.sub}>Suspend or delete accounts for policy violations</p>
        </div>
        <div className={styles.warningBadge}>
          ⚠️ Actions are irreversible
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

      {/* Content */}
      <div className={styles.content}>
        {/* Institutions Tab */}
        {activeTab === 'Institutions' && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Institution</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Jobs</th>
                  <th>Lecturers</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((inst) => (
                  <tr key={inst.id}>
                    <td>
                      <div className={styles.entityCell}>
                        <div className={styles.avatar} style={{ background: inst.color }}>
                          {inst.initials}
                        </div>
                        <div>
                          <p className={styles.entityName}>{inst.name}</p>
                          <p className={styles.entitySub}>{inst.plan} plan</p>
                        </div>
                      </div>
                    </td>
                    <td>{inst.type}</td>
                    <td>{inst.city}, {inst.country}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles['status' + inst.status]}`}>
                        {inst.status}
                      </span>
                    </td>
                    <td>{inst.stats.jobs}</td>
                    <td>{inst.stats.lecturers}</td>
                    <td>
                      <div className={styles.actionBtns}>
                        {inst.status === 'active' && (
                          <button
                            className={styles.suspendBtn}
                            onClick={() => openConfirmModal('suspend', 'institution', inst)}
                          >
                            Suspend
                          </button>
                        )}
                        {inst.status === 'suspended' && (
                          <button
                            className={styles.reactivateBtn}
                            onClick={() => openConfirmModal('reactivate', 'institution', inst)}
                          >
                            Reactivate
                          </button>
                        )}
                        <button
                          className={styles.deleteBtn}
                          onClick={() => openConfirmModal('delete', 'institution', inst)}
                        >
                          Delete
                        </button>
                        <Link
                          href={`/admin/institutions/${inst.id}`}
                          className={styles.viewBtn}
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Lecturers Tab */}
        {activeTab === 'Lecturers' && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Lecturer</th>
                  <th>Field</th>
                  <th>Location</th>
                  <th>Account Status</th>
                  <th>Approval</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lecturers.map((lec) => (
                  <tr key={lec.id}>
                    <td>
                      <div className={styles.entityCell}>
                        <div className={styles.avatar} style={{ background: lec.color }}>
                          {lec.initials}
                        </div>
                        <div>
                          <p className={styles.entityName}>{lec.name}</p>
                          <p className={styles.entitySub}>{lec.title}</p>
                        </div>
                      </div>
                    </td>
                    <td>{lec.field}</td>
                    <td>{lec.country}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles['status' + lec.accountStatus]}`}>
                        {lec.accountStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.approvalBadge} ${styles['approval' + lec.approvalStatus]}`}>
                        {lec.approvalStatus}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        {lec.accountStatus === 'active' && (
                          <button
                            className={styles.suspendBtn}
                            onClick={() => openConfirmModal('suspend', 'lecturer', lec)}
                          >
                            Suspend
                          </button>
                        )}
                        {lec.accountStatus === 'suspended' && (
                          <button
                            className={styles.reactivateBtn}
                            onClick={() => openConfirmModal('reactivate', 'lecturer', lec)}
                          >
                            Reactivate
                          </button>
                        )}
                        <button
                          className={styles.deleteBtn}
                          onClick={() => openConfirmModal('delete', 'lecturer', lec)}
                        >
                          Delete
                        </button>
                        <Link
                          href={`/admin/lecturers/${lec.id}`}
                          className={styles.viewBtn}
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className={styles.modal} onClick={() => setConfirmModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              Confirm {confirmModal.action}
            </h3>
            <p className={styles.modalText}>
              Are you sure you want to <strong>{confirmModal.action}</strong> this {confirmModal.type}:
            </p>
            <div className={styles.modalEntity}>
              <div className={styles.modalAvatar} style={{ background: confirmModal.item.color }}>
                {confirmModal.item.initials}
              </div>
              <span className={styles.modalName}>{confirmModal.item.name}</span>
            </div>

            {confirmModal.action === 'delete' && (
              <div className={styles.modalWarning}>
                ⚠️ <strong>Warning:</strong> This action is permanent and cannot be undone. All data associated
                with this account will be permanently deleted.
              </div>
            )}

            {confirmModal.action === 'suspend' && (
              <div className={styles.modalNote}>
                The account will be suspended and the user will not be able to log in until reactivated.
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setConfirmModal(null)}
              >
                Cancel
              </button>
              <button
                className={`${styles.confirmBtn} ${
                  confirmModal.action === 'delete' ? styles.confirmDanger : ''
                }`}
                onClick={() => {
                  if (confirmModal.type === 'institution') {
                    if (confirmModal.action === 'suspend') handleSuspendInstitution(confirmModal.item.id);
                    if (confirmModal.action === 'reactivate') handleReactivateInstitution(confirmModal.item.id);
                    if (confirmModal.action === 'delete') handleDeleteInstitution(confirmModal.item.id);
                  } else {
                    if (confirmModal.action === 'suspend') handleSuspendLecturer(confirmModal.item.id);
                    if (confirmModal.action === 'reactivate') handleReactivateLecturer(confirmModal.item.id);
                    if (confirmModal.action === 'delete') handleDeleteLecturer(confirmModal.item.id);
                  }
                }}
              >
                {confirmModal.action === 'delete' ? 'Delete Permanently' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
