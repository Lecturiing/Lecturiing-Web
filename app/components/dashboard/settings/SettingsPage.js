'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SettingsPage.module.css';
import { authService } from '@/app/lib/services/authService';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [disableCode, setDisableCode] = useState('');
  const [disableError, setDisableError] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableSuccess, setDisableSuccess] = useState(false);

  useEffect(() => {
    authService.getMe()
      .then((data) => setUser(data))
      .catch(() => {
        const stored = localStorage.getItem('user');
        if (stored) { try { setUser(JSON.parse(stored)); } catch (_) {} }
      });
  }, []);

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    if (disableCode.length < 6) { setDisableError('Enter the 6-digit code from your authenticator app.'); return; }
    setDisableError('');
    setDisableLoading(true);
    try {
      await authService.disable2FA({ code: disableCode });
      setUser((prev) => ({ ...prev, twoFactorEnabled: false }));
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          localStorage.setItem('user', JSON.stringify({ ...u, twoFactorEnabled: false }));
        } catch (_) {}
      }
      setDisableSuccess(true);
      setDisableCode('');
    } catch (err) {
      setDisableError(err.message || 'Invalid code. Please try again.');
    } finally {
      setDisableLoading(false);
    }
  };

  if (!user) {
    return <div className={styles.loading}>Loading settings…</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Settings</h2>
        <p className={styles.sub}>Manage your account security and preferences</p>
      </div>

      {/* 2FA Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}><ShieldIcon /></div>
          <div>
            <h3 className={styles.sectionTitle}>Two-Factor Authentication</h3>
            <p className={styles.sectionSub}>Add an extra layer of security to your account</p>
          </div>
          <span className={user.twoFactorEnabled ? styles.badgeEnabled : styles.badgeDisabled}>
            {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {!user.twoFactorEnabled && (
          <div className={styles.sectionBody}>
            <p className={styles.bodyText}>
              Two-factor authentication is not enabled. Enable it to add an extra layer of security to your account.
            </p>
            <button className={styles.primaryBtn} onClick={() => router.push('/setup-2fa')}>
              Set Up 2FA
            </button>
          </div>
        )}

        {user.twoFactorEnabled && (
          <div className={styles.sectionBody}>
            <p className={styles.bodyText}>
              Two-factor authentication is active. You can reset it or disable it below.
            </p>
            <div className={styles.btnRow}>
              <button className={styles.secondaryBtn} onClick={() => router.push('/setup-2fa')}>
                Reset 2FA (generate new secret)
              </button>
            </div>

            <div className={styles.divider} />

            <h4 className={styles.dangerTitle}>Disable 2FA</h4>
            <p className={styles.bodyText}>
              Enter your current authenticator code to disable 2FA.
            </p>

            {disableSuccess ? (
              <div className={styles.successMsg}>2FA has been disabled successfully.</div>
            ) : (
              <form onSubmit={handleDisable2FA} className={styles.disableForm}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className={styles.codeInput}
                  placeholder="000000"
                  value={disableCode}
                  onChange={(e) => { setDisableCode(e.target.value.replace(/\D/g, '')); setDisableError(''); }}
                />
                {disableError && <p className={styles.errorText}>{disableError}</p>}
                <button
                  type="submit"
                  className={styles.dangerBtn}
                  disabled={disableCode.length < 6 || disableLoading}
                >
                  {disableLoading ? 'Disabling…' : 'Disable 2FA'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
