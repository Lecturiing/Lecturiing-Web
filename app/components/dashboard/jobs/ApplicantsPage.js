'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './ApplicantsPage.module.css';
import { jobService } from '@/app/lib/services/jobService';
import { applicationService } from '@/app/lib/services/applicationService';
import { lecturerService } from '@/app/lib/services/lecturerService';
import { documentService } from '@/app/lib/services/documentService';

const STATUS_TABS = ['All', 'Pending', 'Shortlisted', 'Interview', 'Declined', 'Offer Sent', 'Hired'];

const STATUS_META = {
  pending:              { label: 'Pending',          bg: '#f3f4f6', color: '#6b7280' },
  shortlisted:          { label: 'Shortlisted',      bg: '#ede9fe', color: '#4f46e5' },
  interview_scheduled:  { label: 'Interview',        bg: '#dbeafe', color: '#1d4ed8' },
  declined:             { label: 'Declined',         bg: '#fee2e2', color: '#dc2626' },
  offer_sent:           { label: 'Offer Sent',       bg: '#d1fae5', color: '#059669' },
  offer_accepted:       { label: 'Offer Accepted',   bg: '#ecfdf5', color: '#047857' },
  hired:                { label: 'Hired',            bg: '#fef3c7', color: '#92400e' },
};

const TAB_STATUS_MAP = {
  All: null,
  Pending: 'pending',
  Shortlisted: 'shortlisted',
  Interview: 'interview_scheduled',
  Declined: 'declined',
  'Offer Sent': ['offer_sent', 'offer_accepted'],
  Hired: 'hired',
};

const CURRENCIES = ['USD', 'GBP', 'EUR', 'NGN', 'ZAR', 'GHS', 'KES'];

export default function ApplicantsPage({ jobId }) {
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [tab, setTab] = useState('All');
  const [selected, setSelected] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState('about');

  // Interview modal
  const [interviewModal, setInterviewModal] = useState(null); // app object
  const [meetingType, setMeetingType] = useState('meet'); // 'meet' | 'calendly' | 'custom'
  const [meetingLink, setMeetingLink] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewLoading, setInterviewLoading] = useState(false);

  // Offer document modal
  const [offerModal, setOfferModal] = useState(null); // app object
  const [availableDocs, setAvailableDocs] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [offerLoading, setOfferLoading] = useState(false);
  // Offer details form
  const [offerRate, setOfferRate] = useState('');
  const [offerCurrency, setOfferCurrency] = useState('USD');
  const [offerContractType, setOfferContractType] = useState('');
  const [offerStartDate, setOfferStartDate] = useState('');
  const [offerNotes, setOfferNotes] = useState('');

  useEffect(() => {
    jobService.get(jobId).then((data) => setJob(data)).catch(() => {});
    jobService.getApplicants(jobId)
      .then((data) => setApplicants(Array.isArray(data) ? data : (data?.applications ?? data?.applicants ?? [])))
      .catch(() => {});
  }, [jobId]);

  useEffect(() => {
    if (!selected) { setSelectedDetails(null); return; }
    const lecturerId = selected.lecturerId ?? selected.lecturer?.id;
    if (!lecturerId) return;
    setDetailsLoading(true);
    setSelectedDetails(null);
    lecturerService.get(lecturerId)
      .then((data) => setSelectedDetails(data))
      .catch(() => setSelectedDetails(null))
      .finally(() => setDetailsLoading(false));
  }, [selected]);

  const filtered = applicants.filter((a) => {
    const statusFilter = TAB_STATUS_MAP[tab];
    if (statusFilter === null) return true;
    if (Array.isArray(statusFilter)) return statusFilter.includes(a.status);
    return a.status === statusFilter;
  });

  const counts = STATUS_TABS.reduce((acc, t) => {
    const s = TAB_STATUS_MAP[t];
    if (s === null) { acc[t] = applicants.length; }
    else if (Array.isArray(s)) { acc[t] = applicants.filter((a) => s.includes(a.status)).length; }
    else { acc[t] = applicants.filter((a) => a.status === s).length; }
    return acc;
  }, {});

  const updateStatus = async (appId, newStatus, extra = {}) => {
    try { await applicationService.updateStatus(appId, newStatus, extra); } catch (_) {}
    setApplicants((prev) => prev.map((a) => a.id === appId ? { ...a, status: newStatus, ...extra } : a));
    if (selected?.id === appId) setSelected((s) => ({ ...s, status: newStatus, ...extra }));
  };

  const openInterviewModal = (app) => {
    setInterviewModal(app);
    setMeetingType('meet');
    setMeetingLink('');
    setInterviewDate('');
  };

  const confirmInterview = async () => {
    if (!interviewModal || !meetingLink) return;
    setInterviewLoading(true);
    await updateStatus(interviewModal.id, 'interview_scheduled', { meetingLink, interviewDate: interviewDate || undefined });
    setInterviewLoading(false);
    setInterviewModal(null);
    if (selected?.id === interviewModal.id) setSelected(null);
  };

  const openOfferModal = (app) => {
    setOfferModal(app);
    setSelectedDocs([]);
    setOfferRate('');
    setOfferCurrency('USD');
    setOfferContractType('');
    setOfferStartDate('');
    setOfferNotes('');
    if (availableDocs.length === 0) {
      documentService.list().then((d) => setAvailableDocs(Array.isArray(d) ? d : (d?.documents ?? []))).catch(() => {});
    }
  };

  const confirmOffer = async () => {
    if (!offerModal || !offerRate) return;
    setOfferLoading(true);
    const offerDetails = {
      rate: offerRate,
      currency: offerCurrency,
      contractType: offerContractType || undefined,
      startDate: offerStartDate || undefined,
      notes: offerNotes || undefined,
    };
    await updateStatus(offerModal.id, 'offer_sent', { documentIds: selectedDocs, offerDetails });
    setOfferLoading(false);
    setOfferModal(null);
    if (selected?.id === offerModal.id) setSelected(null);
  };

  return (
    <div className={styles.page}>
      {/* ── Breadcrumb ── */}
      <div className={styles.breadcrumb}>
        <Link href="/dashboard/jobs" className={styles.breadcrumbLink}>Job Postings</Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span className={styles.breadcrumbCurrent}>{job?.title ?? '…'}</span>
        <span className={styles.breadcrumbSep}>›</span>
        <span className={styles.breadcrumbCurrent}>Applicants</span>
      </div>

      {/* ── Job Summary ── */}
      {job && (
        <div className={styles.jobSummary}>
          <div>
            <h1 className={styles.jobTitle}>{job.title}</h1>
            <div className={styles.jobMeta}>
              <span>{job.field}</span><span>·</span>
              <span>{job.contractType}</span><span>·</span>
              <span>{job.duration}</span><span>·</span>
              <span className={styles.budget}>${job.budgetMin}–${job.budgetMax}/mo</span>
            </div>
          </div>
          <div className={styles.totalBadge}>{applicants.length} Applicants</div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
            <span className={styles.tabCount}>{counts[t]}</span>
          </button>
        ))}
      </div>

      {/* ── List ── */}
      <div className={styles.list}>
        {filtered.length === 0 && (
          <p className={styles.empty}>No applicants in this category.</p>
        )}
        {filtered.map((app) => {
          const lec = app.lecturer ?? app;
          if (!lec) return null;
          const sm = STATUS_META[app.status] ?? STATUS_META.pending;

          return (
            <div key={app.id} className={`${styles.row} ${app.status === 'declined' ? styles.rowDeclined : ''}`}>
              <div className={styles.rowLeft} onClick={() => setSelected(app)}>
                <div className={styles.avatar} style={{ background: lec.avatarColor ?? lec.color }}>{lec.initials}</div>
                <div className={styles.rowInfo}>
                  <p className={styles.rowName}>{lec.name}</p>
                  <p className={styles.rowTitle}>{lec.title}</p>
                  <div className={styles.rowMeta}>
                    <span>{lec.country}</span>
                    <span>·</span>
                    <span>{lec.qualification}</span>
                    <span>·</span>
                    <span>★ {lec.rating}</span>
                    <span>·</span>
                    <span>${lec.hourlyRate ?? lec.rate}/hr</span>
                  </div>
                </div>
              </div>

              <div className={styles.rowRight}>
                <span className={styles.statusBadge} style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
                <span className={styles.appliedDate}>Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}</span>
                {app.interviewDate && (
                  <span className={styles.interviewDate}>
                    📅 {new Date(app.interviewDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                )}
                <div className={styles.actions}>
                  <button className={styles.viewBtn} onClick={() => setSelected(app)}>View</button>
                  {app.status === 'pending' && (
                    <>
                      <button className={styles.shortlistBtn} onClick={() => updateStatus(app.id, 'shortlisted')}>Shortlist</button>
                      <button className={styles.declineBtn} onClick={() => updateStatus(app.id, 'declined')}>Decline</button>
                    </>
                  )}
                  {app.status === 'shortlisted' && (
                    <>
                      <button className={styles.interviewBtn} onClick={() => openInterviewModal(app)}>Schedule Interview</button>
                      <button className={styles.declineBtn} onClick={() => updateStatus(app.id, 'declined')}>Decline</button>
                    </>
                  )}
                  {app.status === 'interview_scheduled' && (
                    <button className={styles.offerBtn} onClick={() => openOfferModal(app)}>Send Offer</button>
                  )}
                  {app.status === 'declined' && (
                    <button className={styles.restoreBtn} onClick={() => updateStatus(app.id, 'pending')}>Restore</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Interview Modal ── */}
      {interviewModal && (
        <div className={styles.modalOverlay} onClick={() => setInterviewModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Schedule Interview</h3>
              <button className={styles.modalClose} onClick={() => setInterviewModal(null)}>✕</button>
            </div>
            <p className={styles.modalSub}>
              Scheduling with <strong>{(interviewModal.lecturer ?? interviewModal).name}</strong> for <em>{job?.title}</em>
            </p>

            <div className={styles.meetingTypeTabs}>
              {[['meet', 'Google Meet'], ['calendly', 'Calendly'], ['custom', 'Custom Link']].map(([k, label]) => (
                <button
                  key={k}
                  className={`${styles.meetingTypeBtn} ${meetingType === k ? styles.meetingTypeActive : ''}`}
                  onClick={() => { setMeetingType(k); setMeetingLink(''); }}
                >
                  {label}
                </button>
              ))}
            </div>

            {meetingType === 'meet' && (
              <div className={styles.meetingNote}>
                <p>Create a Google Meet link and paste it below.</p>
                <a href="https://meet.google.com/new" target="_blank" rel="noreferrer" className={styles.meetingExternalLink}>
                  Open Google Meet →
                </a>
              </div>
            )}
            {meetingType === 'calendly' && (
              <div className={styles.meetingNote}>
                <p>Paste your Calendly event link below. The lecturer can pick a time that suits them.</p>
                <a href="https://calendly.com" target="_blank" rel="noreferrer" className={styles.meetingExternalLink}>
                  Open Calendly →
                </a>
              </div>
            )}

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Meeting Link *</label>
              <input
                className={styles.modalInput}
                placeholder={meetingType === 'meet' ? 'https://meet.google.com/abc-defg-hij' : meetingType === 'calendly' ? 'https://calendly.com/your-name/30min' : 'https://...'}
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Interview Date & Time (optional)</label>
              <input
                type="datetime-local"
                className={styles.modalInput}
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
              />
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.modalCancel} onClick={() => setInterviewModal(null)}>Cancel</button>
              <button
                className={styles.interviewBtn}
                disabled={!meetingLink || interviewLoading}
                onClick={confirmInterview}
              >
                {interviewLoading ? 'Sending…' : 'Schedule & Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Offer Modal ── */}
      {offerModal && (
        <div className={styles.modalOverlay} onClick={() => setOfferModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Send Offer</h3>
              <button className={styles.modalClose} onClick={() => setOfferModal(null)}>✕</button>
            </div>
            <p className={styles.modalSub}>
              Offering <strong>{(offerModal.lecturer ?? offerModal).name}</strong> the <em>{job?.title}</em> position
            </p>

            {/* ── Offer Details ── */}
            <div className={styles.modalSection}>
              <p className={styles.modalSectionTitle}>Offer Details *</p>
              <div className={styles.offerRateRow}>
                <div className={styles.offerRateField}>
                  <label className={styles.modalLabel}>Monthly Rate *</label>
                  <input
                    className={styles.modalInput}
                    type="number"
                    placeholder="e.g. 3000"
                    value={offerRate}
                    onChange={(e) => setOfferRate(e.target.value)}
                  />
                </div>
                <div className={styles.offerCurrencyField}>
                  <label className={styles.modalLabel}>Currency</label>
                  <select className={styles.modalInput} value={offerCurrency} onChange={(e) => setOfferCurrency(e.target.value)}>
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Contract Type</label>
                <select className={styles.modalInput} value={offerContractType} onChange={(e) => setOfferContractType(e.target.value)}>
                  <option value="">Select…</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Adjunct">Adjunct</option>
                  <option value="Visiting">Visiting</option>
                </select>
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Proposed Start Date</label>
                <input type="date" className={styles.modalInput} value={offerStartDate} onChange={(e) => setOfferStartDate(e.target.value)} />
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Additional Notes</label>
                <textarea
                  className={styles.modalInput}
                  rows={3}
                  placeholder="Any additional terms, conditions, or information…"
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                />
              </div>
            </div>

            {/* ── Documents ── */}
            <div className={styles.modalSection}>
              <p className={styles.modalSectionTitle}>Contract Documents to Sign (optional)</p>
              {availableDocs.length === 0 && (
                <p className={styles.modalEmpty}>No documents in your Doc Library yet.</p>
              )}
              {availableDocs.map((doc) => (
                <label key={doc.id} className={`${styles.modalDocRow} ${selectedDocs.includes(doc.id) ? styles.modalDocSelected : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc.id)}
                    onChange={() => setSelectedDocs((prev) => prev.includes(doc.id) ? prev.filter((d) => d !== doc.id) : [...prev, doc.id])}
                    className={styles.modalCheckbox}
                  />
                  <div>
                    <p className={styles.modalDocTitle}>{doc.title ?? doc.fileName}</p>
                    {doc.category && <p className={styles.modalDocMeta}>{doc.category}</p>}
                  </div>
                </label>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.modalCancel} onClick={() => setOfferModal(null)}>Cancel</button>
              <button className={styles.offerBtn} disabled={offerLoading || !offerRate} onClick={confirmOffer}>
                {offerLoading ? 'Sending…' : 'Send Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile Drawer ── */}
      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerTopBar}>
              <button className={styles.drawerClose} onClick={() => setSelected(null)}>✕</button>
              <button
                className={styles.drawerExpand}
                title="View full profile"
                onClick={() => router.push(`/dashboard/lecturers/${selected.lecturerId ?? selected.lecturer?.id}`)}
              >
                <ExpandIcon />
              </button>
            </div>

            {(() => {
              const lec = selectedDetails ?? selected.lecturer ?? selected ?? {};
              const sm = STATUS_META[selected.status] ?? STATUS_META.pending;

              // Normalise data — same logic as LecturerProfile
              const experience = Array.isArray(lec.workExperience) ? lec.workExperience : [];
              const portfolio   = Array.isArray(lec.portfolio)     ? lec.portfolio     : [];
              const education   = Array.isArray(lec.education) && lec.education.length > 0
                ? lec.education
                : lec.institutions
                  ? [{ degree: lec.degrees, institution: lec.institutions, year: lec.graduationYears }]
                  : [];
              const certifications = Array.isArray(lec.certifications) && lec.certifications.length > 0
                ? lec.certifications
                : lec.certificationsText
                  ? lec.certificationsText.split(',').map((c) => c.trim()).filter(Boolean)
                  : [];
              const specializations = Array.isArray(lec.specializations) ? lec.specializations : [];

              return (
                <>
                  {/* Avatar */}
                  {lec.avatarUrl ? (
                    <img src={lec.avatarUrl} alt={lec.name} className={styles.drawerAvatarImg} />
                  ) : (
                    <div className={styles.drawerAvatar} style={{ background: lec.color ?? '#4f46e5' }}>{lec.initials}</div>
                  )}

                  {/* Name + status */}
                  <div className={styles.drawerHeader}>
                    <div>
                      <h2 className={styles.drawerName}>{lec.name}</h2>
                      {lec.title && <p className={styles.drawerTitle}>{lec.title}</p>}
                    </div>
                    <span className={styles.drawerStatus} style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
                  </div>

                  {/* Meta chips */}
                  <div className={styles.drawerMeta}>
                    {lec.country        && <span>📍 {lec.country}</span>}
                    {lec.timezone       && <span>🕐 {lec.timezone}</span>}
                    {lec.qualification  && <span>🎓 {lec.qualification}</span>}
                    {lec.yearsOfExperience != null && <span>⏱ {lec.yearsOfExperience} yrs</span>}
                    {lec.hourlyRate     && <span>💰 ${lec.hourlyRate}/hr</span>}
                    {lec.gender         && <span>👤 {lec.gender}</span>}
                    {lec.nationality    && <span>🌐 {lec.nationality}</span>}
                  </div>

                  {detailsLoading && <p className={styles.drawerLoading}>Loading profile…</p>}

                  {/* About */}
                  {(lec.bio || specializations.length > 0) && (
                    <DrawerSection
                      title="About"
                      open={expandedSection === 'about'}
                      onToggle={() => setExpandedSection(expandedSection === 'about' ? null : 'about')}
                    >
                      {lec.bio && <p className={styles.drawerBio}>{lec.bio}</p>}
                      {specializations.length > 0 && (
                        <div className={styles.drawerTags}>
                          {specializations.map((s) => <span key={s} className={styles.tag}>{s}</span>)}
                        </div>
                      )}
                    </DrawerSection>
                  )}

                  {/* Education */}
                  {education.length > 0 && (
                    <DrawerSection
                      title="Education"
                      open={expandedSection === 'edu'}
                      onToggle={() => setExpandedSection(expandedSection === 'edu' ? null : 'edu')}
                    >
                      {education.map((e, i) => (
                        <div key={i} className={styles.eduItem}>
                          {e.degree && <p className={styles.eduDeg}>{e.degree}</p>}
                          <p className={styles.eduInst}>{e.institution}{e.year ? ` · ${e.year}` : ''}</p>
                        </div>
                      ))}
                    </DrawerSection>
                  )}

                  {/* Experience */}
                  {experience.length > 0 && (
                    <DrawerSection
                      title="Experience"
                      open={expandedSection === 'exp'}
                      onToggle={() => setExpandedSection(expandedSection === 'exp' ? null : 'exp')}
                    >
                      {experience.map((e, i) => (
                        <div key={i} className={styles.expItem}>
                          <p className={styles.expRole}>{e.role}</p>
                          <p className={styles.expInst}>{e.institution || 'Self-employed'}{e.period ? ` · ${e.period}` : ''}</p>
                          {e.description && <p className={styles.expDesc}>{e.description}</p>}
                        </div>
                      ))}
                    </DrawerSection>
                  )}

                  {/* Certifications */}
                  {certifications.length > 0 && (
                    <DrawerSection
                      title="Certifications"
                      open={expandedSection === 'cert'}
                      onToggle={() => setExpandedSection(expandedSection === 'cert' ? null : 'cert')}
                    >
                      <div className={styles.drawerTags}>
                        {certifications.map((c, i) => (
                          <span key={i} className={styles.tag}>{typeof c === 'string' ? c : c.name}</span>
                        ))}
                      </div>
                    </DrawerSection>
                  )}

                  {/* Honors */}
                  {lec.honorsAwards && (
                    <DrawerSection
                      title="Honors & Awards"
                      open={expandedSection === 'honors'}
                      onToggle={() => setExpandedSection(expandedSection === 'honors' ? null : 'honors')}
                    >
                      <p className={styles.drawerBio}>{lec.honorsAwards}</p>
                    </DrawerSection>
                  )}

                  {/* Portfolio */}
                  {portfolio.length > 0 && (
                    <DrawerSection
                      title="Portfolio"
                      open={expandedSection === 'port'}
                      onToggle={() => setExpandedSection(expandedSection === 'port' ? null : 'port')}
                    >
                      {portfolio.map((p, i) => (
                        <div key={i} className={styles.portItem}>
                          <span className={styles.portType}>{p.type}</span>
                          <p className={styles.portTitle}>{p.title}</p>
                          <span className={styles.portYear}>{p.year}</span>
                        </div>
                      ))}
                    </DrawerSection>
                  )}

                  {/* Application Details */}
                  {(selected.coverNote || selected.phone || selected.qualification || selected.availability || selected.cvUrl) && (
                    <DrawerSection
                      title="Application Details"
                      open={expandedSection === 'appdetails'}
                      onToggle={() => setExpandedSection(expandedSection === 'appdetails' ? null : 'appdetails')}
                    >
                      {selected.phone && (
                        <div className={styles.appDetailRow}>
                          <span className={styles.appDetailLabel}>Phone</span>
                          <span className={styles.appDetailValue}>{selected.phone}</span>
                        </div>
                      )}
                      {selected.qualification && (
                        <div className={styles.appDetailRow}>
                          <span className={styles.appDetailLabel}>Qualification</span>
                          <span className={styles.appDetailValue}>{selected.qualification}</span>
                        </div>
                      )}
                      {selected.availability && (
                        <div className={styles.appDetailRow}>
                          <span className={styles.appDetailLabel}>Availability</span>
                          <span className={styles.appDetailValue}>{selected.availability}</span>
                        </div>
                      )}
                      {selected.cvUrl && (
                        <div className={styles.appDetailRow}>
                          <span className={styles.appDetailLabel}>CV / Resume</span>
                          <a href={selected.cvUrl} target="_blank" rel="noopener noreferrer" className={styles.appDetailLink}>View CV →</a>
                        </div>
                      )}
                      {selected.coverNote && (
                        <div className={styles.appDetailCoverNote}>
                          <span className={styles.appDetailLabel}>Why a good fit</span>
                          <p className={styles.appDetailCoverText}>{selected.coverNote}</p>
                        </div>
                      )}
                    </DrawerSection>
                  )}

                  {/* Interview details */}
                  {selected.status === 'interview_scheduled' && (
                    <div className={styles.interviewBox}>
                      <p className={styles.interviewBoxTitle}>📅 Interview Scheduled</p>
                      {selected.interviewDate && (
                        <p className={styles.interviewBoxRow}>
                          {new Date(selected.interviewDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      )}
                      {selected.meetingLink ? (
                        <a href={selected.meetingLink} target="_blank" rel="noopener noreferrer" className={styles.interviewBoxLink}>
                          Join Meeting →
                        </a>
                      ) : (
                        <p className={styles.interviewBoxNote}>Meeting link pending</p>
                      )}
                    </div>
                  )}

                  {/* Offer details */}
                  {(selected.status === 'offer_sent' || selected.status === 'offer_accepted') && (() => {
                    const od = selected.offerDetails ?? {};
                    return (
                      <div className={styles.offerBox}>
                        <p className={styles.interviewBoxTitle}>
                          {selected.status === 'offer_accepted' ? '✅ Offer Accepted — Awaiting Signature' : '📨 Offer Sent — Awaiting Response'}
                        </p>
                        {od.rate && <p className={styles.interviewBoxRow}>{od.currency ?? ''} {Number(od.rate).toLocaleString()} / month</p>}
                        {od.contractType && <p className={styles.interviewBoxRow}>{od.contractType}</p>}
                        {od.startDate && <p className={styles.interviewBoxRow}>Start: {new Date(od.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                        {od.notes && <p className={styles.interviewBoxNote}>{od.notes}</p>}
                        {Array.isArray(selected.sentDocumentIds) && selected.sentDocumentIds.length > 0 && (
                          <p className={styles.interviewBoxNote}>{selected.sentDocumentIds.length} contract document{selected.sentDocumentIds.length > 1 ? 's' : ''} attached</p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Hired */}
                  {selected.status === 'hired' && (
                    <div className={styles.hiredBox}>
                      <p className={styles.hiredBoxTitle}>🎉 Hired!</p>
                      <p className={styles.hiredBoxSub}>All documents have been signed. This lecturer is officially hired.</p>
                    </div>
                  )}

                  {/* LinkedIn */}
                  {lec.linkedIn && (
                    <a href={lec.linkedIn} target="_blank" rel="noopener noreferrer" className={styles.drawerLinkedIn}>
                      LinkedIn →
                    </a>
                  )}
                </>
              );
            })()}

            <div className={styles.drawerActions}>
              {selected.status === 'pending' && (
                <>
                  <button className={styles.shortlistBtn} onClick={() => updateStatus(selected.id, 'shortlisted')}>Shortlist</button>
                  <button className={styles.declineBtn} onClick={() => { updateStatus(selected.id, 'declined'); setSelected(null); }}>Decline</button>
                </>
              )}
              {selected.status === 'shortlisted' && (
                <>
                  <button className={styles.interviewBtn} onClick={() => openInterviewModal(selected)}>Schedule Interview</button>
                  <button className={styles.declineBtn} onClick={() => { updateStatus(selected.id, 'declined'); setSelected(null); }}>Decline</button>
                </>
              )}
              {selected.status === 'interview_scheduled' && (
                <button className={styles.offerBtn} onClick={() => openOfferModal(selected)}>Send Offer</button>
              )}
              {selected.status === 'declined' && (
                <button className={styles.restoreBtn} onClick={() => updateStatus(selected.id, 'pending')}>Restore Application</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DrawerSection({ title, open, onToggle, children }) {
  return (
    <div className={styles.section}>
      <button className={styles.sectionToggle} onClick={onToggle}>
        <span>{title}</span>
        <span className={styles.sectionChevron}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className={styles.sectionContent}>{children}</div>}
    </div>
  );
}

function ExpandIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}
