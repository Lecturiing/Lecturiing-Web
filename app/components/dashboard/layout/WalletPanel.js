'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { walletService } from '@/app/lib/services/walletService';
import styles from './WalletPanel.module.css';

export default function WalletPanel({ collapsed }) {
  const [wallet, setWallet] = useState(null);
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    walletService.get()
      .then((data) => setWallet(data?.wallet ?? null))
      .catch(() => {});
  }, []);

  const fmt = (val, currency = 'USD') => {
    const n = parseFloat(val ?? 0);
    if (n >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${currency} ${(n / 1_000).toFixed(1)}K`;
    return `${currency} ${n.toFixed(2)}`;
  };

  if (collapsed) {
    return (
      <button
        className={styles.collapsedBtn}
        onClick={() => router.push('/dashboard/wallet')}
        title="Wallet"
      >
        <WalletIcon />
      </button>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <WalletIcon />
        <span className={styles.title}>Wallet</span>
        <button
          className={styles.eyeBtn}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide balance' : 'Show balance'}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      <div className={styles.balanceRow}>
        <span className={styles.balanceLabel}>Balance</span>
        <span className={styles.balance}>
          {visible ? fmt(wallet?.balance, wallet?.currency) : '••••••'}
        </span>
      </div>

      {wallet?.pendingBalance > 0 && (
        <div className={styles.pendingRow}>
          <span className={styles.pendingLabel}>In escrow</span>
          <span className={styles.pendingValue}>
            {fmt(wallet.pendingBalance, wallet.currency)}
          </span>
        </div>
      )}

      <button
        className={styles.viewAllBtn}
        onClick={() => router.push('/dashboard/wallet')}
      >
        View transactions →
      </button>
    </div>
  );
}

function WalletIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V22H4V12" />
      <path d="M22 7H2v5h20V7z" />
      <path d="M12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

