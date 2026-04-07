import JobForm from '@/app/components/dashboard/jobs/JobForm';

export const metadata = { title: 'Edit Job — Lecturiing' };

export default async function EditJobPage({ params }) {
  const { id } = await params;
  return <JobForm jobId={id} />;
}
