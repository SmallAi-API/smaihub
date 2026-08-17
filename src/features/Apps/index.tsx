'use client';

import { DOWNLOAD_URL, USAGE_DOCUMENTS } from '@lobechat/const';
import { Block, Flexbox, Icon, Text } from '@lobehub/ui';
import { Button } from '@lobehub/ui/base-ui';
import { Lark, Line, QQ } from '@lobehub/ui/icons';
import { cx } from 'antd-style';
import { ChevronRight, Download, MessageCircle, Monitor } from 'lucide-react';
import type { ReactNode } from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ProductLogo } from '@/components/Branding/ProductLogo';
import { PlatformBrandIcon, SUPPORTED_MESSENGER_PLATFORMS } from '@/features/Messenger/constants';

import PixelLogoGrid from './PixelLogoGrid';
import { styles } from './style';

/**
 * The smai.ai provider console — this key authenticates LLM calls against the
 * smai.ai service, which is unrelated to the platform's own `/settings/apikey`.
 */
const API_PLATFORM_URL = 'https://api.smai.ai';
const CHANNEL_DOCS_URL = `${USAGE_DOCUMENTS}/channels`;
const MANUAL_MESSENGER_PLATFORMS = [
  {
    docsUrl: `https://docs.smai.ai/docs/smai-app/channels/feishu`,
    icon: Lark.Color,
    id: 'feishu',
    name: 'Feishu / Lark',
  },
  { docsUrl: `${CHANNEL_DOCS_URL}/line`, icon: Line.Color, id: 'line', name: 'LINE' },
  { docsUrl: `https://docs.smai.ai/docs/smai-app`, icon: QQ.Color, id: 'qq', name: 'QQ' },
] as const;

const openExternal = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

const AppsPage = memo(() => {
  const { t } = useTranslation('setting');
  const navigate = useNavigate();

  const renderMessengerPlatformButton = (
    id: string,
    name: string,
    icon: ReactNode,
    onClick: () => void,
  ) => (
    <Button
      block
      className={styles.platformItem}
      key={id}
      icon={
        <span aria-hidden className={styles.platformIcon}>
          {icon}
        </span>
      }
      onClick={onClick}
    >
      <span className={styles.platformLabel}>
        <span className={styles.platformName}>{name}</span>
      </span>
      <ChevronRight aria-hidden className={styles.platformChevron} size={14} />
    </Button>
  );

  const renderMessengerPlatformGrid = () => {
    return (
      <>
        {MANUAL_MESSENGER_PLATFORMS.map((platform) => {
          const PlatformIcon = platform.icon;
          return renderMessengerPlatformButton(
            platform.id,
            platform.name,
            <PlatformIcon size={18} />,
            () => openExternal(platform.docsUrl),
          );
        })}
        {SUPPORTED_MESSENGER_PLATFORMS.map((platform) =>
          renderMessengerPlatformButton(
            platform.id,
            platform.name,
            <PlatformBrandIcon platform={platform.id} size={18} />,
            () => navigate('/settings/messenger'),
          ),
        )}
      </>
    );
  };

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <header className={styles.pageHeader}>
          <Text as="h1" className={styles.pageTitle} weight={700}>
            {t('apps.title')}
          </Text>
        </header>

        <div className={styles.bentoGrid}>
          <Block className={cx(styles.card, styles.desktopCard)}>
            <Flexbox gap={18} height="100%">
              <Flexbox align="center" className={styles.iconBox} justify="center">
                <Icon icon={Monitor} size={22} />
              </Flexbox>
              <Flexbox gap={8}>
                <Text as="h2" style={{ fontSize: 20 }} weight={700}>
                  {t('apps.desktop.title')}
                </Text>
                <Text type="secondary">{t('apps.desktop.desc')}</Text>
              </Flexbox>
              <Flexbox horizontal className={styles.actionRow} gap={10}>
                <Button
                  icon={<Icon icon={Download} />}
                  type="primary"
                  onClick={() => openExternal(DOWNLOAD_URL.default)}
                >
                  {t('apps.desktop.cta')}
                </Button>
              </Flexbox>
            </Flexbox>
          </Block>

          <Block className={cx(styles.card, styles.apiKeyCard)}>
            <Flexbox gap={18} height="100%">
              <Flexbox align="center" className={styles.iconBox} justify="center">
                <ProductLogo size={24} />
              </Flexbox>
              <Flexbox gap={8}>
                <Text as="h2" style={{ fontSize: 20 }} weight={700}>
                  {t('apps.apiKey.title')}
                </Text>
                <Text type="secondary">{t('apps.apiKey.desc')}</Text>
              </Flexbox>
              <Flexbox horizontal className={styles.actionRow} gap={10}>
                <Button
                  icon={<Icon icon={ChevronRight} />}
                  onClick={() => openExternal(API_PLATFORM_URL)}
                >
                  {t('apps.apiKey.cta')}
                </Button>
              </Flexbox>
            </Flexbox>
          </Block>

          <Block className={cx(styles.card, styles.messengerCard)}>
            <Flexbox gap={18} height="100%">
              <Flexbox align="center" className={styles.iconBox} justify="center">
                <Icon icon={MessageCircle} size={22} />
              </Flexbox>
              <Flexbox gap={8}>
                <Text as="h2" style={{ fontSize: 20 }} weight={700}>
                  {t('apps.messenger.title')}
                </Text>
                <Text type="secondary">{t('apps.messenger.desc')}</Text>
              </Flexbox>
              <div className={styles.platformGrid}>{renderMessengerPlatformGrid()}</div>
              <Flexbox horizontal className={styles.actionRow} gap={10}>
                <Button
                  icon={<Icon icon={ChevronRight} />}
                  onClick={() => navigate('/settings/messenger')}
                >
                  {t('apps.messenger.cta')}
                </Button>
              </Flexbox>
            </Flexbox>
          </Block>
        </div>

        <PixelLogoGrid />
      </main>
    </div>
  );
});

AppsPage.displayName = 'AppsPage';

export default AppsPage;
