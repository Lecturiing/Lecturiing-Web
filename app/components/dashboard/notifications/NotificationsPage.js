'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_NOTIFICATIONS } from '@/app/lib/mockData';
import styles from './NotificationsPage.module.css';

const TYPE_LABELS = {
  application: 'Application',
  offer_accepted: 'Offer',
  offer_declined: 'Offer',
  doc_signed: 'Document',
  verification: 'Verification',
  shortlist: 'Shortlist',
};

const TYPE_COLORS = {
  application: { bg: '#ede9fe', text: '#6d28d9' },
  offer_accepted: { bg: '#d1fae5', text: '#065f46' },
  offer_declined: { bg: '#fee2e2', text: '#991b1b' },
  doc_signed: { bg: '#dbeafe', text: '#1e40af' },
  verification: { bg: '#fef3c7', text: '#92400e' },
  shortlist: { bg: '#e0f2fe', text: '#0c4a6e' },
};

const TABS = ['All', 'Unread', 'Applications', 'Offers', 'Documents'];

function filterByTab(notifications, tab) {
  if (tab === 'All') return notifications;
  if (tab === 'Unread') return notifications.filter((n) => !n.read);
  if (tab === 'Applications') return notifications.filter((n) => n.type === 'application');
  if (tab === 'Offers') return notifications.filter((n) => n.type === 'offer_accepted' || n.type === 'offer_declined');
  if (tab === 'Documents') return notifications.filter((n) => n.type === 'doc_signed');
  return notifications;
}

function NotifIcon({ type, icon }) {
  if (icon === 'shield') return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
  if (icon === 'star') return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>;
  if (type === 'application') return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>;
  if (type === 'offer_accepted' || type === 'offer_declined') return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 12V22H4V12" /><path d="M22 7H2v5h20V7z" /><path d="M12 22V7" /></svg>;
  if (type === 'doc_signed') return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><polyline points="9,15 10.5,16.5 13.5,12" /></svg>;
  return null;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filterByTab(notifications, activeTab);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Notifications</h2>
          <p className={styles.sub}>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up — no unread notifications'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className={styles.markAllBtn} onClick={markAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
            {t === 'Unread' && unreadCount > 0 && (
              <span className={styles.tabBadge}>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No notifications here</p>
            <p className={styles.emptySub}>When you receive notifications they&apos;ll appear here.</p>
          </div>
        ) : (
          filtered.map((n) => {
            const typeStyle = TYPE_COLORS[n.type] ?? { bg: '#f3f4f6', text: '#374151' };
            return (
              <div
                key={n.id}
                className={`${styles.notifRow} ${!n.read ? styles.notifUnread : ''}`}
              >
                <div className={styles.notifLeft}>
                  <div className={styles.avatarWrap} style={{ background: n.color }}>
                    {n.initials ?? <NotifIcon type={n.type} icon={n.icon} />}
                  </div>
                </div>

                <div className={styles.notifBody}>
                  <div className={styles.notifTop}>
                    <span
                      className={styles.typeBadge}
                      style={{ background: typeStyle.bg, color: typeStyle.text }}
                    >
                      {TYPE_LABELS[n.type] ?? n.type}
                    </span>
                    <span className={styles.notifTime}>{n.time}</span>
                  </div>
                  <p className={styles.notifTitle}>{n.title}</p>
                  <p className={styles.notifText}>{n.body}</p>
                  <div className={styles.notifActions}>
                    <Link
                      href={n.href}
                      className={styles.viewBtn}
                      onClick={() => markRead(n.id)}
                    >
                      View →
                    </Link>
                    {!n.read && (
                      <button className={styles.readBtn} onClick={() => markRead(n.id)}>
                        Mark as read
                      </button>
                    )}
                    <button className={styles.deleteBtn} onClick={() => deleteNotif(n.id)}>
                      Dismiss
                    </button>
                  </div>
                </div>

                {!n.read && <span className={styles.unreadDot} />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
