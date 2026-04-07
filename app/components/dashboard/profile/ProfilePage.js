'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ProfilePage.module.css';
import { authService } from '@/app/lib/services/authService';
import api from '@/app/lib/api';

const TABS = ['Profile', 'Security'];

const INSTITUTION_TYPES = [
  'University', 'College', 'High School', 'Primary School',
  'Vocational Institute', 'Online Academy', 'Other',
];

const FIELDS_OF_STUDY = [
  'Computer Science', 'Mathematics', 'Business', 'Engineering',
  'Medicine', 'Law', 'Arts & Humanities', 'Sciences', 'Education', 'Economics',
];

const CONTRACT_TYPES = ['Full-time', 'Part-time', 'Short-term', 'Per-session', 'Retainer'];

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Profile');
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);

  // Security tab state
  const [disableCode, setDisableCode] = useState('');
  const [disableError, setDisableError] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableSuccess, setDisableSuccess] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    authService.getMe()
      .then((data) => {
        setUser(data);
        initForm(data);
      })
      .catch(() => {
        try {
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          setUser(stored);
          initForm(stored);
        } catch (_) {}
      });
  }, []);

  function initForm(data) {
    const hp = data.hiringPreferences || {};
    setEditForm({
      institutionName: data.name || '',
      institutionType: data.type || '',
      website: data.website || '',
      size: data.size || '',
      country: data.country || '',
      address: data.address || '',
      city: data.city || '',
      contactName: data.contactName || '',
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      fields: hp.fields || [],
      budgetMin: hp.budgetMin || '',
      budgetMax: hp.budgetMax || '',
      contractTypes: hp.contractTypes || [],
      preferOnline: hp.preferOnline || false,
    });
  }

  const toggleArr = (key, val) =>
    setEditForm((p) => ({
      ...p,
      [key]: p[key].includes(val) ? p[key].filter((x) => x !== val) : [...p[key], val],
    }));

  const handleSave = async () => {
    setSaveError('');
    setSaveSuccess('');
    setSaveLoading(true);
    try {
      await api.patch('/api/onboarding/1', {
        institutionName: editForm.institutionName,
        institutionType: editForm.institutionType,
        website: editForm.website,
        size: editForm.size,
      });
      await api.patch('/api/onboarding/2', {
        country: editForm.country,
        city: editForm.city,
        address: editForm.address || user?.address || '',
        contactName: editForm.contactName,
        contactEmail: editForm.contactEmail,
        contactPhone: editForm.contactPhone,
      });
      await api.patch('/api/onboarding/3', {
        fields: editForm.fields,
        budgetMin: editForm.budgetMin,
        budgetMax: editForm.budgetMax,
        contractTypes: editForm.contractTypes,
        preferOnline: editForm.preferOnline,
      });
      setUser((prev) => ({
        ...prev,
        name: editForm.institutionName,
        type: editForm.institutionType,
        website: editForm.website,
        size: editForm.size,
        country: editForm.country,
        city: editForm.city,
        address: editForm.address,
        contactName: editForm.contactName,
        contactEmail: editForm.contactEmail,
        contactPhone: editForm.contactPhone,
        hiringPreferences: {
          fields: editForm.fields,
          budgetMin: editForm.budgetMin,
          budgetMax: editForm.budgetMax,
          contractTypes: editForm.contractTypes,
          preferOnline: editForm.preferOnline,
        },
      }));
      try {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, name: editForm.institutionName, type: editForm.institutionType }));
      } catch (_) {}
      setSaveSuccess('Profile updated successfully.');
      setEditing(false);
    } catch (err) {
      setSaveError(err.message || 'Failed to save changes.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCompleteSetup = async () => {
    setCompleteLoading(true);
    try {
      await api.patch('/api/onboarding/4', {});
      setUser((prev) => ({ ...prev, onboardingComplete: true }));
    } catch (_) {}
    setCompleteLoading(false);
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    if (disableCode.length < 6) { setDisableError('Enter the 6-digit code.'); return; }
    setDisableError('');
    setDisableLoading(true);
    try {
      await authService.disable2FA({ code: disableCode });
      setUser((prev) => ({ ...prev, twoFactorEnabled: false }));
      try {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, twoFactorEnabled: false }));
      } catch (_) {}
      setDisableSuccess(true);
      setDisableCode('');
    } catch (err) {
      setDisableError(err.message || 'Invalid code.');
    } finally {
      setDisableLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmNewPassword) { setPwError('New passwords do not match.'); return; }
    if (pwForm.newPassword.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    setPwError('');
    setPwSuccess('');
    setPwLoading(true);
    try {
      await authService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwSuccess('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setPwError(err.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) {
    return <div className={styles.loading}>Loading profile…</div>;
  }

  const initials = user.initials || (user.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'IN');

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.headerCard}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar} style={{ background: user.color || '#4f46e5' }}>
            {initials}
          </div>
        </div>
        <div className={styles.headerInfo}>
          <h2 className={styles.instName}>{user.name || 'Your Institution'}</h2>
          <p className={styles.instMeta}>{user.type} · {[user.city, user.country].filter(Boolean).join(', ') || 'Location not set'}</p>
          <div className={styles.badgeRow}>
            <span className={`${styles.badge} ${styles.planBadge}`}>{user.plan || 'Starter'} plan</span>
            <span className={`${styles.badge} ${user.verificationStatus === 'verified' ? styles.verifiedBadge : styles.pendingBadge}`}>
              {user.verificationStatus === 'verified' ? '✓ Verified' : user.verificationStatus || 'Pending'}
            </span>
            {!user.onboardingComplete && (
              <span className={`${styles.badge} ${styles.setupBadge}`}>Setup Incomplete</span>
            )}
          </div>
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

      {/* ── Profile Tab ── */}
      {activeTab === 'Profile' && (
        <div className={styles.content}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Institution Details</h3>
            {!editing ? (
              <button className={styles.editBtn} onClick={() => { setEditing(true); setSaveSuccess(''); setSaveError(''); }}>
                Edit
              </button>
            ) : (
              <div className={styles.editActions}>
                <button className={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
                <button className={styles.saveBtn} onClick={handleSave} disabled={saveLoading}>
                  {saveLoading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {saveError && <p className={styles.errorText}>{saveError}</p>}
          {saveSuccess && <p className={styles.successText}>{saveSuccess}</p>}

          <div className={styles.fieldGrid}>
            <Field label="Institution Name" editing={editing}
              value={editForm.institutionName} display={user.name || '—'}
              onChange={(v) => setEditForm((p) => ({ ...p, institutionName: v }))}
            />
            <Field label="Institution Type" editing={editing} type="select" options={INSTITUTION_TYPES}
              value={editForm.institutionType} display={user.type || '—'}
              onChange={(v) => setEditForm((p) => ({ ...p, institutionType: v }))}
            />
            <ReadonlyField label="Email" value={user.email || '—'} />
            <ReadonlyField label="Username" value={user.username || '—'} />
            <Field label="Website" editing={editing}
              value={editForm.website} display={user.website || '—'}
              onChange={(v) => setEditForm((p) => ({ ...p, website: v }))}
            />
            <Field label="Size" editing={editing} type="select"
              options={['1–10', '11–50', '51–200', '201–500', '500+']}
              value={editForm.size} display={user.size || '—'}
              onChange={(v) => setEditForm((p) => ({ ...p, size: v }))}
            />
            <Field label="Country" editing={editing}
              value={editForm.country} display={user.country || '—'}
              onChange={(v) => setEditForm((p) => ({ ...p, country: v }))}
            />
            <Field label="City" editing={editing}
              value={editForm.city} display={user.city || '—'}
              onChange={(v) => setEditForm((p) => ({ ...p, city: v }))}
            />
          </div>

          <div className={styles.sectionDivider} />
          <h3 className={styles.sectionTitle}>Contact Information</h3>

          <div className={styles.fieldGrid}>
            <Field label="Contact Name" editing={editing}
              value={editForm.contactName} display={user.contactName || '—'}
              onChange={(v) => setEditForm((p) => ({ ...p, contactName: v }))}
            />
            <Field label="Contact Email" editing={editing}
              value={editForm.contactEmail} display={user.contactEmail || '—'}
              onChange={(v) => setEditForm((p) => ({ ...p, contactEmail: v }))}
            />
            <Field label="Contact Phone" editing={editing}
              value={editForm.contactPhone} display={user.contactPhone || '—'}
              onChange={(v) => setEditForm((p) => ({ ...p, contactPhone: v }))}
            />
          </div>

          <div className={styles.sectionDivider} />
          <h3 className={styles.sectionTitle}>Hiring Preferences</h3>

          <div className={styles.fieldBlock}>
            <span className={styles.fieldLabel}>Fields of Study</span>
            {editing ? (
              <div className={styles.tagGrid}>
                {FIELDS_OF_STUDY.map((f) => (
                  <button key={f} type="button"
                    className={`${styles.tag} ${editForm.fields?.includes(f) ? styles.tagActive : ''}`}
                    onClick={() => toggleArr('fields', f)}>
                    {f}
                  </button>
                ))}
              </div>
            ) : (
              <p className={styles.fieldValue}>{(user.hiringPreferences?.fields || []).join(', ') || '—'}</p>
            )}
          </div>

          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Monthly Budget — Min (USD)</span>
              {editing ? (
                <input type="number" className={styles.fieldInput} placeholder="e.g. 1000"
                  value={editForm.budgetMin}
                  onChange={(e) => setEditForm((p) => ({ ...p, budgetMin: e.target.value }))} />
              ) : (
                <span className={styles.fieldValue}>{user.hiringPreferences?.budgetMin ? `$${user.hiringPreferences.budgetMin}` : '—'}</span>
              )}
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Monthly Budget — Max (USD)</span>
              {editing ? (
                <input type="number" className={styles.fieldInput} placeholder="e.g. 5000"
                  value={editForm.budgetMax}
                  onChange={(e) => setEditForm((p) => ({ ...p, budgetMax: e.target.value }))} />
              ) : (
                <span className={styles.fieldValue}>{user.hiringPreferences?.budgetMax ? `$${user.hiringPreferences.budgetMax}` : '—'}</span>
              )}
            </div>
          </div>

          <div className={styles.fieldBlock}>
            <span className={styles.fieldLabel}>Preferred Contract Types</span>
            {editing ? (
              <div className={styles.tagGrid}>
                {CONTRACT_TYPES.map((ct) => (
                  <button key={ct} type="button"
                    className={`${styles.tag} ${editForm.contractTypes?.includes(ct) ? styles.tagActive : ''}`}
                    onClick={() => toggleArr('contractTypes', ct)}>
                    {ct}
                  </button>
                ))}
              </div>
            ) : (
              <p className={styles.fieldValue}>{(user.hiringPreferences?.contractTypes || []).join(', ') || '—'}</p>
            )}
          </div>

          <div className={styles.fieldBlock}>
            <span className={styles.fieldLabel}>Remote / Online</span>
            {editing ? (
              <label className={styles.checkRow}>
                <input type="checkbox" checked={editForm.preferOnline}
                  onChange={(e) => setEditForm((p) => ({ ...p, preferOnline: e.target.checked }))} />
                <span>Prefer online / remote lecturers</span>
              </label>
            ) : (
              <span className={styles.fieldValue}>{user.hiringPreferences?.preferOnline ? 'Yes — prefers remote' : 'No preference'}</span>
            )}
          </div>

          {/* Complete Setup Banner */}
          {!user.onboardingComplete && (
            <div className={styles.onboardingBanner}>
              <div className={styles.onboardingBannerText}>
                <strong>Complete your profile setup</strong>
                <p>Mark your profile as complete to unlock all platform features.</p>
              </div>
              <button className={styles.saveBtn} onClick={handleCompleteSetup} disabled={completeLoading}>
                {completeLoading ? 'Saving…' : 'Mark as Complete'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Security Tab ── */}
      {activeTab === 'Security' && (
        <div className={styles.content}>
          {/* 2FA Section */}
          <div className={styles.secCard}>
            <div className={styles.secCardHeader}>
              <div className={styles.secCardIcon}><ShieldIcon /></div>
              <div className={styles.secCardInfo}>
                <h3 className={styles.secCardTitle}>Two-Factor Authentication</h3>
                <p className={styles.secCardSub}>Protect your account with TOTP (Google Authenticator, Authy)</p>
              </div>
              <span className={user.twoFactorEnabled ? styles.badgeEnabled : styles.badgeDisabled}>
                {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {!user.twoFactorEnabled && (
              <div className={styles.secCardBody}>
                <p className={styles.bodyText}>2FA is not enabled. Enable it to secure your account with a second factor.</p>
                <button className={styles.primaryBtn} onClick={() => router.push('/setup-2fa')}>Set Up 2FA</button>
              </div>
            )}

            {user.twoFactorEnabled && (
              <div className={styles.secCardBody}>
                <p className={styles.bodyText}>2FA is active on your account.</p>
                <button className={styles.secondaryBtn} onClick={() => router.push('/setup-2fa')} style={{ marginBottom: 16 }}>
                  Reset 2FA (generate new secret)
                </button>

                <div className={styles.secDivider} />
                <h4 className={styles.dangerTitle}>Disable 2FA</h4>
                <p className={styles.bodyText}>Enter your current 6-digit authenticator code to disable 2FA.</p>

                {disableSuccess ? (
                  <div className={styles.successMsg}>2FA disabled successfully.</div>
                ) : (
                  <form onSubmit={handleDisable2FA} className={styles.inlineForm}>
                    <input
                      type="text" inputMode="numeric" maxLength={6}
                      className={styles.codeInput} placeholder="000000"
                      value={disableCode}
                      onChange={(e) => { setDisableCode(e.target.value.replace(/\D/g, '')); setDisableError(''); }}
                    />
                    {disableError && <p className={styles.errorText}>{disableError}</p>}
                    <button type="submit" className={styles.dangerBtn} disabled={disableCode.length < 6 || disableLoading}>
                      {disableLoading ? 'Disabling…' : 'Disable 2FA'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Change Password Section */}
          <div className={styles.secCard}>
            <div className={styles.secCardHeader}>
              <div className={styles.secCardIcon}><LockIcon /></div>
              <div className={styles.secCardInfo}>
                <h3 className={styles.secCardTitle}>Change Password</h3>
                <p className={styles.secCardSub}>Update your account password</p>
              </div>
            </div>

            <div className={styles.secCardBody}>
              {pwSuccess && <div className={styles.successMsg}>{pwSuccess}</div>}
              <form onSubmit={handleChangePassword} className={styles.pwForm}>
                <div className={styles.pwField}>
                  <label className={styles.pwLabel}>Current Password</label>
                  <input type="password" className={styles.pwInput} placeholder="Enter current password"
                    value={pwForm.currentPassword}
                    onChange={(e) => { setPwForm((p) => ({ ...p, currentPassword: e.target.value })); setPwError(''); }} />
                </div>
                <div className={styles.pwField}>
                  <label className={styles.pwLabel}>New Password</label>
                  <input type="password" className={styles.pwInput} placeholder="Min. 8 characters"
                    value={pwForm.newPassword}
                    onChange={(e) => { setPwForm((p) => ({ ...p, newPassword: e.target.value })); setPwError(''); }} />
                </div>
                <div className={styles.pwField}>
                  <label className={styles.pwLabel}>Confirm New Password</label>
                  <input type="password" className={styles.pwInput} placeholder="Re-enter new password"
                    value={pwForm.confirmNewPassword}
                    onChange={(e) => { setPwForm((p) => ({ ...p, confirmNewPassword: e.target.value })); setPwError(''); }} />
                </div>
                {pwError && <p className={styles.errorText}>{pwError}</p>}
                <button type="submit" className={styles.primaryBtn} disabled={!pwForm.currentPassword || !pwForm.newPassword || pwLoading}>
                  {pwLoading ? 'Changing…' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable field that is read-only or editable
function Field({ label, value, display, editing, onChange, type = 'text', options = [] }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {editing ? (
        type === 'select' ? (
          <select className={styles.fieldInput} value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="">Select…</option>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input type="text" className={styles.fieldInput} value={value} onChange={(e) => onChange(e.target.value)} />
        )
      ) : (
        <span className={styles.fieldValue}>{display || '—'}</span>
      )}
    </div>
  );
}

function ReadonlyField({ label, value }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>{value || '—'}</span>
    </div>
  );
}

function ShieldIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
function LockIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
}
