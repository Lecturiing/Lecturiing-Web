'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from '@/app/assets/Frame 36712.png';
import FlowCard from '../shared/FlowCard';
import styles from './GoogleDetailsPage.module.css';
import { onboardingService } from '@/app/lib/services/onboardingService';

const INSTITUTION_TYPES = [
  'University', 'College', 'High School', 'Primary School',
  'Vocational Institute', 'Online Academy', 'Other',
];

const SIZES = ['1–10', '11–50', '51–200', '201–500', '500+'];

export default function GoogleDetailsPage() {
  const router = useRouter();
  const [form, setForm] = useState({ institutionName: '', institutionType: '', website: '', size: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.institutionName.trim()) { setError('Institution name is required.'); return; }
    if (!form.institutionType) { setError('Please select an institution type.'); return; }
    setError('');
    setLoading(true);
    try {
      await onboardingService.saveStep(1, form);
      router.push('/setup-2fa');
    } catch (err) {
      setError(err.message || 'Failed to save details. Please try again.');
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

      <div className={styles.iconWrap}>
        <BuildingIcon />
      </div>

      <h1 className={styles.title}>Complete your profile</h1>
      <p className={styles.subtitle}>
        Tell us about your institution before you continue.
      </p>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="institutionName">Institution Name</label>
          <input
            id="institutionName"
            type="text"
            className={styles.input}
            placeholder="e.g. Greenfield University"
            value={form.institutionName}
            onChange={set('institutionName')}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="institutionType">Institution Type</label>
          <select
            id="institutionType"
            className={`${styles.input} ${styles.select}`}
            value={form.institutionType}
            onChange={set('institutionType')}
            required
          >
            <option value="" disabled>Select type…</option>
            {INSTITUTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="website">Website <span className={styles.optional}>(optional)</span></label>
          <input
            id="website"
            type="url"
            className={styles.input}
            placeholder="https://yourinstitution.edu"
            value={form.website}
            onChange={set('website')}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="size">Institution Size <span className={styles.optional}>(optional)</span></label>
          <select
            id="size"
            className={`${styles.input} ${styles.select}`}
            value={form.size}
            onChange={set('size')}
          >
            <option value="">Select size…</option>
            {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Saving…' : 'Continue to 2FA Setup'}
        </button>
      </form>
    </FlowCard>
  );
}

function BuildingIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
