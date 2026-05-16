'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LecturerProfile.module.css';
import { lecturerService } from '@/app/lib/services/lecturerService';
import { shortlistService } from '@/app/lib/services/shortlistService';
import { hiredService }     from '@/app/lib/services/hiredService';
import { walletService }    from '@/app/lib/services/walletService';

const COMMISSION = 0.10; // 10% — must match backend REIMBURSEMENT_COMMISSION

export default function LecturerProfile({ id }) {
  const router   = useRouter();
  const [lecturer,     setLecturer]     = useState(null);
  const [hire,         setHire]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [shortlisting, setShortlisting] = useState(false);
  const [shortlisted,  setShortlisted]  = useState(false);
  const [toast,        setToast]        = useState('');
  const [payModal,      setPayModal]      = useState(false);
  const [payAmount,     setPayAmount]     = useState('');
  const [payDesc,       setPayDesc]       = useState('');
  const [paying,        setPaying]        = useState(false);
  const [payError,      setPayError]      = useState('');
  const [transactions,  setTransactions]  = useState([]);
  const [txLoading,     setTxLoading]     = useState(false);

  useEffect(() => {
    Promise.all([
      lecturerService.get(id).catch(() => null),
      hiredService.list().catch(() => []),
    ]).then(([lecData, hiredList]) => {
      setLecturer(lecData);
      const match = Array.isArray(hiredList)
        ? hiredList.find((h) => h.lecturerId === id || h.lecturer?.id === id)
        : null;
      setHire(match ?? null);
    }).finally(() => setLoading(false));

    // Fetch payment history for this lecturer
    setTxLoading(true);
    walletService.transactions({ lecturerId: id, category: 'reimbursement', pageSize: 50 })
      .then((data) => setTransactions(Array.isArray(data?.transactions) ? data.transactions : []))
      .catch(() => {})
      .finally(() => setTxLoading(false));
  }, [id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleShortlist = async () => {
    setShortlisting(true);
    try {
      await shortlistService.add({ lecturerId: id });
      setShortlisted(true);
      showToast('Added to shortlist');
    } catch {
      showToast('Already shortlisted or error occurred');
    } finally {
      setShortlisting(false);
    }
  };

  const gross      = parseFloat(payAmount) || 0;
  const commission = parseFloat((gross * COMMISSION).toFixed(2));
  const payout     = parseFloat((gross - commission).toFixed(2));

  const handlePay = async (e) => {
    e.preventDefault();
    if (!gross || gross <= 0) { setPayError('Enter a valid amount'); return; }
    setPayError('');
    setPaying(true);
    try {
      await walletService.reimburse(id, gross, hire?.currency || 'USD', payDesc || undefined);
      setPayModal(false);
      setPayAmount('');
      setPayDesc('');
      showToast(`Payment of ${hire?.currency ?? 'USD'} ${payout} sent to ${lecturer?.name}`);
    } catch (err) {
      setPayError(err?.message || 'Payment failed. Check your wallet balance.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.center}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!lecturer) {
    return (
      <div className={styles.center}>
        <p style={{ color: '#6b7280', marginBottom: 16 }}>Lecturer not found.</p>
        <button onClick={() => router.back()} className={styles.backLink}>← Go back</button>
      </div>
    );
  }

  // Normalise arrays
  const experience      = Array.isArray(lecturer.workExperience)  ? lecturer.workExperience  : [];
  const portfolio       = Array.isArray(lecturer.portfolio)        ? lecturer.portfolio        : [];
  const languages       = Array.isArray(lecturer.languages)        ? lecturer.languages        : [];
  const specializations = Array.isArray(lecturer.specializations)  ? lecturer.specializations  : [];

  const education = Array.isArray(lecturer.education) && lecturer.education.length > 0
    ? lecturer.education
    : lecturer.institutions
      ? [{ degree: lecturer.degrees, institution: lecturer.institutions, year: lecturer.graduationYears }]
      : [];

  const certifications = Array.isArray(lecturer.certifications) && lecturer.certifications.length > 0
    ? lecturer.certifications
    : lecturer.certificationsText
      ? lecturer.certificationsText.split(',').map((c) => c.trim()).filter(Boolean)
      : [];

  const docs = [
    { label: 'Resume / CV',        url: lecturer.resumeUrl,           name: lecturer.resumeFileName },
    { label: 'ID Document',        url: lecturer.idDocumentUrl,       name: lecturer.idDocumentFileName },
    { label: 'Certificate',        url: lecturer.certificateUrl,      name: lecturer.certificateFileName },
    { label: 'Transcript',         url: lecturer.transcriptUrl,       name: lecturer.transcriptFileName },
    { label: 'Professional Cert.', url: lecturer.professionalCertUrl, name: lecturer.professionalCertFileName },
  ].filter((d) => d.url);

  const rating     = parseFloat(lecturer.rating ?? 0);
  const ratingFull = Math.round(rating);
  const hourlyRate = parseFloat(lecturer.hourlyRate ?? 0);
  const isVerified = lecturer.approvalStatus === 'approved';

  return (
    <div className={styles.page}>

      {/* ── Toast ── */}
      {toast && <div className={styles.toast}>{toast}</div>}

      {/* ── Back ── */}
      <button className={styles.backLink} onClick={() => router.back()}>
        <BackIcon /> Back to Lecturers
      </button>

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroBanner} />

        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <div className={styles.avatarWrap}>
              {lecturer.avatarUrl ? (
                <img src={lecturer.avatarUrl} alt={lecturer.name} className={styles.avatarImg} />
              ) : (
                <div className={styles.avatarFallback} style={{ background: lecturer.color ?? '#4f46e5' }}>
                  {lecturer.initials ?? lecturer.name?.slice(0, 2).toUpperCase()}
                </div>
              )}
              {isVerified && <span className={styles.verifiedBadge} title="Verified"><VerifiedIcon /></span>}
            </div>
          </div>

          <div className={styles.heroBody}>
            <div className={styles.heroNameRow}>
              <h1 className={styles.heroName}>{lecturer.name}</h1>
              {lecturer.approvalStatus === 'approved' && (
                <span className={styles.statusPill} data-status="approved">Verified</span>
              )}
            </div>

            {lecturer.title && <p className={styles.heroSubtitle}>{lecturer.title}</p>}
            {lecturer.field  && <p className={styles.heroField}>{lecturer.field}</p>}

            {/* Key stats */}
            <div className={styles.statsRow}>
              {rating > 0 && (
                <div className={styles.stat}>
                  <StarRating rating={rating} />
                  <span className={styles.statSub}>{rating.toFixed(1)} ({lecturer.reviewCount ?? 0})</span>
                </div>
              )}
              {hourlyRate > 0 && (
                <div className={styles.stat}>
                  <span className={styles.statMain}>{lecturer.currency ?? 'USD'} {hourlyRate.toLocaleString()}/hr</span>
                  {lecturer.preferredMonthlyRate && (
                    <span className={styles.statSub}>· {lecturer.currency ?? 'USD'} {parseFloat(lecturer.preferredMonthlyRate).toLocaleString()}/mo</span>
                  )}
                </div>
              )}
              {(lecturer.yearsOfExperience ?? 0) > 0 && (
                <div className={styles.stat}>
                  <span className={styles.statMain}>{lecturer.yearsOfExperience} yrs</span>
                  <span className={styles.statSub}>experience</span>
                </div>
              )}
            </div>

            {/* Meta chips */}
            <div className={styles.metaRow}>
              {lecturer.country      && <MetaChip icon={<PinIcon />}      label={lecturer.country} />}
              {lecturer.qualification && <MetaChip icon={<GradIcon />}    label={lecturer.qualification} />}
              {lecturer.timezone     && <MetaChip icon={<ClockIcon />}    label={lecturer.timezone} />}
              {lecturer.availability && <MetaChip icon={<FlashIcon />}    label={lecturer.availability} />}
              {lecturer.nationality  && <MetaChip icon={<GlobeIcon />}    label={lecturer.nationality} />}
              {languages.length > 0  && <MetaChip icon={<LangIcon />}     label={languages.join(', ')} />}
            </div>

            {/* Specializations */}
            {specializations.length > 0 && (
              <div className={styles.specRow}>
                {specializations.map((s, i) => <span key={i} className={styles.specTag}>{s}</span>)}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className={styles.heroActions}>
            {hire ? (
              <div className={styles.hiredPill}>
                <HiredIcon /> Hired
              </div>
            ) : (
              <>
                <button
                  className={`${styles.actionBtn} ${shortlisted ? styles.actionBtnDone : ''}`}
                  onClick={handleShortlist}
                  disabled={shortlisting || shortlisted}
                >
                  <StarOutlineIcon />
                  {shortlisted ? 'Shortlisted' : shortlisting ? '...' : 'Shortlist'}
                </button>
                <a
                  href={`/dashboard/offers/new?lecturerId=${id}`}
                  className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                >
                  <SendIcon /> Make Offer
                </a>
              </>
            )}
            {lecturer.email && (
              <a href={`mailto:${lecturer.email}`} className={`${styles.actionBtn} ${styles.actionBtnGhost}`}>
                <MailIcon /> Email
              </a>
            )}
            {lecturer.linkedIn && (
              <a href={lecturer.linkedIn} target="_blank" rel="noopener noreferrer" className={`${styles.actionBtn} ${styles.actionBtnGhost}`}>
                <LinkedInIcon /> LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Engagement card (shown when hired) ── */}
      {hire && (
        <div className={styles.engagementCard}>
          <div className={styles.engagementHeader}>
            <div className={styles.engagementBadge}><HiredIcon /> Active Engagement</div>
            <span className={styles.engagementHiredDate}>Hired {fmtDate(hire.hiredAt)}</span>
          </div>

          <div className={styles.engagementGrid}>
            <EngageTerm label="Job / Role"      value={hire.job?.title} />
            <EngageTerm label="Contract Type"   value={hire.contractType?.replace(/_/g, ' ')} />
            <EngageTerm label="Agreed Rate"     value={`${hire.currency ?? 'USD'} ${parseFloat(hire.hourlyRate ?? 0).toFixed(2)}/hr`} highlight />
            <EngageTerm label="Start Date"      value={fmtDate(hire.startDate)} />
            <EngageTerm label="End Date"        value={fmtDate(hire.endDate)} />
            <EngageTerm label="Status"          value={hire.status}
              valueStyle={{ textTransform: 'capitalize', color: hire.status === 'active' ? '#059669' : '#6b7280', fontWeight: 700 }} />
            <EngageTerm label="Signed Docs"     value={`${(hire.signedDocumentIds ?? []).length} document${(hire.signedDocumentIds ?? []).length !== 1 ? 's' : ''}`} />
          </div>

          <div className={styles.engagementActions}>
            <button className={styles.payBtn} onClick={() => setPayModal(true)}>
              <PayIcon /> Pay Lecturer
            </button>
            <span className={styles.commissionNote}>10% platform fee applies</span>
          </div>
        </div>
      )}

      {/* ── Pay Lecturer modal ── */}
      {payModal && (
        <div className={styles.modalOverlay} onClick={() => !paying && setPayModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Pay {lecturer?.name}</h3>
                <p className={styles.modalSub}>10% platform commission is deducted automatically</p>
              </div>
              <button className={styles.modalClose} onClick={() => setPayModal(false)} disabled={paying}>✕</button>
            </div>

            <form onSubmit={handlePay} className={styles.modalBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Amount ({hire?.currency ?? 'USD'})</label>
                <input
                  type="number" min="1" step="any"
                  className={styles.fieldInput}
                  placeholder="e.g. 1000"
                  value={payAmount}
                  onChange={(e) => { setPayAmount(e.target.value); setPayError(''); }}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Description (optional)</label>
                <input
                  type="text"
                  className={styles.fieldInput}
                  placeholder="e.g. Monthly salary – June"
                  value={payDesc}
                  onChange={(e) => setPayDesc(e.target.value)}
                />
              </div>

              {/* Breakdown */}
              {gross > 0 && (
                <div className={styles.breakdown}>
                  <div className={styles.breakdownRow}>
                    <span>You pay</span>
                    <span className={styles.breakdownVal}>{hire?.currency ?? 'USD'} {gross.toFixed(2)}</span>
                  </div>
                  <div className={styles.breakdownRow}>
                    <span>Platform fee (10%)</span>
                    <span className={styles.breakdownFee}>− {hire?.currency ?? 'USD'} {commission.toFixed(2)}</span>
                  </div>
                  <div className={`${styles.breakdownRow} ${styles.breakdownTotal}`}>
                    <span>Lecturer receives</span>
                    <span className={styles.breakdownPayout}>{hire?.currency ?? 'USD'} {payout.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {payError && <p className={styles.payError}>{payError}</p>}

              <div className={styles.modalFooter}>
                <button type="submit" className={styles.payConfirmBtn} disabled={paying || !gross}>
                  {paying ? 'Sending…' : `Send ${hire?.currency ?? 'USD'} ${gross > 0 ? gross.toFixed(2) : '0.00'}`}
                </button>
                <button type="button" className={styles.modalCancelBtn} onClick={() => setPayModal(false)} disabled={paying}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className={styles.body}>

        {/* ── About ── */}
        {(lecturer.bio || specializations.length > 0) && (
          <Section title="About">
            {lecturer.bio && <p className={styles.bio}>{lecturer.bio}</p>}
          </Section>
        )}

        {/* ── Teaching Philosophy ── */}
        {lecturer.teachingPhilosophy && (
          <Section title="Teaching Philosophy">
            <blockquote className={styles.quote}>
              <QuoteIcon />
              <p>{lecturer.teachingPhilosophy}</p>
            </blockquote>
          </Section>
        )}

        {/* ── Work Experience ── */}
        {experience.length > 0 && (
          <Section title="Work Experience">
            <div className={styles.timeline}>
              {experience.map((exp, i) => (
                <div key={i} className={styles.timelineItem}>
                  <div className={styles.timelineLeft}>
                    <div className={styles.timelineDot} />
                    {i < experience.length - 1 && <div className={styles.timelineLine} />}
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.expHeader}>
                      <div>
                        <p className={styles.expRole}>{exp.role}</p>
                        <p className={styles.expOrg}>{exp.institution ?? 'Self-employed'}</p>
                      </div>
                      {exp.period && <span className={styles.expPeriod}>{exp.period}</span>}
                    </div>
                    {exp.description && <p className={styles.expDesc}>{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Education ── */}
        {education.length > 0 && (
          <Section title="Education">
            <div className={styles.eduList}>
              {education.map((edu, i) => (
                <div key={i} className={styles.eduItem}>
                  <div className={styles.eduIconWrap}><GradIcon /></div>
                  <div>
                    {edu.degree && <p className={styles.eduDegree}>{edu.degree}</p>}
                    <p className={styles.eduInstitution}>
                      {edu.institution}{edu.year ? ` · ${edu.year}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Honors & Awards ── */}
        {lecturer.honorsAwards && (
          <Section title="Honors & Awards">
            <p className={styles.bio}>{lecturer.honorsAwards}</p>
          </Section>
        )}

        {/* ── Certifications ── */}
        {certifications.length > 0 && (
          <Section title="Certifications">
            <div className={styles.certGrid}>
              {certifications.map((cert, i) => (
                <div key={i} className={styles.certItem}>
                  <span className={styles.certCheck}><CheckIcon /></span>
                  <span className={styles.certLabel}>{typeof cert === 'string' ? cert : cert.name}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Portfolio ── */}
        {portfolio.length > 0 && (
          <Section title="Portfolio & Publications">
            <div className={styles.portfolioGrid}>
              {portfolio.map((item, i) => (
                <div key={i} className={styles.portfolioCard}>
                  <span className={styles.portfolioType}>{item.type}</span>
                  <p className={styles.portfolioTitle}>{item.title}</p>
                  <div className={styles.portfolioFooter}>
                    <span className={styles.portfolioYear}>{item.year}</span>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.portfolioLink}>
                        View →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Documents ── */}
        {docs.length > 0 && (
          <Section title="Uploaded Documents">
            <div className={styles.docGrid}>
              {docs.map((doc) => (
                <a key={doc.label} href={doc.url} target="_blank" rel="noopener noreferrer" className={styles.docCard}>
                  <div className={styles.docIconWrap}><DocIcon /></div>
                  <div className={styles.docInfo}>
                    <p className={styles.docLabel}>{doc.label}</p>
                    {doc.name && <p className={styles.docName}>{doc.name}</p>}
                  </div>
                  <ExternalIcon />
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* ── Payment History ── */}
        {hire && (
          <Section title="Payment History">
            {txLoading ? (
              <div className={styles.txLoading}><div className={styles.spinner} /></div>
            ) : transactions.length === 0 ? (
              <p className={styles.txEmpty}>No payments made to this lecturer yet.</p>
            ) : (
              <div className={styles.txList}>
                {transactions.map((tx) => {
                  const gross      = parseFloat(tx.amount ?? 0);
                  const commission = parseFloat(tx.metadata?.commission ?? 0);
                  const payout     = parseFloat(tx.metadata?.payout ?? 0);
                  const isFailed   = tx.status === 'failed';
                  return (
                    <div key={tx.id} className={`${styles.txRow} ${isFailed ? styles.txRowFailed : ''}`}>
                      <div className={styles.txLeft}>
                        <div className={styles.txIconWrap}>
                          <PayIcon />
                        </div>
                        <div className={styles.txInfo}>
                          <p className={styles.txDesc}>{tx.description || 'Direct payment'}</p>
                          <p className={styles.txMeta}>
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            {commission > 0 && <> · Fee: {tx.metadata?.currency ?? 'USD'} {commission.toFixed(2)}</>}
                            {payout > 0 && <> · Lecturer got: {tx.metadata?.currency ?? 'USD'} {payout.toFixed(2)}</>}
                          </p>
                        </div>
                      </div>
                      <div className={styles.txRight}>
                        <span className={`${styles.txAmount} ${isFailed ? styles.txAmountFailed : ''}`}>
                          − {tx.currency ?? 'USD'} {gross.toFixed(2)}
                        </span>
                        {isFailed && <span className={styles.txFailedBadge}>Failed</span>}
                      </div>
                    </div>
                  );
                })}
                <div className={styles.txSummary}>
                  <span>Total paid</span>
                  <span className={styles.txSummaryVal}>
                    {transactions[0]?.currency ?? 'USD'} {transactions
                      .filter((t) => t.status !== 'failed')
                      .reduce((sum, t) => sum + parseFloat(t.amount ?? 0), 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </Section>
        )}

        {/* ── Contact ── */}
        <Section title="Contact & Details">
          <div className={styles.contactGrid}>
            {lecturer.email       && <ContactRow icon={<MailIcon />}   label="Email"       value={lecturer.email} href={`mailto:${lecturer.email}`} />}
            {lecturer.phone       && <ContactRow icon={<PhoneIcon />}  label="Phone"       value={lecturer.phone} href={`tel:${lecturer.phone}`} />}
            {lecturer.dateOfBirth && <ContactRow icon={<CalIcon />}    label="Date of Birth" value={lecturer.dateOfBirth} />}
            {lecturer.nationality && <ContactRow icon={<GlobeIcon />}  label="Nationality" value={lecturer.nationality} />}
            {lecturer.gender      && <ContactRow icon={<PersonIcon />} label="Gender"      value={lecturer.gender} />}
            {lecturer.field       && <ContactRow icon={<BookIcon />}   label="Field"       value={lecturer.field} />}
            {lecturer.linkedIn    && <ContactRow icon={<LinkedInIcon />} label="LinkedIn"  value="View Profile" href={lecturer.linkedIn} external />}
          </div>
        </Section>

      </div>
    </div>
  );
}

/* ── Sub-components ── */

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function EngageTerm({ label, value, highlight, valueStyle }) {
  if (!value) return null;
  return (
    <div className={styles.engageTerm}>
      <span className={styles.engageLabel}>{label}</span>
      <span className={styles.engageValue}
        style={{ color: highlight ? '#4f46e5' : undefined, fontWeight: highlight ? 800 : undefined, ...valueStyle }}>
        {value}
      </span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {children}
    </section>
  );
}

function MetaChip({ icon, label }) {
  if (!label) return null;
  return (
    <span className={styles.metaChip}>
      <span className={styles.metaChipIcon}>{icon}</span>
      {label}
    </span>
  );
}

function StarRating({ rating }) {
  const full = Math.round(parseFloat(rating ?? 0));
  return (
    <span className={styles.stars}>
      {[1,2,3,4,5].map((i) => (
        <span key={i} style={{ color: i <= full ? '#f59e0b' : '#d1d5db', fontSize: '0.9rem' }}>★</span>
      ))}
    </span>
  );
}

function ContactRow({ icon, label, value, href, external }) {
  const inner = (
    <>
      <span className={styles.contactIcon}>{icon}</span>
      <span className={styles.contactLabel}>{label}</span>
      <span className={styles.contactValue}>{value}</span>
    </>
  );
  if (href) {
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
        className={`${styles.contactRow} ${styles.contactRowLink}`}>
        {inner}
      </a>
    );
  }
  return <div className={styles.contactRow}>{inner}</div>;
}

/* ── Icons ── */
const s = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
const sm = { ...s, width: 12, height: 12 };

function HiredIcon()     { return <svg {...s} width="15" height="15"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }
function PayIcon()       { return <svg {...s} width="15" height="15"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>; }
function BackIcon()      { return <svg {...sm}><polyline points="15 18 9 12 15 6"/></svg>; }
function VerifiedIcon()  { return <svg {...s}  width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg>; }
function PinIcon()       { return <svg {...sm}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function GradIcon()      { return <svg {...sm}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>; }
function ClockIcon()     { return <svg {...sm}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function FlashIcon()     { return <svg {...sm}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>; }
function GlobeIcon()     { return <svg {...sm}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>; }
function LangIcon()      { return <svg {...sm}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>; }
function StarOutlineIcon(){ return <svg {...s} width="15" height="15"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function SendIcon()      { return <svg {...s} width="15" height="15"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>; }
function MailIcon()      { return <svg {...s} width="15" height="15"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
function LinkedInIcon()  { return <svg {...s} width="15" height="15"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>; }
function CheckIcon()     { return <svg {...sm}><polyline points="20 6 9 17 4 12"/></svg>; }
function DocIcon()       { return <svg {...s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>; }
function ExternalIcon()  { return <svg {...sm}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>; }
function PhoneIcon()     { return <svg {...sm}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>; }
function CalIcon()       { return <svg {...sm}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function PersonIcon()    { return <svg {...sm}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function BookIcon()      { return <svg {...sm}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>; }
function QuoteIcon()     { return <svg width="28" height="28" viewBox="0 0 24 24" fill="#ede9fe" stroke="none"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>; }
