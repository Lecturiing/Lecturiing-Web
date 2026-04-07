'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import logo from '@/app/assets/Frame 36712.png';
import FlowCard from '../shared/FlowCard';
import OtpInput from '../shared/OtpInput';
import styles from './Setup2FAPage.module.css';
import { authService } from '@/app/lib/services/authService';
import api from '@/app/lib/api';

export default function Setup2FAPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('scan');
  const [secret, setSecret] = useState('LCTR-ING2-FA4S-ECRE');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);

  useEffect(() => {
    authService.setup2fa()
      .then((data) => {
        if (data?.secret) setSecret(data.secret);
        if (data?.qrCodeUrl) setQrCodeUrl(data.qrCodeUrl);
        if (data?.backupCodes) setBackupCodes(data.backupCodes);
      })
      .catch(() => {});
  }, []);

  const handleEnable = async (e) => {
    e.preventDefault();
    if (code.length < 6) { setError('Enter the 6-digit code from your authenticator app.'); return; }
    setError('');
    setLoading(true);
    try {
      const data = await authService.confirm2fa({ code });
      api.setToken(data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (backupCodes.length > 0) localStorage.setItem('backupCodes', JSON.stringify(backupCodes));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FlowCard>
      <div className={styles.brandRow}>
        <Image src={logo} alt="Lecturiing logo" width={32} height={32} />
        <span className={styles.brandName}>Lecturiing</span>
      </div>

      <div className={styles.steps}>
        <span className={`${styles.step} ${step === 'scan' ? styles.active : styles.done}`}>1</span>
        <span className={styles.stepLine} />
        <span className={`${styles.step} ${step === 'verify' ? styles.active : step === 'scan' ? '' : styles.done}`}>2</span>
      </div>

      <div className={styles.iconWrap}>
        <ShieldIcon />
      </div>

      <h1 className={styles.title}>Set up two-factor authentication</h1>
      <p className={styles.subtitle}>
        Add an extra layer of security to your account. Scan the QR code with an authenticator app, then enter the code to confirm.
      </p>

      {/* Step 1: Scan */}
      <div className={styles.qrSection}>
        <p className={styles.stepLabel}>Step 1 — Scan with your authenticator app</p>
        <div className={styles.qrFrame}>
          {qrCodeUrl
            ? <div className={styles.qrContainer}><img src={qrCodeUrl} alt="2FA QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>
            : <QrPlaceholder />
          }
          <p className={styles.qrHint}>Google Authenticator · Authy · Microsoft Authenticator</p>
        </div>

        <div className={styles.secretRow}>
          <p className={styles.secretLabel}>Or enter this key manually:</p>
          <div className={styles.secretBox}>
            <code className={styles.secretCode}>{secret}</code>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={() => navigator.clipboard?.writeText(secret)}
              title="Copy secret key"
            >
              <CopyIcon />
            </button>
          </div>
        </div>

        {backupCodes.length > 0 && (
          <div className={styles.secretRow} style={{ marginTop: 12 }}>
            <p className={styles.secretLabel}>Save your backup codes (shown once):</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {backupCodes.map((c) => (
                <code key={c} className={styles.secretCode} style={{ fontSize: '0.75rem' }}>{c}</code>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Verify */}
      <div className={styles.verifySection}>
        <p className={styles.stepLabel}>Step 2 — Enter the 6-digit code</p>
        <form onSubmit={handleEnable} className={styles.form} noValidate>
          <OtpInput value={code} onChange={(v) => { setCode(v); setError(''); setStep('verify'); }} />
          {error && <p className={styles.errorText}>{error}</p>}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={code.length < 6 || loading}
          >
            {loading ? 'Enabling…' : 'Enable 2FA & Continue'}
          </button>
        </form>
      </div>

      <Link href="/verify-otp" className={styles.backLink}>
        ← Back
      </Link>
    </FlowCard>
  );
}

function QrPlaceholder() {
  // Deterministic QR-like pattern — replace with real TOTP QR in production
  const SIZE = 21;
  const cells = [];

  const isFinderPattern = (r, c) => {
    const inTopLeft = r < 7 && c < 7;
    const inTopRight = r < 7 && c >= SIZE - 7;
    const inBottomLeft = r >= SIZE - 7 && c < 7;
    if (inTopLeft || inTopRight || inBottomLeft) {
      const lr = inBottomLeft ? r - (SIZE - 7) : r;
      const lc = inTopRight ? c - (SIZE - 7) : c;
      return lc === 0 || lc === 6 || lr === 0 || lr === 6 || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
    }
    return false;
  };

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const dark = isFinderPattern(r, c) || ((r * 17 + c * 13 + r * c) % 7 > 3 && !(r < 8 && c < 8) && !(r < 8 && c >= SIZE - 8) && !(r >= SIZE - 8 && c < 8));
      if (dark) cells.push(
        <rect key={`${r}-${c}`} x={c * 9} y={r * 9} width="8" height="8" rx="1" fill="#111827" />
      );
    }
  }

  return (
    <div className={styles.qrContainer}>
      <svg viewBox={`0 0 ${SIZE * 9} ${SIZE * 9}`} className={styles.qrSvg} xmlns="http://www.w3.org/2000/svg">
        {cells}
      </svg>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}
