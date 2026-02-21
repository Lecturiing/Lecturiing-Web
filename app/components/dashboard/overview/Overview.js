import Link from 'next/link';
import { MOCK_JOBS, MOCK_SHORTLIST, MOCK_CONTRACTS, MOCK_ACTIVITY } from '@/app/lib/mockData';
import styles from './Overview.module.css';

const activeJobs = MOCK_JOBS.filter((j) => j.status === 'active').length;
const shortlisted = MOCK_SHORTLIST.length;
const activeContracts = MOCK_CONTRACTS.filter((c) => c.status === 'active').length;
const pendingReviews = MOCK_CONTRACTS.filter((c) => c.status === 'completed').length;

const STATS = [
  { label: 'Active Jobs', value: activeJobs, color: '#4f46e5', bg: '#eef2ff', icon: BriefcaseIcon, href: '/dashboard/jobs' },
  { label: 'Shortlisted', value: shortlisted, color: '#7c3aed', bg: '#f5f3ff', icon: StarIcon, href: '/dashboard/shortlist' },
  { label: 'Active Contracts', value: activeContracts, color: '#059669', bg: '#d1fae5', icon: DocumentIcon, href: '/dashboard/contracts' },
  { label: 'Pending Reviews', value: pendingReviews, color: '#d97706', bg: '#fef3c7', icon: ChartIcon, href: '/dashboard/performance' },
];

export default function Overview() {
  return (
    <div className={styles.page}>
      {/* Onboarding banner */}
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <span className={styles.bannerBadge}>Setup</span>
          <div>
            <p className={styles.bannerTitle}>Complete your institution profile</p>
            <p className={styles.bannerSub}>Finish onboarding to unlock all features and start posting jobs.</p>
          </div>
        </div>
        <Link href="/dashboard/onboarding" className={styles.bannerBtn}>Continue Setup →</Link>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        {STATS.map((s) => (
          <Link key={s.label} href={s.href} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: s.bg, color: s.color }}>
              <s.icon />
            </div>
            <div>
              <p className={styles.statValue}>{s.value}</p>
              <p className={styles.statLabel}>{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.grid}>
        {/* Quick Actions */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actions}>
            <Link href="/dashboard/jobs/new" className={styles.actionCard}>
              <div className={styles.actionIcon} style={{ background: '#eef2ff', color: '#4f46e5' }}><BriefcaseIcon /></div>
              <span>Post a Job</span>
            </Link>
            <Link href="/dashboard/lecturers" className={styles.actionCard}>
              <div className={styles.actionIcon} style={{ background: '#f5f3ff', color: '#7c3aed' }}><SearchIcon /></div>
              <span>Find Lecturers</span>
            </Link>
            <Link href="/dashboard/shortlist" className={styles.actionCard}>
              <div className={styles.actionIcon} style={{ background: '#fef3c7', color: '#d97706' }}><CalendarIcon /></div>
              <span>Schedule Interview</span>
            </Link>
            <Link href="/dashboard/contracts" className={styles.actionCard}>
              <div className={styles.actionIcon} style={{ background: '#d1fae5', color: '#059669' }}><DocumentIcon /></div>
              <span>View Contracts</span>
            </Link>
          </div>
        </section>

        {/* Recent Activity */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <ul className={styles.activityList}>
            {MOCK_ACTIVITY.map((a) => (
              <li key={a.id} className={styles.activityItem}>
                <span className={styles.activityDot} style={{ background: a.color }} />
                <div>
                  <p className={styles.activityText}>{a.text}</p>
                  <p className={styles.activityTime}>{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Job overview */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Active Job Postings</h2>
          <Link href="/dashboard/jobs" className={styles.seeAll}>See all →</Link>
        </div>
        <div className={styles.jobTable}>
          <div className={styles.jobTableHead}>
            <span>Title</span><span>Field</span><span>Applicants</span><span>Deadline</span><span>Status</span>
          </div>
          {MOCK_JOBS.filter((j) => j.status === 'active').map((job) => (
            <div key={job.id} className={styles.jobTableRow}>
              <span className={styles.jobTitle}>{job.title}</span>
              <span className={styles.jobField}>{job.field}</span>
              <span>{job.applicants}</span>
              <span>{job.deadline}</span>
              <span><StatusBadge status={job.status} /></span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { active: ['Active', '#d1fae5', '#059669'], draft: ['Draft', '#f3f4f6', '#6b7280'], closed: ['Closed', '#fee2e2', '#dc2626'] };
  const [label, bg, color] = map[status] ?? ['Unknown', '#f3f4f6', '#6b7280'];
  return <span style={{ background: bg, color, padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>{label}</span>;
}

function BriefcaseIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>; }
function StarIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>; }
function DocumentIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /></svg>; }
function ChartIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>; }
function SearchIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>; }
function CalendarIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>; }
