'use client';

import { useState } from 'react';
import styles from './SettingsPage.module.css';

const TABS = ['General', 'Platform', 'Verification', 'Billing', 'Security'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General');
  const [settings, setSettings] = useState({
    platformName: 'Lecturiing',
    supportEmail: 'support@lecturiing.com',
    timezone: 'GMT+0',
    currency: 'USD',
    maintenanceMode: false,
    autoApproveVerifications: false,
    requireTwoFactor: true,
    allowInstitutionSignup: true,
    verificationDocumentCount: 5,
    sessionTimeout: 30,
    minPasswordLength: 8,
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Admin Settings</h2>
          <p className={styles.sub}>Configure platform settings and preferences</p>
        </div>
        <button className={styles.saveBtn} onClick={handleSave}>
          💾 Save Changes
        </button>
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

      {/* Content */}
      <div className={styles.content}>
        {/* General Tab */}
        {activeTab === 'General' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>General Settings</h3>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Platform Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={settings.platformName}
                  onChange={(e) => handleChange('platformName', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Support Email</label>
                <input
                  type="email"
                  className={styles.input}
                  value={settings.supportEmail}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Default Timezone</label>
                <select
                  className={styles.select}
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                >
                  <option value="GMT-8">GMT-8 (Pacific)</option>
                  <option value="GMT-5">GMT-5 (Eastern)</option>
                  <option value="GMT+0">GMT+0 (UTC)</option>
                  <option value="GMT+1">GMT+1 (Central Europe)</option>
                  <option value="GMT+3">GMT+3 (East Africa)</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Default Currency</label>
                <select
                  className={styles.select}
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="GHS">GHS (₵)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Platform Tab */}
        {activeTab === 'Platform' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Platform Controls</h3>

            <div className={styles.toggle}>
              <div className={styles.toggleInfo}>
                <p className={styles.toggleLabel}>Maintenance Mode</p>
                <p className={styles.toggleDesc}>
                  Temporarily disable the platform for maintenance. Users will see a maintenance page.
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.toggle}>
              <div className={styles.toggleInfo}>
                <p className={styles.toggleLabel}>Allow Institution Signup</p>
                <p className={styles.toggleDesc}>
                  Enable or disable new institution registrations on the platform.
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.allowInstitutionSignup}
                  onChange={(e) => handleChange('allowInstitutionSignup', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            {settings.maintenanceMode && (
              <div className={styles.alert}>
                ⚠️ Maintenance mode is currently <strong>ENABLED</strong>. The platform is not accessible to users.
              </div>
            )}
          </div>
        )}

        {/* Verification Tab */}
        {activeTab === 'Verification' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Verification Settings</h3>

            <div className={styles.toggle}>
              <div className={styles.toggleInfo}>
                <p className={styles.toggleLabel}>Auto-Approve Verifications</p>
                <p className={styles.toggleDesc}>
                  Automatically approve institution verifications without manual review. Not recommended.
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.autoApproveVerifications}
                  onChange={(e) => handleChange('autoApproveVerifications', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Required Document Count</label>
              <input
                type="number"
                className={styles.input}
                value={settings.verificationDocumentCount}
                onChange={(e) => handleChange('verificationDocumentCount', parseInt(e.target.value))}
                min="3"
                max="10"
              />
              <p className={styles.hint}>Number of documents institutions must submit for verification (3-10)</p>
            </div>

            {settings.autoApproveVerifications && (
              <div className={styles.alertRed}>
                ⚠️ <strong>Warning:</strong> Auto-approval is enabled. All verifications will be approved automatically.
              </div>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'Billing' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Billing Configuration</h3>

            <div className={styles.planGrid}>
              <div className={styles.planCard}>
                <h4 className={styles.planName}>Starter</h4>
                <p className={styles.planPrice}>$49/month</p>
                <ul className={styles.planFeatures}>
                  <li>Up to 5 active jobs</li>
                  <li>Up to 3 lecturers</li>
                  <li>Basic analytics</li>
                  <li>Email support</li>
                </ul>
                <button className={styles.planEdit}>Edit Plan</button>
              </div>

              <div className={styles.planCard}>
                <h4 className={styles.planName}>Professional</h4>
                <p className={styles.planPrice}>$99/month</p>
                <ul className={styles.planFeatures}>
                  <li>Up to 15 active jobs</li>
                  <li>Up to 10 lecturers</li>
                  <li>Advanced analytics</li>
                  <li>Priority support</li>
                </ul>
                <button className={styles.planEdit}>Edit Plan</button>
              </div>

              <div className={styles.planCard}>
                <div className={styles.planBadge}>Most Popular</div>
                <h4 className={styles.planName}>Enterprise</h4>
                <p className={styles.planPrice}>$249/month</p>
                <ul className={styles.planFeatures}>
                  <li>Unlimited jobs</li>
                  <li>Unlimited lecturers</li>
                  <li>Custom analytics</li>
                  <li>Dedicated support</li>
                </ul>
                <button className={styles.planEdit}>Edit Plan</button>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'Security' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Security Settings</h3>

            <div className={styles.toggle}>
              <div className={styles.toggleInfo}>
                <p className={styles.toggleLabel}>Require Two-Factor Authentication</p>
                <p className={styles.toggleDesc}>
                  Force all users to enable 2FA on their accounts for enhanced security.
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.requireTwoFactor}
                  onChange={(e) => handleChange('requireTwoFactor', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Session Timeout (minutes)</label>
              <input
                type="number"
                className={styles.input}
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                min="5"
                max="120"
              />
              <p className={styles.hint}>Auto-logout users after this period of inactivity (5-120 minutes)</p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Minimum Password Length</label>
              <input
                type="number"
                className={styles.input}
                value={settings.minPasswordLength}
                onChange={(e) => handleChange('minPasswordLength', parseInt(e.target.value))}
                min="6"
                max="32"
              />
              <p className={styles.hint}>Minimum number of characters required for passwords (6-32)</p>
            </div>

            <div className={styles.alertGreen}>
              ✓ Two-factor authentication is currently <strong>required</strong> for all users.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
