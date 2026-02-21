'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import logo from '@/app/assets/Frame 36712.png';
import SocialButtons from '../login/SocialButtons';
import styles from './SignupForm.module.css';

const INSTITUTION_TYPES = [
  'University',
  'College',
  'High School',
  'Primary School',
  'Vocational Institute',
  'Online Academy',
  'Other',
];

export default function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    institutionName: '',
    institutionType: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const passwordMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordMismatch) return;
    // TODO: wire up to registration API
    console.log(form);
    router.push('/verify-otp');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.brand}>
        <Image src={logo} alt="Lecturiing logo" width={56} height={56} className={styles.brandLogo} />
        <span className={styles.brandName}>Lecturiing</span>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>Register your institution</h1>
        <p className={styles.subtitle}>
          Set up your institution account and start managing learning today.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="institutionName">
              Institution Name
            </label>
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
            <label className={styles.label} htmlFor="institutionType">
              Institution Type
            </label>
            <select
              id="institutionType"
              className={`${styles.input} ${styles.select}`}
              value={form.institutionType}
              onChange={set('institutionType')}
              required
            >
              <option value="" disabled>Select type…</option>
              {INSTITUTION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Official Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={styles.input}
            placeholder="admin@yourinstitution.edu"
            value={form.email}
            onChange={set('email')}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            className={styles.input}
            placeholder="Choose a unique username"
            value={form.username}
            onChange={set('username')}
            required
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`${styles.input} ${styles.inputPassword}`}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={set('password')}
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className={styles.passwordWrapper}>
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                className={`${styles.input} ${styles.inputPassword} ${passwordMismatch ? styles.inputError : ''}`}
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {passwordMismatch && (
              <p className={styles.errorText}>Passwords do not match.</p>
            )}
          </div>
        </div>

        <button type="submit" className={styles.submitBtn}>
          Create Account
        </button>
      </form>

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>or sign up with</span>
        <span className={styles.dividerLine} />
      </div>

      <SocialButtons />

      <p className={styles.footer}>
        Already have an account?{' '}
        <Link href="/" className={styles.footerLink}>
          Sign in
        </Link>
      </p>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
