import SignupForm from './SignupForm';
import ImagePanel from '../login/ImagePanel';
import styles from './SignupPage.module.css';

export default function SignupPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formColumn}>
        <SignupForm />
      </div>
      <div className={styles.imageColumn}>
        <ImagePanel />
      </div>
    </div>
  );
}
