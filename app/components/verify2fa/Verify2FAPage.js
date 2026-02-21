'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import logo from '@/app/assets/Frame 36712.png';
import FlowCard from '../shared/FlowCard';
import OtpInput from '../shared/OtpInput';
import styles from './Verify2FAPage.module.css';

export default function Verify2FAPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [useBackup, setUseBackup] = useState(false);
  const [backupCode, setBackupCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!useBackup && code.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    if (useBackup && backupCode.trim().length < 8) {
      setError('Please enter a valid backup code.');
      return;
    }
    // TODO: verify 2FA code via API
    router.push('/dashboard');
  };

  return (
    <FlowCard>
      <div className={styles.brandRow}>
        <Image src={logo} alt="Lecturiing logo" width={32} height={32} />
        <span className={styles.brandName}>Lecturiing</span>
      </div>

      <div className={styles.iconWrap}>
        <LockIcon />
      </div>

      <h1 className={styles.title}>Two-factor authentication</h1>
      <p className={styles.subtitle}>
        {useBackup
          ? 'Enter one of your backup codes to access your account.'
          : 'Open your authenticator app and enter the 6-digit code for Lecturiing.'}
      </p>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {useBackup ? (
          <input
            type="text"
            className={styles.backupInput}
            placeholder="Enter backup code  (e.g. ABCD-1234)"
            value={backupCode}
            onChange={(e) => { setBackupCode(e.target.value); setError(''); }}
            autoFocus
          />
        ) : (
          <OtpInput value={code} onChange={(v) => { setCode(v); setError(''); }} />
        )}

        {error && <p className={styles.errorText}>{error}</p>}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={!useBackup && code.length < 6}
        >
          Verify &amp; Sign In
        </button>
      </form>

      <button
        type="button"
        className={styles.toggleMode}
        onClick={() => { setUseBackup((v) => !v); setCode(''); setBackupCode(''); setError(''); }}
      >
        {useBackup ? 'Use authenticator app instead' : "Can't access your authenticator? Use a backup code"}
      </button>

      <Link href="/" className={styles.backLink}>
        ← Back to sign in
      </Link>
    </FlowCard>
  );
}

function LockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}
