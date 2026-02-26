import AdminDashboardLayout from '../components/admin/layout/AdminDashboardLayout';
import OverviewPage from '../components/admin/overview/OverviewPage';

export const metadata = { title: 'Admin Dashboard — Lecturiing' };

export default function AdminOverview() {
  return (
    <AdminDashboardLayout>
      <OverviewPage />
    </AdminDashboardLayout>
  );
}
