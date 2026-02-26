'use client';

import { useState } from 'react';
import { MOCK_ADMIN_STATS, MOCK_INSTITUTIONS } from '@/app/lib/mockData';
import styles from './AnalyticsPage.module.css';

const REVENUE_DATA = [
  { month: 'Aug', revenue: 18500, institutions: 4 },
  { month: 'Sep', revenue: 21200, institutions: 5 },
  { month: 'Oct', revenue: 24800, institutions: 6 },
  { month: 'Nov', revenue: 26400, institutions: 7 },
  { month: 'Dec', revenue: 28900, institutions: 7 },
  { month: 'Jan', revenue: 30100, institutions: 8 },
  { month: 'Feb', revenue: 32550, institutions: 8 },
];

const JOB_CATEGORIES = [
  { category: 'Computer Science', count: 18, percentage: 29 },
  { category: 'Business', count: 12, percentage: 19 },
  { category: 'Engineering', count: 10, percentage: 16 },
  { category: 'Mathematics', count: 8, percentage: 13 },
  { category: 'Humanities', count: 7, percentage: 11 },
  { category: 'Others', count: 7, percentage: 11 },
];

const TABS = ['Overview', 'Revenue', 'Institutions', 'Jobs & Lecturers'];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const stats = MOCK_ADMIN_STATS;

  const maxRevenue = Math.max(...REVENUE_DATA.map((d) => d.revenue));

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Analytics & Reports</h2>
          <p className={styles.sub}>Platform performance metrics and insights</p>
        </div>
        <div className={styles.dateRange}>
          <span className={styles.dateLabel}>Period:</span>
          <select className={styles.dateSelect}>
            <option>Last 7 months</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last 12 months</option>
          </select>
        </div>
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
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'Overview' && (
        <div className={styles.content}>
          {/* KPI Grid */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Total Revenue</span>
                <span className={styles.kpiTrend}>↑ 12.6%</span>
              </div>
              <p className={styles.kpiValue}>$32,550</p>
              <p className={styles.kpiSub}>This month</p>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Active Institutions</span>
                <span className={styles.kpiTrend}>↑ 14.3%</span>
              </div>
              <p className={styles.kpiValue}>{stats.institutions.active}</p>
              <p className={styles.kpiSub}>Out of {stats.institutions.total} total</p>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Active Lecturers</span>
                <span className={styles.kpiTrend}>↑ 8.7%</span>
              </div>
              <p className={styles.kpiValue}>{stats.lecturers.active}</p>
              <p className={styles.kpiSub}>Platform-wide</p>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Job Fill Rate</span>
                <span className={styles.kpiTrendNeutral}>→ 0%</span>
              </div>
              <p className={styles.kpiValue}>{((stats.jobs.filled / stats.jobs.total) * 100).toFixed(1)}%</p>
              <p className={styles.kpiSub}>{stats.jobs.filled} of {stats.jobs.total} jobs</p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className={styles.chartSection}>
            <h3 className={styles.chartTitle}>Revenue Growth</h3>
            <div className={styles.chart}>
              <div className={styles.chartGrid}>
                {REVENUE_DATA.map((item, idx) => (
                  <div key={idx} className={styles.chartBar}>
                    <div
                      className={styles.chartBarFill}
                      style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                    />
                    <span className={styles.chartValue}>${(item.revenue / 1000).toFixed(1)}k</span>
                    <span className={styles.chartLabel}>{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className={styles.chartSection}>
            <h3 className={styles.chartTitle}>Job Postings by Category</h3>
            <div className={styles.categoryList}>
              {JOB_CATEGORIES.map((cat, idx) => (
                <div key={idx} className={styles.categoryRow}>
                  <div className={styles.categoryInfo}>
                    <span className={styles.categoryName}>{cat.category}</span>
                    <span className={styles.categoryCount}>{cat.count} jobs</span>
                  </div>
                  <div className={styles.categoryBar}>
                    <div
                      className={styles.categoryBarFill}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <span className={styles.categoryPercent}>{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'Revenue' && (
        <div className={styles.content}>
          <div className={styles.revenueGrid}>
            <div className={styles.revenueCard}>
              <p className={styles.revenueLabel}>Total Revenue (7 months)</p>
              <p className={styles.revenueValue}>$182,450</p>
              <p className={styles.revenueMeta}>Avg $26,064/month</p>
            </div>
            <div className={styles.revenueCard}>
              <p className={styles.revenueLabel}>This Month</p>
              <p className={styles.revenueValue}>$32,550</p>
              <p className={styles.revenueMeta}>↑ $3,650 vs last month</p>
            </div>
            <div className={styles.revenueCard}>
              <p className={styles.revenueLabel}>Projected Next Month</p>
              <p className={styles.revenueValue}>$36,600</p>
              <p className={styles.revenueMeta}>Based on current growth</p>
            </div>
          </div>

          <div className={styles.chartSection}>
            <h3 className={styles.chartTitle}>Revenue Trend</h3>
            <div className={styles.chart} style={{ height: '320px' }}>
              <div className={styles.chartGrid}>
                {REVENUE_DATA.map((item, idx) => (
                  <div key={idx} className={styles.chartBar}>
                    <div
                      className={styles.chartBarFill}
                      style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                    />
                    <span className={styles.chartValue}>${(item.revenue / 1000).toFixed(1)}k</span>
                    <span className={styles.chartLabel}>{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.tableSection}>
            <h3 className={styles.tableTitle}>Revenue by Institution</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Institution</th>
                  <th>Plan</th>
                  <th>Monthly Revenue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_INSTITUTIONS.filter((i) => i.status === 'active')
                  .sort((a, b) => b.monthlySpend - a.monthlySpend)
                  .map((inst) => (
                    <tr key={inst.id}>
                      <td>
                        <div className={styles.instCell}>
                          <div className={styles.instAvatar} style={{ background: inst.color }}>
                            {inst.initials}
                          </div>
                          <span className={styles.instName}>{inst.name}</span>
                        </div>
                      </td>
                      <td>{inst.plan}</td>
                      <td className={styles.revenue}>${inst.monthlySpend.toLocaleString()}</td>
                      <td>
                        <span className={styles.statusActive}>Active</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Institutions Tab */}
      {activeTab === 'Institutions' && (
        <div className={styles.content}>
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <p className={styles.statBoxLabel}>Total Institutions</p>
              <p className={styles.statBoxValue}>{stats.institutions.total}</p>
            </div>
            <div className={styles.statBox}>
              <p className={styles.statBoxLabel}>Active</p>
              <p className={styles.statBoxValue} style={{ color: '#059669' }}>
                {stats.institutions.active}
              </p>
            </div>
            <div className={styles.statBox}>
              <p className={styles.statBoxLabel}>Suspended</p>
              <p className={styles.statBoxValue} style={{ color: '#dc2626' }}>
                {stats.institutions.suspended}
              </p>
            </div>
            <div className={styles.statBox}>
              <p className={styles.statBoxLabel}>Pending</p>
              <p className={styles.statBoxValue} style={{ color: '#f59e0b' }}>
                {stats.institutions.pending}
              </p>
            </div>
          </div>

          <div className={styles.chartSection}>
            <h3 className={styles.chartTitle}>Institution Growth</h3>
            <div className={styles.chart}>
              <div className={styles.chartGrid}>
                {REVENUE_DATA.map((item, idx) => (
                  <div key={idx} className={styles.chartBar}>
                    <div
                      className={styles.chartBarFill}
                      style={{ height: `${(item.institutions / 8) * 100}%`, background: '#4f46e5' }}
                    />
                    <span className={styles.chartValue}>{item.institutions}</span>
                    <span className={styles.chartLabel}>{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jobs & Lecturers Tab */}
      {activeTab === 'Jobs & Lecturers' && (
        <div className={styles.content}>
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <p className={styles.statBoxLabel}>Total Jobs</p>
              <p className={styles.statBoxValue}>{stats.jobs.total}</p>
            </div>
            <div className={styles.statBox}>
              <p className={styles.statBoxLabel}>Active</p>
              <p className={styles.statBoxValue} style={{ color: '#059669' }}>
                {stats.jobs.active}
              </p>
            </div>
            <div className={styles.statBox}>
              <p className={styles.statBoxLabel}>Filled</p>
              <p className={styles.statBoxValue} style={{ color: '#4f46e5' }}>
                {stats.jobs.filled}
              </p>
            </div>
            <div className={styles.statBox}>
              <p className={styles.statBoxLabel}>Total Lecturers</p>
              <p className={styles.statBoxValue}>{stats.lecturers.total}</p>
            </div>
          </div>

          <div className={styles.chartSection}>
            <h3 className={styles.chartTitle}>Jobs by Category</h3>
            <div className={styles.categoryList}>
              {JOB_CATEGORIES.map((cat, idx) => (
                <div key={idx} className={styles.categoryRow}>
                  <div className={styles.categoryInfo}>
                    <span className={styles.categoryName}>{cat.category}</span>
                    <span className={styles.categoryCount}>{cat.count} jobs</span>
                  </div>
                  <div className={styles.categoryBar}>
                    <div
                      className={styles.categoryBarFill}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <span className={styles.categoryPercent}>{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
