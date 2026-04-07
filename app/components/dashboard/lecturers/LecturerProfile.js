'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LecturerProfile.module.css';
import { lecturerService } from '@/app/lib/services/lecturerService';

export default function LecturerProfile({ id }) {
  const router = useRouter();
  const [lecturer, setLecturer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lecturerService.get(id)
      .then((data) => {
        console.log("data:" , data)
        setLecturer(data)
      })
      .catch(() => setLecturer(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.notFound}><p>Loading…</p></div>;

  if (!lecturer) {
    return (
      <div className={styles.notFound}>
        <p>Lecturer not found.</p>
        <button onClick={() => router.back()} className={styles.backBtn}>← Go back</button>
      </div>
    );
  }

  // Normalise arrays — backend may store them as JSON arrays or as flat text fields
  const experience = Array.isArray(lecturer.workExperience) ? lecturer.workExperience : [];
  const portfolio   = Array.isArray(lecturer.portfolio)     ? lecturer.portfolio     : [];

  // Build education from array OR from flat onboarding fields
  const education = Array.isArray(lecturer.education) && lecturer.education.length > 0
    ? lecturer.education
    : lecturer.institutions
      ? [{ degree: lecturer.degrees, institution: lecturer.institutions, year: lecturer.graduationYears }]
      : [];

  // Certifications: array or certificationsText flat field
  const certifications = Array.isArray(lecturer.certifications) && lecturer.certifications.length > 0
    ? lecturer.certifications
    : lecturer.certificationsText
      ? lecturer.certificationsText.split(',').map((c) => c.trim()).filter(Boolean)
      : [];

  const languages       = Array.isArray(lecturer.languages)       ? lecturer.languages       : [];
  const specializations = Array.isArray(lecturer.specializations) ? lecturer.specializations : [];

  const rating = Number(lecturer.rating ?? 0);

  const docs = [
    { label: 'Resume / CV',           url: lecturer.resumeUrl,           name: lecturer.resumeFileName },
    { label: 'ID Document',           url: lecturer.idDocumentUrl,       name: lecturer.idDocumentFileName },
    { label: 'Certificate',           url: lecturer.certificateUrl,      name: lecturer.certificateFileName },
    { label: 'Transcript',            url: lecturer.transcriptUrl,       name: lecturer.transcriptFileName },
    { label: 'Professional Cert.',    url: lecturer.professionalCertUrl, name: lecturer.professionalCertFileName },
  ].filter((d) => d.url);

  return (
    <div className={styles.page}>
      {/* ── Back ── */}
      <button className={styles.backBtn} onClick={() => router.back()}>
        ← Back
      </button>

      {/* ── Hero Header ── */}
      <div className={styles.hero}>
        {lecturer.avatarUrl ? (
          <img src={lecturer.avatarUrl} alt={lecturer.name} className={styles.heroAvatarImg} />
        ) : (
          <div className={styles.heroAvatar} style={{ background: lecturer.color ?? '#4f46e5' }}>
            {lecturer.initials}
          </div>
        )}
        <div className={styles.heroInfo}>
          <h1 className={styles.heroName}>{lecturer.name}</h1>
          {lecturer.title && <p className={styles.heroTitle}>{lecturer.title}</p>}
          <div className={styles.heroMeta}>
            {lecturer.country   && <span className={styles.metaChip}>📍 {lecturer.country}</span>}
            {lecturer.timezone  && <span className={styles.metaChip}>🕐 {lecturer.timezone}</span>}
            {lecturer.qualification && <span className={styles.metaChip}>🎓 {lecturer.qualification}</span>}
            {(lecturer.yearsOfExperience != null) && (
              <span className={styles.metaChip}>⏱ {lecturer.yearsOfExperience} yrs exp.</span>
            )}
            {lecturer.availability && <span className={styles.metaChip}>⚡ {lecturer.availability}</span>}
            {lecturer.gender     && <span className={styles.metaChip}>👤 {lecturer.gender}</span>}
            {lecturer.nationality && <span className={styles.metaChip}>🌐 {lecturer.nationality}</span>}
          </div>
          <div className={styles.heroFooter}>
            <div className={styles.heroRate}>
              {Number(lecturer.hourlyRate ?? 0).toLocaleString()} {lecturer.currency || 'USD'}/hr
              {lecturer.preferredMonthlyRate && (
                <span style={{ marginLeft: 12, fontSize: 14, fontWeight: 500, opacity: 0.8 }}>
                  · {Number(lecturer.preferredMonthlyRate).toLocaleString()} {lecturer.currency || 'USD'}/mo
                </span>
              )}
            </div>
            <div className={styles.heroRating}>
              {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
              <span className={styles.ratingNum}>{rating} ({lecturer.reviewCount ?? 0} reviews)</span>
            </div>
          </div>
          {languages.length > 0 && (
            <div className={styles.heroLangs}>
              {languages.map((l) => <span key={l} className={styles.langChip}>{l}</span>)}
            </div>
          )}
          {lecturer.linkedIn && (
            <a href={lecturer.linkedIn} target="_blank" rel="noopener noreferrer" className={styles.linkedIn}>
              LinkedIn →
            </a>
          )}
        </div>
      </div>

      <div className={styles.body}>
        {/* ── About ── */}
        {(lecturer.bio || specializations.length > 0) && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>About</h2>
            {lecturer.bio && <p className={styles.bio}>{lecturer.bio}</p>}
            {specializations.length > 0 && (
              <div className={styles.tags}>
                {specializations.map((s) => <span key={s} className={styles.tag}>{s}</span>)}
              </div>
            )}
          </section>
        )}

        {/* ── Teaching Philosophy ── */}
        {lecturer.teachingPhilosophy && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Teaching Philosophy</h2>
            <p className={styles.philosophyText}>"{lecturer.teachingPhilosophy}"</p>
          </section>
        )}

        {/* ── Work Experience ── */}
        {experience.length > 0 && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Work Experience</h2>
            <div className={styles.timeline}>
              {experience.map((exp, i) => (
                <div key={i} className={styles.timelineItem}>
                  <div className={styles.timelineDot} />
                  {i < experience.length - 1 && <div className={styles.timelineLine} />}
                  <div className={styles.timelineContent}>
                    <div className={styles.expHeader}>
                      <div>
                        <p className={styles.expRole}>{exp.role}</p>
                        <p className={styles.expInstitution}>{exp.institution || 'Self-employed'}</p>
                      </div>
                      <span className={styles.expPeriod}>{exp.period}</span>
                    </div>
                    {exp.description && <p className={styles.expDesc}>{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Education ── */}
        {education.length > 0 && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Education</h2>
            <div className={styles.eduList}>
              {education.map((edu, i) => (
                <div key={i} className={styles.eduItem}>
                  <div className={styles.eduIcon}>🎓</div>
                  <div>
                    {edu.degree && <p className={styles.eduDegree}>{edu.degree}</p>}
                    <p className={styles.eduInstitution}>{edu.institution}{edu.year ? ` · ${edu.year}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Honors & Awards ── */}
        {lecturer.honorsAwards && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Honors & Awards</h2>
            <p className={styles.bio}>{lecturer.honorsAwards}</p>
          </section>
        )}

        {/* ── Portfolio ── */}
        {portfolio.length > 0 && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Portfolio & Publications</h2>
            <div className={styles.portfolioGrid}>
              {portfolio.map((item, i) => (
                <div key={i} className={styles.portfolioCard}>
                  <div className={styles.portfolioType}>{item.type}</div>
                  <p className={styles.portfolioTitle}>{item.title}</p>
                  <div className={styles.portfolioFooter}>
                    <span className={styles.portfolioYear}>{item.year}</span>
                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.portfolioLink}>View →</a>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Certifications ── */}
        {certifications.length > 0 && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Certifications</h2>
            <div className={styles.certList}>
              {certifications.map((cert, i) => (
                <div key={i} className={styles.certItem}>
                  <span className={styles.certBadge}>✓</span>
                  <span>{typeof cert === 'string' ? cert : cert.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Uploaded Documents ── */}
        {docs.length > 0 && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Uploaded Documents</h2>
            <div className={styles.docList}>
              {docs.map((doc) => (
                <a key={doc.label} href={doc.url} target="_blank" rel="noopener noreferrer" className={styles.docItem}>
                  <span className={styles.docIcon}>📄</span>
                  <div>
                    <p className={styles.docLabel}>{doc.label}</p>
                    {doc.name && <p className={styles.docName}>{doc.name}</p>}
                  </div>
                  <span className={styles.docArrow}>↗</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── Contact Info ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Contact & Info</h2>
          <div className={styles.infoGrid}>
            {lecturer.email       && <><span className={styles.infoLabel}>Email</span><span className={styles.infoValue}>{lecturer.email}</span></>}
            {lecturer.phone       && <><span className={styles.infoLabel}>Phone</span><span className={styles.infoValue}>{lecturer.phone}</span></>}
            {lecturer.dateOfBirth && <><span className={styles.infoLabel}>Date of Birth</span><span className={styles.infoValue}>{lecturer.dateOfBirth}</span></>}
            {lecturer.nationality && <><span className={styles.infoLabel}>Nationality</span><span className={styles.infoValue}>{lecturer.nationality}</span></>}
            {lecturer.field       && <><span className={styles.infoLabel}>Field</span><span className={styles.infoValue}>{lecturer.field}</span></>}
          </div>
        </section>
      </div>
    </div>
  );
}
