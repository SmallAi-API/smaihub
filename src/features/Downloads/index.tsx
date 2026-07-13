'use client';

import { DOWNLOAD_URL, USAGE_DOCUMENTS } from '@lobechat/const';
import { Block, Flexbox, Icon, Text } from '@lobehub/ui';
import { Button } from '@lobehub/ui/base-ui';
import { Lark, Line, QQ, WeChat } from '@lobehub/ui/icons';
import { createStaticStyles, cx } from 'antd-style';
import { ChevronRight, Download, MessageCircle, Monitor } from 'lucide-react';
import type { ReactNode } from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { PlatformBrandIcon, SUPPORTED_MESSENGER_PLATFORMS } from '@/features/Messenger/constants';

const CHANNEL_DOCS_URL = `${USAGE_DOCUMENTS}/channels`;
const MANUAL_MESSENGER_PLATFORMS = [
  {
    docsUrl: `https://docs.smai.ai/docs/smai-app/channels/feishu`,
    icon: Lark.Color,
    id: 'feishu',
    name: 'Feishu / Lark',
  },
  { docsUrl: `${CHANNEL_DOCS_URL}/line`, icon: Line.Color, id: 'line', name: 'LINE' },
  {
    docsUrl: `https://docs.smai.ai/docs/smai-app/channels/wechat`,
    icon: WeChat.Color,
    id: 'wechat',
    name: 'WeChat',
  },
  { docsUrl: `https://docs.smai.ai/docs/smai-app`, icon: QQ.Color, id: 'qq', name: 'QQ' },
] as const;

const styles = createStaticStyles(({ css, cssVar }) => ({
  actionRow: css`
    flex-wrap: wrap;
    margin-block-start: auto;
  `,
  card: css`
    min-height: 260px;
    padding: 24px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadiusLG};

    background: ${cssVar.colorBgContainer};
  `,
  content: css`
    width: min(100%, 1120px);
    margin-block: 0;
    margin-inline: auto;
    padding-block: 32px 96px;
    padding-inline: 24px;

    @media (width <= 760px) {
      padding-block-start: 16px;
      padding-inline: 16px;
    }
  `,
  bentoGrid: css`
    display: grid;
    grid-template-columns: minmax(0, 0.88fr) minmax(0, 1.12fr);
    grid-template-rows: minmax(260px, auto);
    gap: 16px;

    @media (width <= 860px) {
      grid-template-columns: 1fr;
      grid-template-rows: none;
    }
  `,
  iconBox: css`
    width: 44px;
    height: 44px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 12px;

    color: ${cssVar.colorText};

    background: ${cssVar.colorFillQuaternary};
  `,
  page: css`
    overflow-y: auto;
    height: 100%;
    min-height: 100%;
    background: ${cssVar.colorBgLayout};
  `,
  pageHeader: css`
    margin-block-end: 24px;
    text-align: start;
  `,
  pageTitle: css`
    margin: 0;
    font-size: 30px;
    line-height: 1.2;
    letter-spacing: 0;
  `,
  platformGrid: css`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-block: 22px;

    @media (width <= 520px) {
      grid-template-columns: 1fr;
    }
  `,
  platformItem: css`
    cursor: pointer;

    justify-content: flex-start;

    width: 100%;
    min-height: 44px;
    padding-inline: 12px;
    border-radius: 10px;

    color: ${cssVar.colorText};
    text-align: start;

    background: ${cssVar.colorFillQuaternary};

    &:hover {
      border-color: ${cssVar.colorBorder};
      background: ${cssVar.colorFillTertiary};
    }
  `,
  platformChevron: css`
    flex-shrink: 0;
    color: ${cssVar.colorTextTertiary};
  `,
  platformIcon: css`
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    line-height: 0;
  `,
  platformLabel: css`
    display: inline-flex;
    flex: 1;
    gap: 6px;
    align-items: center;

    min-width: 0;
  `,
  platformName: css`
    overflow: hidden;
    min-width: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  platformVerified: css`
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;

    line-height: 0;
    color: ${cssVar.colorSuccess};
  `,
  desktopCard: css`
    grid-column: 1;
    grid-row: 1;

    @media (width <= 860px) {
      grid-column: auto;
      grid-row: auto;
    }
  `,
  messengerCard: css`
    grid-column: 2;
    grid-row: 1;

    @media (width <= 860px) {
      grid-column: auto;
      grid-row: auto;
    }
  `,
}));

const openExternal = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

const DownloadsPage = memo(() => {
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
            {t('downloads.title')}
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
                  {t('downloads.desktop.title')}
                </Text>
                <Text type="secondary">{t('downloads.desktop.desc')}</Text>
              </Flexbox>
              <Flexbox horizontal className={styles.actionRow} gap={10}>
                <Button
                  icon={<Icon icon={Download} />}
                  type="primary"
                  onClick={() => openExternal(DOWNLOAD_URL.default)}
                >
                  {t('downloads.desktop.cta')}
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
                  {t('downloads.messenger.title')}
                </Text>
                <Text type="secondary">{t('downloads.messenger.desc')}</Text>
              </Flexbox>
              <div className={styles.platformGrid}>{renderMessengerPlatformGrid()}</div>
              <Flexbox horizontal className={styles.actionRow} gap={10}>
                <Button
                  icon={<Icon icon={ChevronRight} />}
                  onClick={() => navigate('/settings/messenger')}
                >
                  {t('downloads.messenger.cta')}
                </Button>
              </Flexbox>
            </Flexbox>
          </Block>
        </div>
      </main>
    </div>
  );
});

DownloadsPage.displayName = 'DownloadsPage';

export default DownloadsPage;
