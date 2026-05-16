'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './SubscriptionPage.module.css';
import { subscriptionService } from '@/app/lib/services/subscriptionService';

const PLANS = [
  {
    key: 'free',
    label: 'Free',
    price: '$0/mo',
    color: '#6b7280',
    bg: '#f3f4f6',
    features: [
      'Apply to free-tier verified jobs',
      'Basic profile',
      'Weekly job alerts',
      'Upload credentials',
      'Track application status',
      'Up to 5 saved jobs',
    ],
  },
  {
    key: 'premium',
    label: 'Premium',
    price: '$20/mo',
    color: '#d97706',
    bg: '#fef3c7',
    highlight: true,
    features: [
      'Everything in Free',
      'Access to Premium job listings',
      'Profile priority ranking',
      'Daily job alerts',
      'Unlimited job saves',
    ],
  },
  {
    key: 'pro',
    label: 'Pro',
    price: '$50/mo',
    color: '#7c3aed',
    bg: '#ede9fe',
    features: [
      'Everything in Premium',
      'Featured profile in search',
      'Global job access (all tiers)',
      'Early job alerts',
      'Application insights',
    ],
  },
];

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(null);

  const successPlan = searchParams?.get('status') === 'success' ? searchParams?.get('plan') : null;

  useEffect(() => {
    subscriptionService.get()
      .then(setSub)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade(plan) {
    setUpgradeLoading(plan);
    try {
      const result = await subscriptionService.upgrade(plan);
      if (result?.paymentLink) window.location.href = result.paymentLink;
    } catch (_) {}
    setUpgradeLoading(null);
  }

  const currentPlan = sub?.plan ?? 'free';

  return (
    <div className={styles.page}>
      {successPlan && (
        <div className={styles.successBanner}>
          Your plan has been upgraded to <strong>{successPlan.charAt(0).toUpperCase() + successPlan.slice(1)}</strong>! Enjoy your new features.
        </div>
      )}

      <div className={styles.currentBox}>
        {loading ? (
          <p className={styles.loadingTxt}>Loading plan…</p>
        ) : (
          <>
            <span className={styles.currentLabel}>Current Plan</span>
            <PlanTag plan={currentPlan} />
            {sub?.planExpiresAt && (
              <span className={styles.expiresAt}>
                Renews {new Date(sub.planExpiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
          </>
        )}
      </div>

      <div className={styles.grid}>
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.key;
          const isDowngrade = PLAN_RANK[plan.key] < PLAN_RANK[currentPlan];
          return (
            <div
              key={plan.key}
              className={`${styles.planCard} ${plan.highlight ? styles.planCardHighlight : ''} ${isCurrent ? styles.planCardCurrent : ''}`}
            >
              <div className={styles.planHeader}>
                <span className={styles.planBadge} style={{ background: plan.bg, color: plan.color }}>
                  {plan.label}
                </span>
                <span className={styles.planPrice}>{plan.price}</span>
              </div>
              <ul className={styles.featureList}>
                {plan.features.map((f) => (
                  <li key={f} className={styles.featureItem}>
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>
              <div className={styles.planFooter}>
                {isCurrent ? (
                  <span className={styles.currentBtn}>Current Plan</span>
                ) : isDowngrade ? (
                  <span className={styles.downgradeNote}>Downgrade at renewal</span>
                ) : (
                  <button
                    className={styles.upgradeBtn}
                    style={{ background: plan.color }}
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={upgradeLoading === plan.key}
                  >
                    {upgradeLoading === plan.key ? 'Redirecting…' : `Upgrade to ${plan.label}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PLAN_RANK = { free: 0, premium: 1, pro: 2 };

function PlanTag({ plan }) {
  const map = {
    free: { label: 'Free', bg: '#f3f4f6', color: '#6b7280' },
    premium: { label: 'Premium', bg: '#fef3c7', color: '#d97706' },
    pro: { label: 'Pro', bg: '#ede9fe', color: '#7c3aed' },
  };
  const s = map[plan] ?? map.free;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '5px 14px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#059669', flexShrink: 0, marginTop: 1 }}>
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  );
}
