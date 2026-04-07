'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import logo from '@/app/assets/Frame 36712.png';
import Link from 'next/link';
import RoleSelector from './RoleSelector';
import SocialButtons from './SocialButtons';
import styles from './LoginForm.module.css';
import { authService } from '@/app/lib/services/authService';
import api from '@/app/lib/api';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) setError(decodeURIComponent(urlError));
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login({ username, password, role });
      if (data.require2fa) {
        localStorage.setItem('tempToken', data.tempToken);
        router.push(`/verify-2fa?role=${role}`);
      } else {
        api.setToken(data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push(role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.brand}>
        <Image src={logo} alt="Lecturiing logo" width={56} height={56} className={styles.brandLogo} />
        <span className={styles.brandName}>Lecturiing</span>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>
          Sign in to your{' '}
          <span className={styles.roleLabel}>
            {role === 'admin' ? 'admin' : 'institution'}
          </span>{' '}
          account
        </p>
      </div>

      <RoleSelector activeRole={role} onRoleChange={setRole} />

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            className={styles.input}
            placeholder={role === 'admin' ? 'Admin username' : 'Institution username'}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`${styles.input} ${styles.inputPassword}`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOffIcon />
              ) : (
                <EyeIcon />
              )}
            </button>
          </div>
        </div>

        <div className={styles.forgotRow}>
          <a href="#" className={styles.forgotLink}>
            Forgot password?
          </a>
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      {role !== 'admin' && (
        <>
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>or continue with</span>
            <span className={styles.dividerLine} />
          </div>

          <SocialButtons role={role} />

          <p className={styles.footer}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className={styles.footerLink}>
              Register your institution
            </Link>
          </p>
        </>
      )}
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
