'use client';

import styles from './RoleSelector.module.css';

export default function RoleSelector({ activeRole, onRoleChange }) {
  return (
    <div className={styles.container} role="tablist" aria-label="Login type">
      <button
        type="button"
        role="tab"
        aria-selected={activeRole === 'admin'}
        className={`${styles.tab} ${activeRole === 'admin' ? styles.active : ''}`}
        onClick={() => onRoleChange('admin')}
      >
        Admin
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeRole === 'institution'}
        className={`${styles.tab} ${activeRole === 'institution' ? styles.active : ''}`}
        onClick={() => onRoleChange('institution')}
      >
        Institution
      </button>
    </div>
  );
}
