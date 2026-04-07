'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/app/lib/api';
import { authService } from '@/app/lib/services/authService';

function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) {
      setError('Google sign-in was cancelled or failed. Please try again.');
      return;
    }

    const require2fa = searchParams.get('require2fa') === 'true';
    const tempToken = searchParams.get('tempToken');
    const urlToken = searchParams.get('token');
    const role = searchParams.get('role') || 'institution';
    const isNewUser = searchParams.get('isNewUser') === 'true';

    // Case 1: User has 2FA enabled — redirect to verify-2fa page
    if (require2fa && tempToken) {
      localStorage.setItem('tempToken', tempToken);
      router.replace(`/verify-2fa?role=${role}&via=google`);
      return;
    }

    if (!urlToken) {
      setError('No token received from Google. Please try again.');
      return;
    }

    // Store the access token immediately
    api.setToken(urlToken);
    localStorage.setItem('accessToken', urlToken);

    // Fetch full user profile to get twoFactorEnabled + onboardingComplete
    authService.getMe()
      .then((user) => {
        localStorage.setItem('user', JSON.stringify({ ...user, role }));
        if (role === 'admin') {
          router.replace('/admin');
        } else if (isNewUser) {
          // New Google user: fill details first, then 2FA, then onboarding
          router.replace('/google-details');
        } else if (!user.twoFactorEnabled) {
          router.replace('/setup-2fa');
        } else if (!user.onboardingComplete) {
          router.replace('/dashboard/onboarding');
        } else {
          router.replace('/dashboard');
        }
      })
      .catch(() => {
        // Fallback if getMe fails
        if (isNewUser) {
          router.replace('/google-details');
        } else {
          router.replace('/dashboard');
        }
      });
  }, [router, searchParams]);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
        <p style={{ color: '#dc2626', fontSize: '1rem' }}>{error}</p>
        <button
          onClick={() => router.replace('/')}
          style={{ padding: '10px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p style={{ color: '#6b7280', fontSize: '1rem' }}>Signing you in…</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: '#6b7280', fontSize: '1rem' }}>Signing you in…</p>
      </div>
    }>
      <GoogleCallbackInner />
    </Suspense>
  );
}
