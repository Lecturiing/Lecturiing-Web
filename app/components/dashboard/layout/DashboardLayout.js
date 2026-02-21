'use client';

import { useState, useRef, useEffect } from 'react';
import { MOCK_NOTIFICATIONS } from '@/app/lib/mockData';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/app/assets/Frame 36712.png';
import styles from './DashboardLayout.module.css';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: HomeIcon, exact: true },
  { href: '/dashboard/onboarding', label: 'Profile Setup', icon: BuildingIcon },
  { href: '/dashboard/jobs', label: 'Job Postings', icon: BriefcaseIcon },
  { href: '/dashboard/shortlist', label: 'Shortlist', icon: StarIcon },
  { href: '/dashboard/contracts', label: 'Contracts', icon: DocumentIcon },
  { href: '/dashboard/offers', label: 'Offers', icon: OfferIcon },
  { href: '/dashboard/documents', label: 'Doc Library', icon: FolderIcon },
  { href: '/dashboard/hired', label: 'Hired', icon: UsersIcon },
  { href: '/dashboard/performance', label: 'Performance', icon: ChartIcon },
  { href: '/dashboard/verification', label: 'Verification', icon: ShieldIcon },
  { href: '/dashboard/notifications', label: 'Notifications', icon: BellNavIcon },
];

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const pathname = usePathname();
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  const active = (item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const pageLabel = NAV.find((i) => active(i))?.label ?? 'Dashboard';

  return (
    <div className={`${styles.shell} ${collapsed ? styles.collapsed : ''}`}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <Image src={logo} alt="Lecturiing" width={30} height={30} className={styles.brandLogo} />
            {!collapsed && <span className={styles.brandName}>Lecturiing</span>}
          </div>

          <nav className={styles.nav}>
            {NAV.map((item) => {
              const isNotif = item.href === '/dashboard/notifications';
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${active(item) ? styles.navActive : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className={styles.navIcon} style={{ position: 'relative' }}>
                    <item.icon />
                    {isNotif && unreadCount > 0 && (
                      <span className={styles.navBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                    )}
                  </span>
                  {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                  {!collapsed && isNotif && unreadCount > 0 && (
                    <span className={styles.navBadgePill}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </Link>
              );
            })}
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

            {/* ── Notification Bell ── */}
            <div className={styles.notifWrap} ref={notifRef}>
              <button
                className={styles.notifBtn}
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Notifications"
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <span className={styles.notifBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className={styles.notifDropdown}>
                  <div className={styles.notifDropdownHeader}>
                    <span className={styles.notifDropdownTitle}>Notifications</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {unreadCount > 0 && (
                        <button className={styles.markAllBtn} onClick={markAllRead}>
                          Mark all read
                        </button>
                      )}
                      <Link
                        href="/dashboard/notifications"
                        className={styles.viewAllBtn}
                        onClick={() => setNotifOpen(false)}
                      >
                        View all
                      </Link>
                    </div>
                  </div>

                  <div className={styles.notifList}>
                    {notifications.slice(0, 5).map((n) => (
                      <Link
                        key={n.id}
                        href={n.href}
                        className={`${styles.notifItem} ${!n.read ? styles.notifUnread : ''}`}
                        onClick={() => { markRead(n.id); setNotifOpen(false); }}
                      >
                        <div
                          className={styles.notifAvatar}
                          style={{ background: n.color }}
                        >
                          {n.initials ?? <NotifIconFor type={n.icon} />}
                        </div>
                        <div className={styles.notifContent}>
                          <p className={styles.notifTitle}>{n.title}</p>
                          <p className={styles.notifBody}>{n.body}</p>
                          <p className={styles.notifTime}>{n.time}</p>
                        </div>
                        {!n.read && <span className={styles.notifDot} />}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href="/dashboard/notifications"
                    className={styles.notifFooter}
                    onClick={() => setNotifOpen(false)}
                  >
                    See all notifications →
                  </Link>
                </div>
              )}
            </div>

            <div className={styles.userChip}>
              <div className={styles.userAvatar}>IN</div>
              <span className={styles.userName}>Institution</span>
            </div>
            <Link href="/" className={styles.signOut}>Sign out</Link>
          </div>
        </header>

        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}

function NotifIconFor({ type }) {
  if (type === 'shield') return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
  if (type === 'star') return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>;
  return null;
}

// ── Icons ──────────────────────────────────────────────────────────────────────
function HomeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></svg>;
}
function BuildingIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1" /></svg>;
}
function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
}
function BriefcaseIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /><line x1="12" y1="12" x2="12" y2="12" /></svg>;
}
function StarIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>;
}
function DocumentIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
}
function ChartIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
}
function ShieldIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
function OfferIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>;
}
function FolderIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>;
}
function UsersIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
}
function BellIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>;
}
function BellNavIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>;
}
function ChevronIcon({ flipped }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: flipped ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
      <polyline points="15,18 9,12 15,6" />
    </svg>
  );
}
