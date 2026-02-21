import Image from 'next/image';
import logo from '@/app/assets/Frame 36712.png';
import styles from './ImagePanel.module.css';

export default function ImagePanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.shapes}>
        <div className={styles.circle1} />
        <div className={styles.circle2} />
        <div className={styles.circle3} />
      </div>
      <div className={styles.content}>
        <div className={styles.logoMark}>
          <Image src={logo} alt="Lecturiing logo" width={48} height={48} className={styles.logoImg} />
          <span className={styles.logoName}>Lecturiing</span>
        </div>
        <h2 className={styles.tagline}>
          Empowering Education,<br />One Platform at a Time.
        </h2>
        <p className={styles.subTagline}>
          Seamlessly manage your institution, courses, and learning resources from a single dashboard.
        </p>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>500+</span>
            <span className={styles.statLabel}>Institutions</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>50k+</span>
            <span className={styles.statLabel}>Learners</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>98%</span>
            <span className={styles.statLabel}>Satisfaction</span>
          </div>
        </div>
      </div>
    </div>
  );
}
