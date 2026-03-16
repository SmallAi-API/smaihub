'use client';

import { Flexbox, Icon, Tag } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { SquareArrowOutUpRight } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { isDesktop } from '@/const/version';
import { type NavItemProps } from '@/features/NavPanel/components/NavItem';
import NavItem from '@/features/NavPanel/components/NavItem';
import { useActiveTabKey } from '@/hooks/useActiveTabKey';
import { useNavLayout } from '@/hooks/useNavLayout';
import { electronSystemService } from '@/services/electron/system';
import { isModifierClick } from '@/utils/navigation';

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

const Nav = memo(() => {
  const tab = useActiveTabKey();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { topNavItems: items } = useNavLayout();

  const newBadge = (
    <Tag color="blue" size="small">
      {t('new')}
    </Tag>
  );

  return (
    <Flexbox gap={1} paddingInline={4}>
      {items.map((item) => {
        const isExternal = item.external || item.url?.startsWith('http');
        const externalUrl = isExternal ? item.url : undefined;
        const extra = item.isNew ? newBadge : isExternal ? externalIndicator : undefined;

        const content = (
          <NavItem
            active={tab === item.key}
            extra={extra}
            hidden={item.hidden}
            href={externalUrl}
            icon={item.icon as NavItemProps['icon']}
            title={item.title}
            onClick={externalUrl ? () => handleExternalLink(externalUrl) : item.onClick}
          />
        );

        if (!item.url || isExternal) return content;

        return (
          <Link
            key={item.key}
            to={item.url}
            onClick={(e) => {
              if (isModifierClick(e)) return;
              e.preventDefault();
              item?.onClick?.();
              if (item.url) {
                navigate(item.url);
              }
            }}
          >
            <NavItem
              active={tab === item.key}
              extra={extra}
              hidden={item.hidden}
              icon={item.icon as NavItemProps['icon']}
              title={item.title}
            />
          </Link>
        );
      })}
    </Flexbox>
  );
});

export default Nav;
