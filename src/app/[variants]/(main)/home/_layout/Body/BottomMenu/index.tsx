import { Flexbox, Icon, Popover } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { BookOpenIcon, MessageCircle, SquareArrowOutUpRight } from 'lucide-react';
import { type ReactNode, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { getRouteById } from '@/config/routes';
import { isDesktop } from '@/const/version';
import NavItem, { type NavItemProps } from '@/features/NavPanel/components/NavItem';
import { useActiveTabKey } from '@/hooks/useActiveTabKey';
import { electronSystemService } from '@/services/electron/system';
import { SidebarTabKey } from '@/store/global/initialState';

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

interface Item {
  external?: boolean;
  extra?: NavItemProps['extra'];
  icon: any;
  key: string;
  onClick?: () => void;
  popoverContent?: ReactNode;
  title: string;
  url?: string;
}

const BottomMenu = memo(() => {
  const tab = useActiveTabKey();

  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const items = useMemo(
    () =>
      [
        {
          icon: getRouteById('settings')!.icon,
          key: SidebarTabKey.Setting,
          title: t('tab.setting'),
          url: '/settings',
        },
        {
          icon: getRouteById('resource')!.icon,
          key: SidebarTabKey.Resource,
          title: t('tab.resource'),
          url: '/resource',
        },
        {
          icon: getRouteById('memory')!.icon,
          key: SidebarTabKey.Memory,
          title: t('tab.memory'),
          url: '/memory',
        },
        {
          external: true,
          extra: externalIndicator,
          icon: BookOpenIcon,
          key: 'docs',
          title: t('tab.docs'),
          url: 'https://docs.smai.ai/zh/docs/apps/smallai',
        },
        {
          icon: MessageCircle,
          key: 'support',
          popoverContent: (
            <img
              alt={t('tab.support')}
              src="/kefu.png"
              style={{ borderRadius: 8, display: 'block', height: 'auto', width: 250 }}
            />
          ),
          title: t('tab.support'),
        },
      ].filter(Boolean) as Item[],
    [t],
  );

  return (
    <Flexbox
      gap={1}
      paddingBlock={4}
      style={{
        overflow: 'hidden',
      }}
    >
      {items.map((item) => {
        const isExternal = item.external === true || item.url?.startsWith('http') === true;
        const externalUrl = isExternal ? item.url : undefined;
        const navItem = (
          <NavItem
            active={tab === item.key}
            extra={item.extra}
            href={externalUrl}
            icon={item.icon}
            key={item.key}
            onClick={externalUrl ? () => handleExternalLink(externalUrl) : item.onClick}
            title={item.title}
          />
        );
        const content = item.popoverContent ? (
          <Popover
            content={item.popoverContent}
            mouseEnterDelay={0.1}
            placement="right"
            trigger="hover"
          >
            {navItem}
          </Popover>
        ) : (
          navItem
        );

        if (!item.url || isExternal) return content;
        const internalUrl = item.url;

        return (
          <Link
            key={item.key}
            onClick={(e) => {
              e.preventDefault();
              navigate(internalUrl);
            }}
            to={internalUrl}
          >
            <NavItem
              active={tab === item.key}
              extra={item.extra}
              icon={item.icon}
              title={item.title}
            />
          </Link>
        );
      })}
    </Flexbox>
  );
});

export default BottomMenu;
