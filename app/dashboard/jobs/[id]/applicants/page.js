import ApplicantsPage from '../../../../components/dashboard/jobs/ApplicantsPage';

export const metadata = { title: 'Applicants — Lecturiing' };

export default async function Applicants({ params }) {
  const { id } = await params;
  return <ApplicantsPage jobId={id} />;
}
