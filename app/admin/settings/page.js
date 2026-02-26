import AdminDashboardLayout from '../../components/admin/layout/AdminDashboardLayout';
import SettingsPage from '../../components/admin/settings/SettingsPage';

export const metadata = { title: 'Settings — Admin — Lecturiing' };

export default function Settings() {
  return (
    <AdminDashboardLayout>
      <SettingsPage />
    </AdminDashboardLayout>
  );
}
