import AdminDashboardLayout from '../../components/admin/layout/AdminDashboardLayout';
import InstitutionsPage from '../../components/admin/institutions/InstitutionsPage';

export const metadata = { title: 'Institutions — Admin — Lecturiing' };

export default function Institutions() {
  return (
    <AdminDashboardLayout>
      <InstitutionsPage />
    </AdminDashboardLayout>
  );
}
