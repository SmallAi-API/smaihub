import { Flexbox, Icon, Popover } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Fragment, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { isDesktop } from '@/const/version';
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

const BottomMenu = memo(() => {
  const tab = useActiveTabKey();
  const navigate = useNavigate();
  const { bottomMenuItems: items } = useNavLayout();

  return (
    <Flexbox
      gap={1}
      paddingBlock={4}
      style={{
        overflow: 'hidden',
      }}
    >
      {items.map((item) => {
        const isExternal = item.external || item.url?.startsWith('http');
        const externalUrl = isExternal ? item.url : undefined;

        const navItem = (
          <NavItem
            active={tab === item.key}
            extra={isExternal ? externalIndicator : undefined}
            href={externalUrl}
            icon={item.icon}
            title={item.title}
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

        if (!item.url || isExternal) return <Fragment key={item.key}>{content}</Fragment>;

        return (
          <Link
            key={item.key}
            to={item.url}
            onClick={(e) => {
              if (isModifierClick(e)) return;
              e.preventDefault();
              navigate(item.url!);
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
