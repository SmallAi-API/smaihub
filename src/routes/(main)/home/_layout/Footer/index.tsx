/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useAnalytics } from '@lobehub/analytics/react';
import { ActionIcon, DropdownMenu, Icon, type MenuProps } from '@lobehub/ui';
import { Flexbox } from '@lobehub/ui';
import { AppWindow, Book, CircleHelp, FlaskConical, KeyRound, Settings2 } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import HighlightNotification from '@/components/HighlightNotification';
import ThemeButton from '@/features/User/UserPanel/ThemeButton';
import { useNavLayout } from '@/hooks/useNavLayout';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors/systemStatus';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

const PRODUCT_HUNT_NOTIFICATION = {
  actionHref: '/download',
  endTime: new Date('2026-02-15T00:00:00Z'),
  image: 'https://smaihub-1301925107.cos.ap-guangzhou.myqcloud.com/logo/windows.png',
  slug: 'smai.ai-desktop',
  startTime: new Date('2026-02-01T08:00:00Z'),
};

const Footer = memo(() => {
  const { t } = useTranslation('common');
  const { analytics } = useAnalytics();
  const { footer } = useNavLayout();
  const [isProductHuntCardOpen, setIsProductHuntCardOpen] = useState(false);
  const isDevMode = useUserStore((s) => userGeneralSettingsSelectors.config(s).isDevMode);
  const [isNotificationRead, updateSystemStatus] = useGlobalStore((s) => [
    systemStatusSelectors.isNotificationRead(PRODUCT_HUNT_NOTIFICATION.slug)(s),
    s.updateSystemStatus,
  ]);

  const isWithinTimeWindow = useMemo(() => {
    const now = new Date();
    return now >= PRODUCT_HUNT_NOTIFICATION.startTime && now <= PRODUCT_HUNT_NOTIFICATION.endTime;
  }, []);

  const trackProductHuntEvent = useCallback(
    (eventName: string, properties: Record<string, string>) => {
      try {
        analytics?.track({ name: eventName, properties });
      } catch {
        // silently ignore tracking errors to avoid affecting business logic
      }
    },
    [analytics],
  );

  useEffect(() => {
    if (isWithinTimeWindow && !isNotificationRead) {
      setIsProductHuntCardOpen(true);
      trackProductHuntEvent('product_hunt_card_viewed', {
        spm: 'homepage.product_hunt.viewed',
        trigger: 'auto',
      });
    }
  }, [isWithinTimeWindow, isNotificationRead, trackProductHuntEvent]);

  const handleOpenProductHuntCard = useCallback(() => {
    setIsProductHuntCardOpen(true);
    trackProductHuntEvent('product_hunt_card_viewed', {
      spm: 'homepage.product_hunt.viewed',
      trigger: 'menu_click',
    });
  }, [setIsProductHuntCardOpen, trackProductHuntEvent]);

  const handleCloseProductHuntCard = () => {
    setIsProductHuntCardOpen(false);
    if (!isNotificationRead) {
      const currentSlugs = useGlobalStore.getState().status.readNotificationSlugs || [];
      updateSystemStatus({
        readNotificationSlugs: [...currentSlugs, PRODUCT_HUNT_NOTIFICATION.slug],
      });
    }
    trackProductHuntEvent('product_hunt_card_closed', {
      spm: 'homepage.product_hunt.closed',
    });
  };

  const handleProductHuntActionClick = () => {
    trackProductHuntEvent('product_hunt_action_clicked', {
      spm: 'homepage.product_hunt.action_clicked',
    });
  };

  const helpMenuItems: MenuProps['items'] = useMemo(
    () => [
      ...(footer.showSettingsEntry
        ? [
            {
              icon: <Icon icon={Settings2} />,
              key: 'setting',
              label: <Link to="/settings">{t('userPanel.setting')}</Link>,
            },
            {
              type: 'divider' as const,
            },
          ]
        : []),
      {
        icon: <Icon icon={KeyRound} />,
        key: 'apiKey',
        label: (
          <a href="https://api.smai.ai" rel="noopener noreferrer" target="_blank">
            {t('tab.apiAccess')}
          </a>
        ),
      },
      {
        icon: <Icon icon={Book} />,
        key: 'docs',
        label: (
          <a
            href="https://docs.smai.ai/zh/docs/apps/smallai"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('tab.docs')}
          </a>
        ),
      },
      ...(isDevMode
        ? [
            {
              icon: <Icon icon={FlaskConical} />,
              key: 'eval',
              label: <Link to="/eval">Evaluation Lab</Link>,
            },
          ]
        : []),
      ...(isWithinTimeWindow
        ? [
            {
              icon: <Icon icon={AppWindow} />,
              key: 'productHunt',
              label: 'Windows 客户端',
              onClick: handleOpenProductHuntCard,
            },
          ]
        : []),
    ],
    [
      footer.showSettingsEntry,
      footer.layout,
      footer.showEvalEntry,
      t,
      isWithinTimeWindow,
      handleOpenProductHuntCard,
    ],
  );

  return (
    <>
      {footer.layout === 'expanded' ? (
        <Flexbox horizontal align={'center'} gap={2} justify={'space-between'} padding={8}>
          <Flexbox horizontal align={'center'} flex={1} gap={2}>
            <DropdownMenu items={helpMenuItems} placement="topLeft">
              <ActionIcon aria-label={t('userPanel.help')} icon={CircleHelp} size={16} />
            </DropdownMenu>
            <Link to="/eval">
              <ActionIcon icon={FlaskConical} size={16} title="Evaluation Lab" />
            </Link>
          </Flexbox>
          <ThemeButton placement={'topCenter'} size={16} />
        </Flexbox>
      ) : (
        <Flexbox horizontal align={'center'} gap={2} padding={8}>
          <DropdownMenu items={helpMenuItems} placement="topLeft">
            <ActionIcon aria-label={t('userPanel.help')} icon={CircleHelp} size={16} />
          </DropdownMenu>
        </Flexbox>
      )}

      <HighlightNotification
        actionHref={PRODUCT_HUNT_NOTIFICATION.actionHref}
        actionLabel={t('productHunt.actionLabel')}
        description={t('productHunt.description')}
        image={PRODUCT_HUNT_NOTIFICATION.image}
        open={isProductHuntCardOpen}
        title={t('productHunt.title')}
        onActionClick={handleProductHuntActionClick}
        onClose={handleCloseProductHuntCard}
      />
    </>
  );
});

export default Footer;
