'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/app/assets/Frame 36712.png';
import styles from './AdminDashboardLayout.module.css';

const NAV = [
  { href: '/admin', label: 'Overview', icon: HomeIcon, exact: true },
  { href: '/admin/institutions', label: 'Institutions', icon: BuildingIcon },
  { href: '/admin/lecturers', label: 'Lecturers', icon: UsersIcon },
  { href: '/admin/verifications', label: 'Verifications', icon: ShieldIcon },
  { href: '/admin/moderation', label: 'Moderation', icon: AlertIcon },
  { href: '/admin/analytics', label: 'Analytics', icon: ChartIcon },
  { href: '/admin/settings', label: 'Settings', icon: SettingsIcon },
];

export default function AdminDashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const active = (item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const pageLabel = NAV.find((i) => active(i))?.label ?? 'Admin Dashboard';

  return (
    <div className={`${styles.shell} ${collapsed ? styles.collapsed : ''}`}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <Image src={logo} alt="Lecturiing Admin" width={30} height={30} className={styles.brandLogo} />
            {!collapsed && (
              <div className={styles.brandText}>
                <span className={styles.brandName}>Lecturiing</span>
                <span className={styles.brandBadge}>ADMIN</span>
              </div>
            )}
          </div>

          <nav className={styles.nav}>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${active(item) ? styles.navActive : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <span className={styles.navIcon}><item.icon /></span>
                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronIcon flipped={!collapsed} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className={styles.body}>
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>{pageLabel}</h1>
          <div className={styles.topbarRight}>
            <div className={styles.userChip}>
              <div className={styles.userAvatar}>AD</div>
              <span className={styles.userName}>Admin</span>
            </div>
            <Link href="/" className={styles.signOut}>Sign out</Link>
          </div>
        </header>

        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────────
function HomeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></svg>;
}
function BuildingIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1" /></svg>;
}
function ShieldIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
function ChartIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
}
function SettingsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" /></svg>;
}
function UsersIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
}
function AlertIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
}
function ChevronIcon({ flipped }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: flipped ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
      <polyline points="15,18 9,12 15,6" />
    </svg>
  );
}
