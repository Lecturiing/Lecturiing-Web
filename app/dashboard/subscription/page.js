import { Suspense } from 'react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import SubscriptionPage from '../../components/dashboard/subscription/SubscriptionPage';

export const metadata = { title: 'Subscription — Lecturiing' };

export default function Page() {
  return (
    <DashboardLayout>
      <Suspense>
        <SubscriptionPage />
      </Suspense>
    </DashboardLayout>
  );
}
