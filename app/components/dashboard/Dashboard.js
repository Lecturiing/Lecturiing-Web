import Image from 'next/image';
import Link from 'next/link';
import logo from '@/app/assets/Frame 36712.png';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerBrand}>
          <Image src={logo} alt="Lecturiing logo" width={36} height={36} />
          <span className={styles.brandName}>Lecturiing</span>
        </div>
        <nav className={styles.headerNav}>
          <Link href="/" className={styles.signOutLink}>
            Sign out
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.greetCard}>
          <div className={styles.greetIconWrap}>
            <WaveIcon />
          </div>
          <h1 className={styles.greetTitle}>Hello!</h1>
          <p className={styles.greetSubtitle}>
            Welcome to your Lecturiing dashboard. You&apos;re all set up and ready to go.
          </p>
        </div>

        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardIcon} style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <BuildingIcon />
            </div>
            <h3 className={styles.cardTitle}>Institution</h3>
            <p className={styles.cardDesc}>Manage your institution profile and settings.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
              <CoursesIcon />
            </div>
            <h3 className={styles.cardTitle}>Courses</h3>
            <p className={styles.cardDesc}>Create and manage your learning catalogue.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon} style={{ background: '#d1fae5', color: '#059669' }}>
              <UsersIcon />
            </div>
            <h3 className={styles.cardTitle}>Learners</h3>
            <p className={styles.cardDesc}>View and manage enrolled learners.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function WaveIcon() {
  return <span style={{ fontSize: '2rem', lineHeight: 1 }}>👋</span>;
}

function BuildingIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1" />
    </svg>
  );
}

function CoursesIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
