'use client';

import { useRouter } from 'next/navigation';
import { MOCK_LECTURERS, MOCK_LECTURER_DETAILS } from '@/app/lib/mockData';
import styles from './LecturerProfile.module.css';

export default function LecturerProfile({ id }) {
  const router = useRouter();
  const lecturer = MOCK_LECTURERS.find((l) => l.id === id);
  const details = MOCK_LECTURER_DETAILS[id];

  if (!lecturer || !details) {
    return (
      <div className={styles.notFound}>
        <p>Lecturer not found.</p>
        <button onClick={() => router.back()} className={styles.backBtn}>← Go back</button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Back ── */}
      <button className={styles.backBtn} onClick={() => router.back()}>
        ← Back
      </button>

      {/* ── Hero Header ── */}
      <div className={styles.hero}>
        <div className={styles.heroAvatar} style={{ background: lecturer.color }}>
          {lecturer.initials}
        </div>
        <div className={styles.heroInfo}>
          <h1 className={styles.heroName}>{lecturer.name}</h1>
          <p className={styles.heroTitle}>{lecturer.title}</p>
          <div className={styles.heroMeta}>
            <span className={styles.metaChip}>📍 {lecturer.country}</span>
            <span className={styles.metaChip}>🕐 {lecturer.timezone}</span>
            <span className={styles.metaChip}>🎓 {lecturer.qualification}</span>
            <span className={styles.metaChip}>⏱ {lecturer.experience} yrs exp.</span>
            <span className={styles.metaChip}>⚡ {lecturer.availability}</span>
          </div>
          <div className={styles.heroFooter}>
            <div className={styles.heroRate}>${lecturer.rate}/hr</div>
            <div className={styles.heroRating}>
              {'★'.repeat(Math.round(lecturer.rating))}{'☆'.repeat(5 - Math.round(lecturer.rating))}
              <span className={styles.ratingNum}>{lecturer.rating} ({lecturer.reviews} reviews)</span>
            </div>
          </div>
          <div className={styles.heroLangs}>
            {details.languages.map((l) => (
              <span key={l} className={styles.langChip}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {/* ── About ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>About</h2>
          <p className={styles.bio}>{lecturer.bio}</p>
          <div className={styles.tags}>
            {lecturer.specializations.map((s) => (
              <span key={s} className={styles.tag}>{s}</span>
            ))}
          </div>
        </section>

        {/* ── Teaching Philosophy ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Teaching Philosophy</h2>
          <p className={styles.philosophyText}>"{details.teachingPhilosophy}"</p>
        </section>

        {/* ── Work Experience ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Work Experience</h2>
          <div className={styles.timeline}>
            {details.experience.map((exp, i) => (
              <div key={i} className={styles.timelineItem}>
                <div className={styles.timelineDot} />
                {i < details.experience.length - 1 && <div className={styles.timelineLine} />}
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

        {/* ── Education ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Education</h2>
          <div className={styles.eduList}>
            {details.education.map((edu, i) => (
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

        {/* ── Portfolio ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Portfolio & Publications</h2>
          <div className={styles.portfolioGrid}>
            {details.portfolio.map((item, i) => (
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

        {/* ── Certifications ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Certifications</h2>
          <div className={styles.certList}>
            {details.certifications.map((cert, i) => (
              <div key={i} className={styles.certItem}>
                <span className={styles.certBadge}>✓</span>
                <span>{cert}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
