import AdminDashboardLayout from '../../components/admin/layout/AdminDashboardLayout';
import AnalyticsPage from '../../components/admin/analytics/AnalyticsPage';

export const metadata = { title: 'Analytics — Admin — Lecturiing' };

export default function Analytics() {
  return (
    <AdminDashboardLayout>
      <AnalyticsPage />
    </AdminDashboardLayout>
  );
}
