import { isDesktop } from '@lobechat/const';
import { Flexbox, Hotkey, Icon, Tag } from '@lobehub/ui';
import { BrainCircuit, Download, HardDriveDownload, LogOut, Settings2 } from 'lucide-react';
import { memo, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import useBusinessMenuItems from '@/business/client/features/User/useBusinessMenuItems';
import { type MenuProps } from '@/components/Menu';
import { DEFAULT_DESKTOP_HOTKEY_CONFIG } from '@/const/desktop';
import DataImporter from '@/features/DataImporter';
import { useNavLayout } from '@/hooks/useNavLayout';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

const NewVersionBadge = memo(
  ({
    children,
    showBadge,
    onClick,
  }: PropsWithChildren & { onClick?: () => void; showBadge?: boolean }) => {
    const { t } = useTranslation('common');
    if (!showBadge)
      return (
        <Flexbox flex={1} onClick={onClick}>
          {children}
        </Flexbox>
      );
    return (
      <Flexbox horizontal align={'center'} flex={1} gap={8} width={'100%'} onClick={onClick}>
        {children}
        <Tag color={'info'} size={'small'} style={{ borderRadius: 16, paddingInline: 8 }}>
          {t('upgradeVersion.hasNew')}
        </Tag>
      </Flexbox>
    );
  },
);

export const useMenu = () => {
  const { t } = useTranslation(['common', 'setting', 'auth']);
  const [isLogin, isLoginWithAuth] = useUserStore((s) => [
    authSelectors.isLogin(s),
    authSelectors.isLoginWithAuth(s),
  ]);
  const { userPanel } = useNavLayout();
  const businessMenuItems = useBusinessMenuItems(isLogin);

  const settings: MenuProps['items'] = [
    {
      extra: isDesktop ? (
        <div>
          <Hotkey keys={DEFAULT_DESKTOP_HOTKEY_CONFIG.openSettings} />
        </div>
      ) : undefined,
      icon: <Icon icon={Settings2} />,
      key: 'setting',
      label: (
        <Link to="/settings">
          <NewVersionBadge>{t('userPanel.setting')}</NewVersionBadge>
        </Link>
      ),
    },
    ...(userPanel.showMemory
      ? [
          {
            icon: <Icon icon={BrainCircuit} />,
            key: 'memory',
            label: <Link to="/memory">{t('tab.memory')}</Link>,
          },
        ]
      : []),
  ];

  const getDesktopApp: MenuProps['items'] = [
    {
      icon: <Icon icon={Download} />,
      key: 'get-desktop-app',
      label: (
        <a href={'/download'} rel="noopener noreferrer" target="_blank">
          {t('getDesktopApp')}
        </a>
      ),
    },
  ];

  const mainItems = [
    {
      type: 'divider',
    },
    ...(isLogin ? settings : []),
    ...businessMenuItems,
    ...(!isDesktop ? [{ type: 'divider' as const }, ...getDesktopApp] : []),
    ...(userPanel.showDataImporter && isLogin
      ? [
          {
            icon: <Icon icon={HardDriveDownload} />,
            key: 'import',
            label: <DataImporter>{t('importData')}</DataImporter>,
          },
          {
            type: 'divider' as const,
          },
        ]
      : []),
  ]
    .filter(Boolean)
    // Remove consecutive dividers to prevent double divider lines
    .filter((item, index, arr) => {
      if (index === 0) return true;
      const isDivider = (i: any) => i && typeof i === 'object' && i.type === 'divider';
      return !(isDivider(item) && isDivider(arr[index - 1]));
    }) as MenuProps['items'];

  const logoutItems: MenuProps['items'] = isLoginWithAuth
    ? [
        {
          icon: <Icon icon={LogOut} />,
          key: 'logout',
          label: <span>{t('signout', { ns: 'auth' })}</span>,
        },
        {
          type: 'divider',
        },
      ]
    : [];

  return { logoutItems, mainItems };
};
