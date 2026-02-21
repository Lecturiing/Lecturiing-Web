import styles from './FlowCard.module.css';

export default function FlowCard({ children }) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>{children}</div>
    </div>
  );
}
