'use client';

import { DOWNLOAD_URL, isDesktop } from '@lobechat/const';
import { Button, Tag, Text } from '@lobehub/ui/base-ui';
import { Lark, QQ, Telegram, WeChat } from '@lobehub/ui/icons';
import { ArrowUpRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ProductLogo } from '@/components/Branding/ProductLogo';
import { resolveInboxAgentRouteId } from '@/features/AgentRoute/useResolvedAgentRouteId';
import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors';

import PixelLogoGrid from './PixelLogoGrid';
import { DesktopScene } from './scenes';
import { styles } from './style';

/**
 * The smai.ai provider console — this key authenticates LLM calls against the
 * smai.ai service, which is unrelated to the platform's own `/settings/apikey`.
 */
const API_PLATFORM_URL = 'https://api.smai.ai';

const openExternal = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

const DESKTOP_FEATURES = ['files', 'tools', 'focus'] as const;

/**
 * Local to this page: `lark` and `qq` are not part of `MessengerPlatform`, so
 * these rows cannot reuse `SUPPORTED_MESSENGER_PLATFORMS` / `PlatformAvatar`.
 * All four land on the inbox agent's channel page, where the platform is picked.
 */
const CHANNEL_PLATFORMS = [
  { Avatar: WeChat.Avatar, id: 'wechat', name: 'WeChat' },
  { Avatar: Lark.Avatar, id: 'lark', name: 'Lark' },
  { Avatar: QQ.Avatar, id: 'qq', name: 'QQ' },
  { Avatar: Telegram.Avatar, id: 'telegram', name: 'Telegram' },
] as const;

const AppsPage = () => {
  const { t } = useTranslation('setting');
  const navigate = useNavigate();
  const inboxAgentId = useAgentStore(builtinAgentSelectors.inboxAgentId);
  const channelPath = `/agent/${resolveInboxAgentRouteId(inboxAgentId)}/channel`;

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <h1 className={styles.headline}>{t('apps.title')}</h1>

        <div className={styles.grid}>
          <article className={`${styles.card} ${styles.spanFull}`}>
            <div className={styles.heroInner}>
              <div className={styles.cardBody}>
                <div style={{ alignItems: 'center', display: 'flex', gap: 10 }}>
                  <h2 className={styles.cardTitle}>{t('apps.desktop.title')}</h2>
                  {isDesktop && (
                    <Tag icon={<Check size={12} />} size="small">
                      {t('apps.desktop.inUse')}
                    </Tag>
                  )}
                </div>
                <Text style={{ marginTop: 8 }} type="secondary">
                  {t(isDesktop ? 'apps.desktop.inUseDesc' : 'apps.desktop.desc')}
                </Text>
                <ul className={styles.bullets}>
                  {DESKTOP_FEATURES.map((feature) => (
                    <li key={feature}>
                      <strong>{t(`apps.desktop.features.${feature}.label`)}</strong>
                      {' — '}
                      {t(`apps.desktop.features.${feature}.desc`)}
                    </li>
                  ))}
                </ul>
                {!isDesktop && (
                  <div className={styles.ctaRow}>
                    <Button type="primary" onClick={() => openExternal(DOWNLOAD_URL.default)}>
                      {t('apps.desktop.cta')}
                    </Button>
                  </div>
                )}
              </div>
              <DesktopScene />
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.cardBody}>
              <div className={styles.cardIcon}>
                <ProductLogo size={24} />
              </div>
              <h2 className={styles.cardTitle}>{t('apps.apiKey.title')}</h2>
              <Text style={{ marginTop: 8 }} type="secondary">
                {t('apps.apiKey.desc')}
              </Text>
              <div className={styles.ctaRow}>
                <Button
                  icon={ArrowUpRight}
                  iconPosition="end"
                  onClick={() => openExternal(API_PLATFORM_URL)}
                >
                  {t('apps.apiKey.cta')}
                </Button>
              </div>
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.cardBody} style={{ paddingBottom: 20 }}>
              <h2 className={styles.cardTitle}>{t('apps.messenger.title')}</h2>
              <Text style={{ marginTop: 8 }} type="secondary">
                {t('apps.messenger.desc')}
              </Text>
            </div>
            {CHANNEL_PLATFORMS.map(({ Avatar, id, name }) => (
              <div className={styles.channelRow} key={id}>
                <Avatar size={32} />
                <Text style={{ flex: 1 }} weight={500}>
                  {name}
                </Text>
                <Button
                  icon={ArrowUpRight}
                  iconPosition="end"
                  size="small"
                  onClick={() => navigate(channelPath)}
                >
                  {t('apps.messenger.setup')}
                </Button>
              </div>
            ))}
          </article>
        </div>

        <PixelLogoGrid />
      </main>
    </div>
  );
};

export default AppsPage;
