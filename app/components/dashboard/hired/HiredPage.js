'use client';

import { useState, useEffect } from 'react';
import styles from './HiredPage.module.css';
import { hiredService } from '@/app/lib/services/hiredService';
import { walletService } from '@/app/lib/services/walletService';

const COMMISSION = 0.10;
const MONTH_LABEL = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

function isMonthly(contractType) {
  return (contractType ?? '').toLowerCase().includes('month');
}

const STATUS_META = {
  active:        { label: 'Active',        bg: '#d1fae5', color: '#059669' },
  starting_soon: { label: 'Starting Soon', bg: '#dbeafe', color: '#1d4ed8' },
  completed:     { label: 'Completed',     bg: '#f3f4f6', color: '#6b7280' },
};

function deriveStatus(hire) {
  if (hire.status === 'completed') return 'completed';
  const now = Date.now();
  if (hire.startDate && new Date(hire.startDate).getTime() > now) return 'starting_soon';
  if (hire.endDate && new Date(hire.endDate).getTime() < now) return 'completed';
  return hire.status ?? 'active';
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtRate(rate, currency) {
  const n = parseFloat(rate ?? 0);
  return `${currency ?? 'USD'} ${n.toFixed(2)}/hr`;
}

function Stars({ rating }) {
  const n = Math.round(parseFloat(rating ?? 0));
  return (
    <span className={styles.stars}>
      {[1,2,3,4,5].map((i) => (
        <span key={i} className={i <= n ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
      <span className={styles.ratingNum}>{parseFloat(rating ?? 0).toFixed(1)}</span>
    </span>
  );
}

export default function HiredPage() {
  const [hiredList, setHiredList] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  // payState keyed by hireId: { hours, paying, error, paid }
  const [payState, setPayState] = useState({});

  function setPay(hireId, patch) {
    setPayState((prev) => ({ ...prev, [hireId]: { hours: '', paying: false, error: null, paid: false, ...(prev[hireId] ?? {}), ...patch } }));
  }

  async function handlePay(hire) {
    const lec = hire.lecturer ?? {};
    const monthly = isMonthly(hire.contractType);
    const rate = parseFloat(hire.hourlyRate ?? 0);
    const hours = parseFloat(payState[hire.id]?.hours ?? 0);
    const gross = monthly ? rate : rate * hours;

    if (!gross || gross <= 0) {
      setPay(hire.id, { error: monthly ? 'Invalid rate.' : 'Enter valid hours.' });
      return;
    }

    const month = MONTH_LABEL;
    const desc = monthly
      ? `Monthly payment — ${month}`
      : `Hourly payment — ${hours} hrs @ ${hire.currency ?? 'USD'} ${rate.toFixed(2)}/hr — ${month}`;

    setPay(hire.id, { paying: true, error: null });
    try {
      await walletService.reimburse(lec.id, gross, hire.currency ?? 'USD', desc);
      setPay(hire.id, { paying: false, paid: true, hours: '' });
    } catch (err) {
      setPay(hire.id, { paying: false, error: err?.message ?? 'Payment failed. Check your wallet balance.' });
    }
  }

  useEffect(() => {
    hiredService.list()
      .then((data) => setHiredList(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active    = hiredList.filter((h) => deriveStatus(h) === 'active').length;
  const completed = hiredList.filter((h) => deriveStatus(h) === 'completed').length;

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* ── Summary bar ── */}
      <div className={styles.summary}>
        <SummaryCard num={hiredList.length} label="Total Hired"       icon={<PeopleIcon />} accent="#4f46e5" />
        <SummaryCard num={active}           label="Currently Active"  icon={<ActiveIcon />} accent="#059669" />
        <SummaryCard num={completed}        label="Completed"         icon={<CheckIcon />}  accent="#6b7280" />
      </div>

      {/* ── Empty state ── */}
      {hiredList.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}><PeopleIcon /></div>
          <p className={styles.emptyTitle}>No hired lecturers yet</p>
          <p className={styles.emptyNote}>Once a lecturer signs their contract, they will appear here.</p>
        </div>
      )}

      {/* ── Hired cards ── */}
      <div className={styles.list}>
        {hiredList.map((hire) => {
          const lec    = hire.lecturer ?? {};
          const job    = hire.job ?? {};
          const status = deriveStatus(hire);
          const sm     = STATUS_META[status] ?? STATUS_META.active;
          const isOpen = expanded === hire.id;
          const specs  = Array.isArray(lec.specializations) ? lec.specializations.slice(0, 3) : [];

          return (
            <div key={hire.id} className={`${styles.card} ${isOpen ? styles.cardOpen : ''}`}>

              {/* ── Header (click to expand) ── */}
              <div className={styles.cardHeader} onClick={() => setExpanded(isOpen ? null : hire.id)}>

                {/* Avatar */}
                {lec.avatarUrl ? (
                  <img src={lec.avatarUrl} alt={lec.name} className={styles.avatar} />
                ) : (
                  <div className={styles.avatarFallback} style={{ background: lec.color ?? '#4f46e5' }}>
                    {lec.initials ?? lec.name?.slice(0,2).toUpperCase() ?? '??'}
                  </div>
                )}

                {/* Main info */}
                <div className={styles.headerInfo}>
                  <div className={styles.nameRow}>
                    <h3 className={styles.lecName}>{lec.name ?? '—'}</h3>
                    <span className={styles.statusBadge} style={{ background: sm.bg, color: sm.color }}>
                      {sm.label}
                    </span>
                  </div>

                  <p className={styles.jobTitle}>{job.title ?? '—'}</p>

                  <div className={styles.metaRow}>
                    {lec.country && <Chip icon={<PinIcon />} label={lec.country} />}
                    {lec.qualification && <Chip icon={<GradIcon />} label={lec.qualification} />}
                    {lec.yearsOfExperience > 0 && <Chip icon={<BagIcon />} label={`${lec.yearsOfExperience} yrs`} />}
                    <Chip icon={<ContractIcon />} label={hire.contractType?.replace(/_/g, ' ')} />
                    <Chip icon={<RateIcon />} label={fmtRate(hire.hourlyRate, hire.currency)} bold />
                  </div>

                  {specs.length > 0 && (
                    <div className={styles.specRow}>
                      {specs.map((s, i) => <span key={i} className={styles.specChip}>{s}</span>)}
                    </div>
                  )}
                </div>

                {/* Right side */}
                <div className={styles.headerRight}>
                  {parseFloat(lec.rating ?? 0) > 0 && <Stars rating={lec.rating} />}
                  <div className={styles.docsBadge}>
                    <span className={styles.docsNum}>{(hire.signedDocumentIds ?? []).length}</span>
                    <span className={styles.docsLabel}>signed</span>
                  </div>
                  <ChevronIcon open={isOpen} />
                </div>
              </div>

              {/* ── Expanded body ── */}
              {isOpen && (
                <div className={styles.body}>

                  <div className={styles.bodyGrid}>

                    {/* Left: Lecturer profile */}
                    <section className={styles.section}>
                      <h4 className={styles.sectionTitle}>Lecturer Profile</h4>

                      {lec.bio && <p className={styles.bio}>{lec.bio}</p>}

                      <div className={styles.detailGrid}>
                        <Detail label="Field"       value={lec.field} />
                        <Detail label="Qualification" value={lec.qualification} />
                        <Detail label="Experience"  value={lec.yearsOfExperience ? `${lec.yearsOfExperience} years` : null} />
                        <Detail label="Country"     value={lec.country} />
                        <Detail label="Availability" value={lec.availability} />
                        <Detail label="Languages"   value={Array.isArray(lec.languages) ? lec.languages.join(', ') : lec.languages} />
                      </div>

                      <div className={styles.contactRow}>
                        {lec.email && (
                          <a href={`mailto:${lec.email}`} className={styles.contactLink}>
                            <MailIcon /> {lec.email}
                          </a>
                        )}
                        {lec.phone && (
                          <a href={`tel:${lec.phone}`} className={styles.contactLink}>
                            <PhoneIcon /> {lec.phone}
                          </a>
                        )}
                        {lec.linkedIn && (
                          <a href={lec.linkedIn} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                            <LinkedInIcon /> LinkedIn
                          </a>
                        )}
                      </div>

                      {Array.isArray(lec.specializations) && lec.specializations.length > 0 && (
                        <div className={styles.allSpecs}>
                          {lec.specializations.map((s, i) => (
                            <span key={i} className={styles.specChip}>{s}</span>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Right: Contract terms */}
                    <section className={styles.section}>
                      <h4 className={styles.sectionTitle}>Contract Terms</h4>
                      <div className={styles.termsGrid}>
                        <Term label="Start Date"     value={fmtDate(hire.startDate)} />
                        <Term label="End Date"       value={fmtDate(hire.endDate)} />
                        <Term label="Contract Type"  value={hire.contractType?.replace(/_/g, ' ')} />
                        <Term label="Rate"           value={fmtRate(hire.hourlyRate, hire.currency)} highlight />
                        <Term label="Currency"       value={hire.currency} />
                        <Term label="Status"         value={sm.label} valueStyle={{ color: sm.color, fontWeight: 700 }} />
                        <Term label="Hired Date"     value={fmtDate(hire.hiredAt)} />
                        <Term label="Signed Docs"    value={`${(hire.signedDocumentIds ?? []).length} document${(hire.signedDocumentIds ?? []).length !== 1 ? 's' : ''}`} />
                      </div>

                      {(hire.signedDocumentIds ?? []).length > 0 && (
                        <div className={styles.signedWrap}>
                          <h5 className={styles.signedTitle}>Signed Document IDs</h5>
                          <div className={styles.signedList}>
                            {hire.signedDocumentIds.map((sid, i) => (
                              <div key={sid} className={styles.signedIdRow}>
                                <span className={styles.signedCheck}>✓</span>
                                <span className={styles.signedId}>Document {i + 1}</span>
                                <span className={styles.signedIdVal}>{sid.slice(0, 16)}…</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  </div>

                  {/* ── Billing ── */}
                  {deriveStatus(hire) === 'active' && (() => {
                    const monthly = isMonthly(hire.contractType);
                    const rate = parseFloat(hire.hourlyRate ?? 0);
                    const ps = payState[hire.id] ?? {};
                    const hours = parseFloat(ps.hours ?? '') || 0;
                    const gross = monthly ? rate : rate * hours;
                    const commission = gross * COMMISSION;
                    const payout = gross - commission;

                    return (
                      <div className={styles.billing}>
                        <div className={styles.billingHeader}>
                          <BillIcon />
                          <h4 className={styles.billingTitle}>
                            {monthly ? `Monthly Bill — ${MONTH_LABEL}` : `Pay for Hours — ${MONTH_LABEL}`}
                          </h4>
                          {ps.paid && <span className={styles.billingPaid}>✓ Paid</span>}
                        </div>

                        {monthly ? (
                          <div className={styles.billingFixed}>
                            <span className={styles.billingFixedLabel}>Fixed monthly rate</span>
                            <span className={styles.billingFixedAmt}>{hire.currency ?? 'USD'} {rate.toFixed(2)}</span>
                          </div>
                        ) : (
                          <div className={styles.billingHours}>
                            <label className={styles.billingLabel}>Hours worked this month</label>
                            <div className={styles.billingHoursRow}>
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                placeholder="0"
                                className={styles.billingInput}
                                value={ps.hours ?? ''}
                                onChange={(e) => setPay(hire.id, { hours: e.target.value, paid: false })}
                              />
                              <span className={styles.billingHoursMeta}>× {hire.currency ?? 'USD'} {rate.toFixed(2)}/hr</span>
                            </div>
                          </div>
                        )}

                        {gross > 0 && (
                          <div className={styles.billingBreakdown}>
                            <div className={styles.billingRow}>
                              <span>Gross amount</span>
                              <span>{hire.currency ?? 'USD'} {gross.toFixed(2)}</span>
                            </div>
                            <div className={`${styles.billingRow} ${styles.billingFee}`}>
                              <span>Platform fee (10%)</span>
                              <span>− {hire.currency ?? 'USD'} {commission.toFixed(2)}</span>
                            </div>
                            <div className={`${styles.billingRow} ${styles.billingPayout}`}>
                              <span>Lecturer receives</span>
                              <span>{hire.currency ?? 'USD'} {payout.toFixed(2)}</span>
                            </div>
                          </div>
                        )}

                        {ps.error && <p className={styles.billingError}>{ps.error}</p>}

                        <button
                          className={styles.billingBtn}
                          onClick={() => handlePay(hire)}
                          disabled={ps.paying || ps.paid || (!monthly && hours <= 0)}
                        >
                          {ps.paying ? 'Processing…' : ps.paid ? '✓ Paid' : monthly ? `Pay ${hire.currency ?? 'USD'} ${rate.toFixed(2)}` : `Pay ${hire.currency ?? 'USD'} ${gross > 0 ? gross.toFixed(2) : '—'}`}
                        </button>
                      </div>
                    );
                  })()}

                  {/* Actions */}
                  <div className={styles.actions}>
                    <a href={`/dashboard/lecturers/${lec.id}`} className={styles.actionBtn}>
                      <PersonIcon /> View Profile
                    </a>
                    <a href={`mailto:${lec.email}`} className={`${styles.actionBtn} ${styles.actionBtnGhost}`}>
                      <MailIcon /> Send Email
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Small sub-components ── */

function SummaryCard({ num, label, icon, accent }) {
  return (
    <div className={styles.summaryCard}>
      <div className={styles.summaryIcon} style={{ color: accent, background: `${accent}18` }}>{icon}</div>
      <div>
        <p className={styles.summaryNum} style={{ color: accent }}>{num}</p>
        <p className={styles.summaryLabel}>{label}</p>
      </div>
    </div>
  );
}

function Chip({ icon, label, bold }) {
  if (!label) return null;
  return (
    <span className={styles.chip} style={bold ? { color: '#111827', fontWeight: 700 } : {}}>
      <span className={styles.chipIcon}>{icon}</span>
      {label}
    </span>
  );
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  );
}

function Term({ label, value, highlight, valueStyle }) {
  if (!value) return null;
  return (
    <div className={styles.termItem}>
      <span className={styles.termLabel}>{label}</span>
      <span className={styles.termValue} style={{ color: highlight ? '#4f46e5' : undefined, fontWeight: highlight ? 700 : undefined, ...valueStyle }}>
        {value}
      </span>
    </div>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', color: '#9ca3af', flexShrink: 0 }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function PeopleIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
}
function ActiveIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function CheckIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function PinIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function GradIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
}
function BagIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
}
function ContractIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>;
}
function RateIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
}
function MailIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}
function PhoneIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
}
function LinkedInIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
}
function PersonIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function BillIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
}
