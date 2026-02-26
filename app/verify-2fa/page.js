import { Suspense } from 'react';
import Verify2FAPage from '../components/verify2fa/Verify2FAPage';

export const metadata = { title: 'Two-Factor Authentication — Lecturiing' };

export default function Verify2FA() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Verify2FAPage />
    </Suspense>
  );
}
