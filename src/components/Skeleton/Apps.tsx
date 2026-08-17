'use client';

import { Flexbox } from '@lobehub/ui';
import { cx } from 'antd-style';

import { styles } from '@/features/Apps/style';

import SkeletonBar from './Bar';

/** Mirrors the six messenger platform buttons in the real page's 2-column grid. */
const PLATFORM_SLOTS = ['feishu', 'line', 'qq', 'discord', 'slack', 'telegram'] as const;

const AppsSkeleton = () => (
  <div aria-busy className={styles.page}>
    <main className={styles.content}>
      <header className={styles.pageHeader}>
        <SkeletonBar height={36} width={'42%'} />
      </header>

      <div className={styles.bentoGrid}>
        <div className={cx(styles.card, styles.desktopCard)}>
          <Flexbox gap={18} height={'100%'}>
            <SkeletonBar height={44} radius={12} width={44} />
            <Flexbox gap={8}>
              <SkeletonBar height={26} width={'46%'} />
              <SkeletonBar height={14} width={'88%'} />
            </Flexbox>
            <Flexbox className={styles.actionRow}>
              <SkeletonBar height={32} width={168} />
            </Flexbox>
          </Flexbox>
        </div>

        <div className={cx(styles.card, styles.apiKeyCard)}>
          <Flexbox gap={18} height={'100%'}>
            <SkeletonBar height={44} radius={12} width={44} />
            <Flexbox gap={8}>
              <SkeletonBar height={26} width={'52%'} />
              <SkeletonBar height={14} width={'92%'} />
            </Flexbox>
            <Flexbox className={styles.actionRow}>
              <SkeletonBar height={32} width={152} />
            </Flexbox>
          </Flexbox>
        </div>

        <div className={cx(styles.card, styles.messengerCard)}>
          <Flexbox gap={18} height={'100%'}>
            <SkeletonBar height={44} radius={12} width={44} />
            <Flexbox gap={8}>
              <SkeletonBar height={26} width={'58%'} />
              <SkeletonBar height={14} width={'90%'} />
            </Flexbox>
            <div className={styles.platformGrid}>
              {PLATFORM_SLOTS.map((slot) => (
                <SkeletonBar height={44} key={slot} radius={10} />
              ))}
            </div>
            <Flexbox className={styles.actionRow}>
              <SkeletonBar height={32} width={196} />
            </Flexbox>
          </Flexbox>
        </div>
      </div>
    </main>
  </div>
);

export default AppsSkeleton;
