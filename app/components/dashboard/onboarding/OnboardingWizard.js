'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FIELDS, COUNTRIES, CONTRACT_TYPES } from '@/app/lib/mockData';
import styles from './OnboardingWizard.module.css';

const STEPS = ['Institution Profile', 'Location & Contact', 'Hiring Preferences', 'Review & Complete'];

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    // Step 1
    institutionName: '', institutionType: '', website: '', size: '',
    // Step 2
    country: '', address: '', contactName: '', contactEmail: '', contactPhone: '',
    // Step 3
    fields: [], budgetMin: '', budgetMax: '', contractTypes: [], preferOnline: false,
  });

  const set = (field) => (e) => setData((p) => ({ ...p, [field]: e.target.value }));
  const toggleArr = (field, val) =>
    setData((p) => ({
      ...p,
      [field]: p[field].includes(val) ? p[field].filter((x) => x !== val) : [...p[field], val],
    }));

  const handleComplete = () => {
    // TODO: submit to API
    router.push('/dashboard');
  };

  return (
    <div className={styles.page}>
      {/* Progress */}
      <div className={styles.progress}>
        {STEPS.map((s, i) => (
          <div key={s} className={styles.progressItem}>
            <div className={`${styles.progressDot} ${i < step ? styles.done : i === step ? styles.active : ''}`}>
              {i < step ? <CheckIcon /> : <span>{i + 1}</span>}
            </div>
            <span className={`${styles.progressLabel} ${i === step ? styles.progressLabelActive : ''}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`${styles.progressLine} ${i < step ? styles.progressLineDone : ''}`} />}
          </div>
        ))}
      </div>

      <div className={styles.card}>
        {/* Step 1 */}
        {step === 0 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Institution Profile</h2>
            <p className={styles.stepDesc}>Tell us about your institution so we can help you find the right lecturers.</p>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Institution Name *</label>
                <input className={styles.input} placeholder="e.g. Greenfield University" value={data.institutionName} onChange={set('institutionName')} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Institution Type *</label>
                <select className={styles.input} value={data.institutionType} onChange={set('institutionType')}>
                  <option value="">Select type…</option>
                  {['University', 'College', 'High School', 'Vocational Institute', 'Online Academy', 'Other'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Website</label>
                <input className={styles.input} placeholder="https://yourinstitution.edu" value={data.website} onChange={set('website')} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Institution Size</label>
                <select className={styles.input} value={data.size} onChange={set('size')}>
                  <option value="">Select size…</option>
                  {['< 500 students', '500 – 2,000', '2,000 – 10,000', '10,000+'].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Location & Contact</h2>
            <p className={styles.stepDesc}>Help lecturers find you and let us know who to reach regarding postings.</p>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Country *</label>
                <select className={styles.input} value={data.country} onChange={set('country')}>
                  <option value="">Select country…</option>
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Full Address</label>
                <input className={styles.input} placeholder="Street, City, State" value={data.address} onChange={set('address')} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Primary Contact Name *</label>
                <input className={styles.input} placeholder="Full name" value={data.contactName} onChange={set('contactName')} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Contact Email *</label>
                <input className={styles.input} type="email" placeholder="hr@yourinstitution.edu" value={data.contactEmail} onChange={set('contactEmail')} />
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label className={styles.label}>Contact Phone</label>
                <input className={styles.input} placeholder="+1 555 000 0000" value={data.contactPhone} onChange={set('contactPhone')} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Hiring Preferences</h2>
            <p className={styles.stepDesc}>Tell us what you're looking for so we can surface the best matches.</p>

            <div className={styles.fieldBlock}>
              <label className={styles.label}>Fields of Study (select all that apply)</label>
              <div className={styles.tagGrid}>
                {FIELDS.map((f) => (
                  <button key={f} type="button"
                    className={`${styles.tag} ${data.fields.includes(f) ? styles.tagActive : ''}`}
                    onClick={() => toggleArr('fields', f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Monthly Budget — Min (USD)</label>
                <input className={styles.input} type="number" placeholder="e.g. 1000" value={data.budgetMin} onChange={set('budgetMin')} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Monthly Budget — Max (USD)</label>
                <input className={styles.input} type="number" placeholder="e.g. 5000" value={data.budgetMax} onChange={set('budgetMax')} />
              </div>
            </div>

            <div className={styles.fieldBlock}>
              <label className={styles.label}>Preferred Contract Types</label>
              <div className={styles.tagGrid}>
                {CONTRACT_TYPES.map((ct) => (
                  <button key={ct} type="button"
                    className={`${styles.tag} ${data.contractTypes.includes(ct) ? styles.tagActive : ''}`}
                    onClick={() => toggleArr('contractTypes', ct)}>
                    {ct}
                  </button>
                ))}
              </div>
            </div>

            <label className={styles.checkRow}>
              <input type="checkbox" checked={data.preferOnline}
                onChange={(e) => setData((p) => ({ ...p, preferOnline: e.target.checked }))} />
              <span>Prefer online / remote lecturers</span>
            </label>
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Review & Complete</h2>
            <p className={styles.stepDesc}>Check your details before finalising your profile.</p>
            <div className={styles.reviewGrid}>
              <ReviewRow label="Institution" value={data.institutionName || '—'} />
              <ReviewRow label="Type" value={data.institutionType || '—'} />
              <ReviewRow label="Website" value={data.website || '—'} />
              <ReviewRow label="Country" value={data.country || '—'} />
              <ReviewRow label="Contact" value={data.contactName || '—'} />
              <ReviewRow label="Email" value={data.contactEmail || '—'} />
              <ReviewRow label="Fields" value={data.fields.join(', ') || '—'} />
              <ReviewRow label="Budget" value={data.budgetMin && data.budgetMax ? `$${data.budgetMin} – $${data.budgetMax}` : '—'} />
              <ReviewRow label="Contract Types" value={data.contractTypes.join(', ') || '—'} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className={styles.nav}>
          {step > 0 && (
            <button className={styles.btnBack} onClick={() => setStep((s) => s - 1)}>← Back</button>
          )}
          <div style={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <button className={styles.btnNext} onClick={() => setStep((s) => s + 1)}>Continue →</button>
          ) : (
            <button className={styles.btnNext} onClick={handleComplete}>Complete Setup ✓</button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div style={{ display: 'contents' }}>
      <dt style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</dt>
      <dd style={{ fontSize: '0.9rem', color: '#111827' }}>{value}</dd>
    </div>
  );
}

function CheckIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>;
}
