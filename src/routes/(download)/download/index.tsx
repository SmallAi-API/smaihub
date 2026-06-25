'use client';

import { Button, Flexbox, Icon, Text, Video } from '@lobehub/ui';
import { TypewriterEffect } from '@lobehub/ui/awesome';
import { Apple, Download, Monitor } from 'lucide-react';
import { motion } from 'motion/react';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useIsDark } from '@/hooks/useIsDark';

import { styles } from './_layout/style';
import { type DownloadItem, getLatestVersion, type VersionInfo } from './_lib/version';

type OS = 'mac' | 'windows' | 'other';

const detectOS = (): OS => {
  if (typeof navigator === 'undefined') return 'other';
  const ua = `${navigator.userAgent} ${navigator.platform}`.toLowerCase();
  if (ua.includes('mac')) return 'mac';
  if (ua.includes('win')) return 'windows';
  return 'other';
};

const DownloadPage = memo(() => {
  const { t } = useTranslation('download');
  const isDarkMode = useIsDark();
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [os, setOS] = useState<OS>('other');

  useEffect(() => {
    setOS(detectOS());
    getLatestVersion()
      .then((info) => {
        setVersionInfo(info);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const labelOf = (item: DownloadItem) => {
    if (item.platform === 'windows') return t('downloadFor.windows');
    if (item.arch === 'arm64') return t('downloadFor.mac.arm64');
    if (item.arch === 'x64') return t('downloadFor.mac.x64');
    return t('downloadFor.mac');
  };

  // Order: detected OS first, so the most relevant button is the primary one
  const downloads = useMemo(() => {
    const list = versionInfo?.downloads ?? [];
    return [...list].sort((a, b) => {
      const aMatch = a.platform === os ? 0 : 1;
      const bMatch = b.platform === os ? 0 : 1;
      return aMatch - bMatch;
    });
  }, [versionInfo, os]);

  const handleDownload = (url: string) => {
    if (url) window.open(url, '_blank');
  };

  return (
    <>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <Flexbox align={'center'} gap={48} style={{ maxWidth: 800 }}>
          <Flexbox align={'center'} gap={16}>
            <div style={{ fontSize: 32, fontWeight: 'bold', lineHeight: 1.4, minHeight: 48 }}>
              <TypewriterEffect
                showCursor
                cursorStyle="dot"
                loop={false}
                typingSpeed={150}
                sentences={[
                  t('title'),
                  'Best desktop experience for SmaiHub',
                  'Sync your cloud chat records seamlessly',
                  'Download the desktop app now',
                ]}
              />
            </div>
            <Text fontSize={18} style={{ lineHeight: 1.4 }} type={'secondary'}>
              {t('subtitle')}
            </Text>
          </Flexbox>

          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Flexbox horizontal align={'center'} gap={12} wrap={'wrap'}>
              {loading || downloads.length === 0 ? (
                <Button
                  className={styles.downloadButton}
                  disabled={!loading}
                  icon={<Icon icon={Download} />}
                  loading={loading}
                  size={'large'}
                  type={'primary'}
                >
                  {t('downloadButton')}
                </Button>
              ) : (
                downloads.map((item, index) => (
                  <Button
                    className={styles.downloadButton}
                    icon={<Icon icon={item.platform === 'mac' ? Apple : Monitor} />}
                    key={item.url}
                    size={'large'}
                    type={index === 0 ? 'primary' : 'default'}
                    onClick={() => handleDownload(item.url)}
                  >
                    {labelOf(item)}
                  </Button>
                ))
              )}
            </Flexbox>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            style={{ aspectRatio: '1.50037 / 1', maxWidth: '45vw', width: 1253 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Video
              autoPlay
              loop
              muted
              style={{ borderRadius: 6 }}
              src={
                isDarkMode
                  ? 'https://smaihub-1301925107.cos.ap-guangzhou.myqcloud.com/logo/agent-builder-dark.webm'
                  : 'https://smaihub-1301925107.cos.ap-guangzhou.myqcloud.com/logo/agent-builder-light.webm'
              }
            />
          </motion.div>

          <motion.div
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <Flexbox align={'center'} gap={8}>
              <Text type={'secondary'} weight={'bold'}>
                {t('requirements.title')}
              </Text>
              <Text type={'secondary'}>{t('requirements.os')}</Text>
            </Flexbox>
          </motion.div>
        </Flexbox>
      </motion.div>
    </>
  );
});

DownloadPage.displayName = 'DownloadPage';

export default DownloadPage;
