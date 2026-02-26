import AdminDashboardLayout from '../../components/admin/layout/AdminDashboardLayout';
import VerificationsPage from '../../components/admin/verifications/VerificationsPage';

export const metadata = { title: 'Verifications — Admin — Lecturiing' };

export default function Verifications() {
  return (
    <AdminDashboardLayout>
      <VerificationsPage />
    </AdminDashboardLayout>
  );
}
