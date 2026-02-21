import LecturerProfile from '../../../components/dashboard/lecturers/LecturerProfile';

export const metadata = { title: 'Lecturer Profile — Lecturiing' };

export default async function LecturerProfilePage({ params }) {
  const { id } = await params;
  return <LecturerProfile id={id} />;
}
