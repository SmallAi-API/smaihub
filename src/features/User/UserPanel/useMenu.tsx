import { isDesktop } from '@lobechat/const';
import { Hotkey, Icon } from '@lobehub/ui';
import { BrainCircuit, HardDriveDownload, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import useBusinessMenuItems from '@/business/client/features/User/useBusinessMenuItems';
import { useActiveWorkspaceSlug } from '@/business/client/hooks/useActiveWorkspaceSlug';
import { type MenuProps } from '@/components/Menu';
import { DEFAULT_DESKTOP_HOTKEY_CONFIG } from '@/const/desktop';
import DataImporter from '@/features/DataImporter';
import WorkspaceLink from '@/features/Workspace/WorkspaceLink';
import { useNavLayout } from '@/hooks/useNavLayout';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

export const useMenu = () => {
  const { t } = useTranslation(['common', 'setting']);
  const isLogin = useUserStore(authSelectors.isLogin);
  const { userPanel } = useNavLayout();
  const businessMenuItems = useBusinessMenuItems(isLogin);
  const activeWorkspaceSlug = useActiveWorkspaceSlug();

  // In workspace context, route Settings to the workspace's settings root —
  // the route's index redirect (`/:slug/settings → /:slug/settings/general`)
  // handles tab landing, keeping this hook URL-agnostic. Personal context
  // falls back to user settings.
  const settingsHref = activeWorkspaceSlug ? `/${activeWorkspaceSlug}/settings` : '/settings';

  const settings: MenuProps['items'] = isLogin
    ? [
        {
          extra: isDesktop ? (
            <div>
              <Hotkey keys={DEFAULT_DESKTOP_HOTKEY_CONFIG.openSettings} />
            </div>
          ) : undefined,
          icon: <Icon icon={Settings2} />,
          key: 'setting',
          label: <Link to={settingsHref}>{t('userPanel.setting')}</Link>,
        },
      ]
    : [];

  const memoryItems: MenuProps['items'] = userPanel.showMemory
    ? [
        {
          icon: <Icon icon={BrainCircuit} />,
          key: 'memory',
          label: <WorkspaceLink to="/memory">{t('tab.memory')}</WorkspaceLink>,
        },
      ]
    : [];

  const mainItems = [
    {
      type: 'divider',
    },
    ...settings,
    ...memoryItems,
    ...businessMenuItems,
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

  return { mainItems };
};
