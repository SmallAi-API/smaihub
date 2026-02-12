'use client';

import { Button, Flexbox, Icon, Text, Video } from '@lobehub/ui';
import { TypewriterEffect } from '@lobehub/ui/awesome';
import { Download } from 'lucide-react';
import { motion } from 'motion/react';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PageTitle from '@/components/PageTitle';
import { useIsDark } from '@/hooks/useIsDark';

import { styles } from './_layout/style';
import { getLatestVersion, type VersionInfo } from './_lib/version';

const DownloadPage = memo(() => {
  const { t } = useTranslation('download');
  const isDarkMode = useIsDark();
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLatestVersion()
      .then((info) => {
        setVersionInfo(info);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleDownload = () => {
    if (versionInfo?.downloadUrl) {
      window.open(versionInfo.downloadUrl, '_blank');
    }
  };

  return (
    <>
      <PageTitle title={t('title')} />
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <Flexbox align={'center'} gap={48} style={{ maxWidth: 800 }}>
          {/* Hero Section */}
          <Flexbox align={'center'} gap={16}>
            <div style={{ fontSize: 32, fontWeight: 'bold', lineHeight: 1.4, minHeight: 48 }}>
              <TypewriterEffect
                showCursor
                cursorStyle="dot"
                loop={false}
                typingSpeed={150}
                sentences={[
                  t('title'),
                  '最佳的桌面端体验',
                  '支持云同步，无缝连接你的聊天记录',
                  '立刻下载桌面端',
                ]}
              />
            </div>
            <Text fontSize={18} style={{ lineHeight: 1.4 }} type={'secondary'}>
              {t('subtitle')}
            </Text>
          </Flexbox>

          {/* Download Button */}
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Button
              className={styles.downloadButton}
              disabled={loading || !versionInfo}
              icon={<Icon icon={Download} />}
              loading={loading}
              size={'large'}
              type={'primary'}
              onClick={handleDownload}
            >
              {t('downloadButton')}
            </Button>
          </motion.div>

          {/* Preview Image */}
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

          {/* System Requirements */}
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
