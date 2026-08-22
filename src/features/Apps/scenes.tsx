'use client';

import { APP_SHOTS } from './const';
import { styles } from './style';

export const DesktopScene = () => (
  <div className={styles.stage}>
    <img
      alt=""
      className={`${styles.desktopShot} ${styles.lightOnly}`}
      src={APP_SHOTS.desktopLight}
    />
    <img
      alt=""
      className={`${styles.desktopShot} ${styles.darkOnly}`}
      src={APP_SHOTS.desktopDark}
    />
  </div>
);
