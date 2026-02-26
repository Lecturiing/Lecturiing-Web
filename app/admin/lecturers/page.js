import AdminDashboardLayout from '../../components/admin/layout/AdminDashboardLayout';
import LecturersPage from '../../components/admin/lecturers/LecturersPage';

export const metadata = { title: 'Lecturers — Admin — Lecturiing' };

export default function Lecturers() {
  return (
    <AdminDashboardLayout>
      <LecturersPage />
    </AdminDashboardLayout>
  );
}
