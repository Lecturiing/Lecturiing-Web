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
      .then((data) => setLecturer(data))
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

  const experience = lecturer.workExperience ?? lecturer.experience ?? [];
  const education = lecturer.education ?? [];
  const portfolio = lecturer.portfolio ?? [];
  const certifications = lecturer.certifications ?? [];
  const languages = lecturer.languages ?? [];

  return (
    <div className={styles.page}>
      {/* ── Back ── */}
      <button className={styles.backBtn} onClick={() => router.back()}>
        ← Back
      </button>

      {/* ── Hero Header ── */}
      <div className={styles.hero}>
        <div className={styles.heroAvatar} style={{ background: lecturer.avatarColor ?? lecturer.color }}>
          {lecturer.initials}
        </div>
        <div className={styles.heroInfo}>
          <h1 className={styles.heroName}>{lecturer.name}</h1>
          <p className={styles.heroTitle}>{lecturer.title}</p>
          <div className={styles.heroMeta}>
            <span className={styles.metaChip}>📍 {lecturer.country}</span>
            <span className={styles.metaChip}>🕐 {lecturer.timezone}</span>
            <span className={styles.metaChip}>🎓 {lecturer.qualification}</span>
            <span className={styles.metaChip}>⏱ {lecturer.yearsExperience ?? lecturer.experience} yrs exp.</span>
            <span className={styles.metaChip}>⚡ {lecturer.availability}</span>
          </div>
          <div className={styles.heroFooter}>
            <div className={styles.heroRate}>${lecturer.hourlyRate ?? lecturer.rate}/hr</div>
            <div className={styles.heroRating}>
              {'★'.repeat(Math.round(lecturer.rating ?? 0))}{'☆'.repeat(5 - Math.round(lecturer.rating ?? 0))}
              <span className={styles.ratingNum}>{lecturer.rating} ({lecturer.reviewCount ?? lecturer.reviews} reviews)</span>
            </div>
          </div>
          {languages.length > 0 && (
            <div className={styles.heroLangs}>
              {languages.map((l) => (
                <span key={l} className={styles.langChip}>{l}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.body}>
        {/* ── About ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>About</h2>
          <p className={styles.bio}>{lecturer.bio}</p>
          <div className={styles.tags}>
            {(lecturer.specializations ?? []).map((s) => (
              <span key={s} className={styles.tag}>{s}</span>
            ))}
          </div>
        </section>

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
                    <p className={styles.expDesc}>{exp.description}</p>
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
                    <p className={styles.eduDegree}>{edu.degree}</p>
                    <p className={styles.eduInstitution}>{edu.institution} · {edu.year}</p>
                  </div>
                </div>
              ))}
            </div>
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
                    <a href={item.url} className={styles.portfolioLink} onClick={(e) => e.preventDefault()}>View →</a>
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
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
