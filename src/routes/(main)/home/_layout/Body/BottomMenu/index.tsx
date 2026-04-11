import { type MenuProps } from '@lobehub/ui';
import { ActionIcon, DropdownMenu, Flexbox, Icon, Popover } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import {
  EyeOffIcon,
  MoreHorizontalIcon,
  SlidersHorizontalIcon,
  SquareArrowOutUpRight,
} from 'lucide-react';
import { Fragment, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { isDesktop } from '@/const/version';
import NavItem from '@/features/NavPanel/components/NavItem';
import { useActiveTabKey } from '@/hooks/useActiveTabKey';
import { useNavLayout } from '@/hooks/useNavLayout';
import { openCustomizeSidebarModal } from '@/routes/(main)/home/_layout/Body/CustomizeSidebarModal';
import { electronSystemService } from '@/services/electron/system';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { isModifierClick } from '@/utils/navigation';
import { prefetchRoute } from '@/utils/router';

const handleExternalLink = (url: string) => {
  if (isDesktop) {
    void electronSystemService.openExternalLink(url);
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
};

const externalIndicator = (
  <Icon color={cssVar.colorTextQuaternary} icon={SquareArrowOutUpRight} size={14} />
);

const BottomMenu = memo(() => {
  const { t } = useTranslation('common');
  const tab = useActiveTabKey();
  const navigate = useNavigate();
  const { bottomMenuItems: items } = useNavLayout();
  const [hiddenSections, updateSystemStatus] = useGlobalStore((s) => [
    systemStatusSelectors.hiddenSidebarSections(s),
    s.updateSystemStatus,
  ]);

  const hideSection = useCallback(
    (key: string) => {
      updateSystemStatus({ hiddenSidebarSections: [...hiddenSections, key] });
    },
    [hiddenSections, updateSystemStatus],
  );

  const getContextMenuItems = useCallback(
    (key: string): MenuProps['items'] => [
      {
        icon: <Icon icon={EyeOffIcon} />,
        key: 'hideSection',
        label: t('navPanel.hideSection'),
        onClick: () => hideSection(key),
      },
      { type: 'divider' as const },
      {
        icon: <Icon icon={SlidersHorizontalIcon} />,
        key: 'customizeSidebar',
        label: t('navPanel.customizeSidebar'),
        onClick: () => openCustomizeSidebarModal(),
      },
    ],
    [t, hideSection],
  );

  const visibleItems = items.filter((item) => !item.hidden && !hiddenSections.includes(item.key));

  if (visibleItems.length === 0) return null;

  return (
    <Flexbox
      gap={1}
      paddingBlock={4}
      style={{
        marginTop: 12,
        overflow: 'hidden',
      }}
    >
      {visibleItems.map((item) => {
        const contextMenuItems = getContextMenuItems(item.key);
        const isExternal = item.external || item.url?.startsWith('http');
        const externalUrl = isExternal ? item.url : undefined;

        const navItem = (
          <NavItem
            active={tab === item.key}
            contextMenuItems={contextMenuItems}
            extra={isExternal ? externalIndicator : undefined}
            href={externalUrl}
            icon={item.icon}
            title={item.title}
            actions={
              <DropdownMenu items={contextMenuItems} nativeButton={false}>
                <ActionIcon icon={MoreHorizontalIcon} size={'small'} style={{ flex: 'none' }} />
              </DropdownMenu>
            }
            onClick={externalUrl ? () => handleExternalLink(externalUrl) : item.onClick}
          />
        );

        const content = item.popoverImageSrc ? (
          <Popover
            mouseEnterDelay={0.1}
            placement="right"
            trigger="hover"
            content={
              <img
                alt={item.title}
                src={item.popoverImageSrc}
                style={{ borderRadius: 8, display: 'block', height: 'auto', width: 250 }}
              />
            }
          >
            {navItem}
          </Popover>
        ) : (
          navItem
        );

        const internalUrl = item.url;

        if (!internalUrl || isExternal) return <Fragment key={item.key}>{content}</Fragment>;

        return (
          <Link
            key={item.key}
            to={internalUrl}
            onMouseEnter={() => prefetchRoute(internalUrl)}
            onClick={(e) => {
              if (isModifierClick(e)) return;
              e.preventDefault();
              navigate(internalUrl);
            }}
          >
            {content}
          </Link>
        );
      })}
    </Flexbox>
  );
});

export default BottomMenu;
