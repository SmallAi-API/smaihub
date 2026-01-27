import { Avatar, Center } from '@lobehub/ui';
import { Badge } from 'antd';
import { memo, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import NavItem from '@/features/NavPanel/components/NavItem';
import { type AiProviderListItem } from '@/types/aiProvider';
import { getProviderLogoUrl } from '@/utils/providerLogo';

interface ProviderItemProps extends AiProviderListItem {
  onClick: (id: string) => void;
}

const ProviderItem = memo<ProviderItemProps>(({ id, name, enabled, onClick = () => {} }) => {
  const location = useLocation();

  // Extract providerId from pathname: /settings/provider/xxx -> xxx
  const activeKey = useMemo(() => {
    const pathParts = location.pathname.split('/');
    // pathname is like /settings/provider/all or /settings/provider/openai
    if (pathParts.length >= 4 && pathParts[2] === 'provider') {
      return pathParts[3];
    }
    return null;
  }, [location.pathname]);

  const providerIcon = (
    <Avatar
      alt={name || id}
      avatar={getProviderLogoUrl(id, name)}
      shape={'square'}
      size={22}
      style={{ borderRadius: 4 }}
    />
  );

  return (
    <NavItem
      active={activeKey === id}
      extra={
        enabled ? (
          <Center width={24}>
            <Badge status="success" />
          </Center>
        ) : undefined
      }
      icon={() => providerIcon}
      onClick={() => {
        onClick(id);
      }}
      title={name}
    />
  );
});
export default ProviderItem;
