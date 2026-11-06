import { BRANDING_PROVIDER } from '@lobechat/business-const';
import { Avatar, cssVar, Divider, Flexbox, Skeleton, Tag, Text } from '@lobehub/ui';
import * as stylex from '@stylexjs/stylex';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useIsDark } from '@/hooks/useIsDark';
import { type AiProviderListItem } from '@/types/aiProvider';
import { getProviderLogoUrl } from '@/utils/providerLogo';

import EnableSwitch from './EnableSwitch';
import { styles } from './style';

const isCodingPlanProvider = (id: string) => id.endsWith('codingplan');

interface ProviderCardProps extends AiProviderListItem {
  loading?: boolean;
  onProviderSelect: (provider: string) => void;
}
const ProviderCard = memo<ProviderCardProps>(
  ({ id, description, name, enabled, source, loading, onProviderSelect }) => {
    const { t } = useTranslation('providers');
    const isDarkMode = useIsDark();

    if (loading)
      return (
        <Flexbox
          gap={24}
          padding={16}
          className={
            stylex.props(isDarkMode ? styles.containerDark : styles.containerLight).className
          }
        >
          <Skeleton />
        </Flexbox>
      );

    return (
      <Flexbox
        gap={24}
        className={
          stylex.props(isDarkMode ? styles.containerDark : styles.containerLight).className
        }
      >
        <Flexbox gap={12} padding={16} width={'100%'}>
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => {
              onProviderSelect(id);
            }}
          >
            <Flexbox gap={12} width={'100%'}>
              <Flexbox horizontal align={'center'} justify={'space-between'}>
                <Flexbox horizontal align={'center'} gap={12}>
                  <Avatar alt={name || id} avatar={getProviderLogoUrl(id, name)} size={28} />
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{name || id}</Text>
                  {isCodingPlanProvider(id) && <Tag color={'geekblue'}>{'Coding Plan'}</Tag>}
                </Flexbox>
              </Flexbox>
              <Text
                className={stylex.props(styles.desc).className}
                ellipsis={{
                  rows: 2,
                }}
              >
                {source === 'custom'
                  ? description
                  : description && t(`${id}.description`, { defaultValue: description })}
              </Text>
            </Flexbox>
          </div>
          <Divider style={{ margin: '4px 0' }} />
          <Flexbox horizontal justify={'space-between'}>
            <div />
            <EnableSwitch enabled={enabled} id={id} />
          </Flexbox>
        </Flexbox>
      </Flexbox>
    );
  },
);

export default ProviderCard;
