import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import BrowseJobsPage from '../../components/dashboard/browse/BrowseJobsPage';

export const metadata = { title: 'Browse Jobs — Lecturiing' };

export default function BrowsePage() {
  return (
    // <DashboardLayout>
      <BrowseJobsPage />
    // </DashboardLayout>
  );
}
