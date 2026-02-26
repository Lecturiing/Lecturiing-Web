import AdminDashboardLayout from '../../../components/admin/layout/AdminDashboardLayout';
import LecturerDetail from '../../../components/admin/lecturers/LecturerDetail';

export const metadata = { title: 'Lecturer Details — Admin — Lecturiing' };

export default async function LecturerDetailPage({ params }) {
  const { id } = await params;
  return (
    <AdminDashboardLayout>
      <LecturerDetail id={id} />
    </AdminDashboardLayout>
  );
}
