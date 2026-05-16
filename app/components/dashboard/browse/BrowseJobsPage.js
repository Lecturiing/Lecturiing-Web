'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './BrowseJobsPage.module.css';
import { lecturerService } from '@/app/lib/services/lecturerService';
import { applicationService } from '@/app/lib/services/applicationService';
import { subscriptionService } from '@/app/lib/services/subscriptionService';

const PLAN_COLORS = {
  free: null,
  premium: { bg: '#fef3c7', color: '#d97706', label: 'Premium' },
  pro: { bg: '#ede9fe', color: '#7c3aed', label: 'Pro' },
};

const TABS = ['All', 'Free', 'Premium', 'Pro', 'Saved'];

export default function BrowseJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [lecPlan, setLecPlan] = useState('free');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [applying, setApplying] = useState(null);
  const [applyError, setApplyError] = useState({});
  const [applyDone, setApplyDone] = useState({});
  const [savingJob, setSavingJob] = useState(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const data = await lecturerService.browseJobs({ ...params, pageSize: 100 });
      setJobs(data?.jobs ?? []);
      setLecPlan(data?.lecPlan ?? 'free');
    } catch (_) {}
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    lecturerService.getSavedJobs()
      .then((data) => setSavedJobs(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const savedIds = new Set(savedJobs.map((j) => j.id));

  const filtered = jobs.filter((j) => {
    if (tab === 'Saved') return savedIds.has(j.id);
    if (tab === 'Free') return (j.tier ?? 'free') === 'free';
    if (tab === 'Premium') return j.tier === 'premium';
    if (tab === 'Pro') return j.tier === 'pro';
    return true;
  });

  async function handleApply(job) {
    if (applying) return;
    setApplyError((p) => ({ ...p, [job.id]: null }));
    setApplying(job.id);
    try {
      await applicationService.apply({ jobId: job.id });
      setApplyDone((p) => ({ ...p, [job.id]: true }));
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to apply';
      setApplyError((p) => ({ ...p, [job.id]: msg }));
    }
    setApplying(null);
  }

  async function handleSave(job) {
    if (savingJob) return;
    setSavingJob(job.id);
    try {
      if (savedIds.has(job.id)) {
        await lecturerService.unsaveJob(job.id);
        setSavedJobs((prev) => prev.filter((j) => j.id !== job.id));
      } else {
        await lecturerService.saveJob(job.id);
        setSavedJobs((prev) => [...prev, job]);
      }
    } catch (err) {
      const msg = err?.response?.data?.message ?? '';
      if (msg) setApplyError((p) => ({ ...p, [`save_${job.id}`]: msg }));
    }
    setSavingJob(null);
  }

  async function handleUpgrade(plan) {
    setUpgradeLoading(true);
    try {
      const result = await subscriptionService.upgrade(plan);
      if (result?.paymentLink) window.location.href = result.paymentLink;
    } catch (_) {}
    setUpgradeLoading(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <input
          className={styles.search}
          placeholder="Search jobs by title, field, or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <PlanBadge plan={lecPlan} />
      </div>

      {lecPlan === 'free' && (
        <div className={styles.upgradeBanner}>
          <span>Upgrade to <strong>Premium</strong> or <strong>Pro</strong> to unlock more jobs and features.</span>
          <div className={styles.upgradeBtns}>
            <button className={styles.upgradeBtn} onClick={() => handleUpgrade('premium')} disabled={upgradeLoading}>
              Premium — $20/mo
            </button>
            <button className={`${styles.upgradeBtn} ${styles.upgradeBtnPro}`} onClick={() => handleUpgrade('pro')} disabled={upgradeLoading}>
              Pro — $50/mo
            </button>
          </div>
        </div>
      )}

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
            {t === 'Saved' && <span className={styles.tabCount}>{savedIds.size}</span>}
          </button>
        ))}
      </div>

      {loading && <p className={styles.empty}>Loading jobs…</p>}
      {!loading && filtered.length === 0 && <p className={styles.empty}>No jobs found.</p>}

      <div className={styles.list}>
        {filtered.map((job) => {
          const tier = job.tier ?? 'free';
          const locked = job.locked;
          const tierStyle = PLAN_COLORS[tier];
          const isSaved = savedIds.has(job.id);
          const saveErr = applyError[`save_${job.id}`];

          return (
            <div key={job.id} className={`${styles.jobCard} ${locked ? styles.jobCardLocked : ''}`}>
              <div className={styles.jobTop}>
                <div className={styles.jobIconWrap} style={{ opacity: locked ? 0.4 : 1 }}>
                  <BriefcaseIcon />
                </div>
                <div className={styles.jobMain}>
                  <div className={styles.jobTitleRow}>
                    <h3 className={styles.jobTitle} style={{ opacity: locked ? 0.5 : 1 }}>{job.title}</h3>
                    {tierStyle && (
                      <span className={styles.tierBadge} style={{ background: tierStyle.bg, color: tierStyle.color }}>
                        {tierStyle.label}
                      </span>
                    )}
                  </div>
                  <div className={styles.jobMeta}>
                    {job.institution && <span>{job.institution.name}</span>}
                    {job.institution && <span>·</span>}
                    <span>{job.field}</span>
                    <span>·</span>
                    <span>{job.contractType}</span>
                    {job.budgetMin > 0 && (
                      <>
                        <span>·</span>
                        <span className={styles.budget}>${job.budgetMin}–${job.budgetMax}</span>
                      </>
                    )}
                    {job.deadline && (
                      <>
                        <span>·</span>
                        <span>Closes {new Date(job.deadline).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                  {!locked && (
                    <p className={styles.jobDesc}>{(job.description ?? '').slice(0, 120)}{job.description?.length > 120 ? '…' : ''}</p>
                  )}
                </div>
              </div>

              {locked ? (
                <div className={styles.lockedOverlay}>
                  <LockIcon />
                  <p className={styles.lockedMsg}>
                    This job requires a <strong>{tier}</strong> plan.
                  </p>
                  <button
                    className={styles.unlockBtn}
                    onClick={() => handleUpgrade(tier)}
                    disabled={upgradeLoading}
                  >
                    Upgrade to {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </button>
                </div>
              ) : (
                <div className={styles.jobActions}>
                  <button
                    className={`${styles.saveBtn} ${isSaved ? styles.saveBtnActive : ''}`}
                    onClick={() => handleSave(job)}
                    disabled={savingJob === job.id}
                    title={isSaved ? 'Unsave job' : 'Save job'}
                  >
                    <BookmarkIcon filled={isSaved} />
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                  {saveErr && <p className={styles.applyError}>{saveErr}</p>}
                  {applyDone[job.id] ? (
                    <span className={styles.appliedBadge}>Applied</span>
                  ) : (
                    <button
                      className={styles.applyBtn}
                      onClick={() => handleApply(job)}
                      disabled={applying === job.id}
                    >
                      {applying === job.id ? 'Applying…' : 'Apply'}
                    </button>
                  )}
                  {applyError[job.id] && <p className={styles.applyError}>{applyError[job.id]}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlanBadge({ plan }) {
  const map = {
    free: { label: 'Free Plan', bg: '#f3f4f6', color: '#6b7280' },
    premium: { label: 'Premium', bg: '#fef3c7', color: '#d97706' },
    pro: { label: 'Pro', bg: '#ede9fe', color: '#7c3aed' },
  };
  const s = map[plan] ?? map.free;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

function BriefcaseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
}

function LockIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
}

function BookmarkIcon({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
    </svg>
  );
}
