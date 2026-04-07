import { Suspense } from 'react';
import LoginForm from './LoginForm';
import ImagePanel from './ImagePanel';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formColumn}>
        <Suspense fallback={<div className={styles.formLoading} />}>
          <LoginForm />
        </Suspense>
      </div>
      <div className={styles.imageColumn}>
        <ImagePanel />
      </div>
    </div>
  );
}
