import AdminDashboardLayout from '../../../components/admin/layout/AdminDashboardLayout';
import InstitutionDetail from '../../../components/admin/institutions/InstitutionDetail';

export const metadata = { title: 'Institution Details — Admin — Lecturiing' };

export default async function InstitutionDetailPage({ params }) {
  const { id } = await params;
  return (
    <AdminDashboardLayout>
      <InstitutionDetail id={id} />
    </AdminDashboardLayout>
  );
}
