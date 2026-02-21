'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import logo from '@/app/assets/Frame 36712.png';
import FlowCard from '../shared/FlowCard';
import OtpInput from '../shared/OtpInput';
import styles from './OtpPage.module.css';

const RESEND_SECONDS = 60;

export default function OtpPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleResend = useCallback(() => {
    if (!canResend) return;
    // TODO: call resend OTP API
    setCountdown(RESEND_SECONDS);
    setCanResend(false);
    setCode('');
    setError('');
  }, [canResend]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.length < 6) { setError('Please enter the full 6-digit code.'); return; }
    // TODO: verify OTP via API
    router.push('/setup-2fa');
  };

  return (
    <FlowCard>
      <div className={styles.brandRow}>
        <Image src={logo} alt="Lecturiing logo" width={32} height={32} />
        <span className={styles.brandName}>Lecturiing</span>
      </div>

      <div className={styles.iconWrap}>
        <MailIcon />
      </div>

      <h1 className={styles.title}>Check your email</h1>
      <p className={styles.subtitle}>
        We&apos;ve sent a 6-digit verification code to your registered email address.
      </p>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <OtpInput value={code} onChange={(v) => { setCode(v); setError(''); }} />

        {error && <p className={styles.errorText}>{error}</p>}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={code.length < 6}
        >
          Verify Email
        </button>
      </form>

      <div className={styles.resendRow}>
        {canResend ? (
          <button type="button" className={styles.resendBtn} onClick={handleResend}>
            Resend code
          </button>
        ) : (
          <p className={styles.resendTimer}>
            Resend code in <span className={styles.countdown}>{countdown}s</span>
          </p>
        )}
      </div>

      <Link href="/signup" className={styles.backLink}>
        ← Back to sign up
      </Link>
    </FlowCard>
  );
}

function MailIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <polyline points="2,4 12,13 22,4" />
    </svg>
  );
}
