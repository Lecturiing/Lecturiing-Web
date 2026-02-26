import AdminDashboardLayout from '../../components/admin/layout/AdminDashboardLayout';
import ModerationPage from '../../components/admin/moderation/ModerationPage';

export const metadata = { title: 'Moderation — Admin — Lecturiing' };

export default function Moderation() {
  return (
    <AdminDashboardLayout>
      <ModerationPage />
    </AdminDashboardLayout>
  );
}
