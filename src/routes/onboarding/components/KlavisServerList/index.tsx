'use client';

import { Alert, Flexbox, Grid, ScrollShadow } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { KLAVIS_SERVER_TYPES } from '@/const/index';
import { serverConfigSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useToolStore } from '@/store/tool';
import { klavisStoreSelectors } from '@/store/tool/slices/klavisStore';
import { useUserStore } from '@/store/user';
import { keyVaultsConfigSelectors } from '@/store/user/selectors';

import KlavisServerItem from './components/KlavisServerItem';

const KlavisServerList = memo(() => {
  const { t } = useTranslation('tool');
  const allKlavisServers = useToolStore(klavisStoreSelectors.getServers, isEqual);
  const useFetchUserKlavisServers = useToolStore((s) => s.useFetchUserKlavisServers);
  const klavisRequiresUserKey = useServerConfigStore(serverConfigSelectors.klavisRequiresUserKey);
  const userKlavisKey = useUserStore(
    (s) => keyVaultsConfigSelectors.getVaultByProvider('klavis')(s)?.apiKey,
  );

  useFetchUserKlavisServers(true);

  const getServerByIdentifier = (identifier: string) =>
    allKlavisServers.find((server) => server.identifier === identifier);

  const showKeyBanner = klavisRequiresUserKey && !userKlavisKey;

  return (
    <Flexbox gap={12}>
      {showKeyBanner && (
        <Alert
          showIcon
          action={<Link to={'/settings/creds'}>{t('klavis.errors.apiKeyRequiredCTA')}</Link>}
          message={t('klavis.errors.apiKeyRequired')}
          type={'warning'}
        />
      )}
      <ScrollShadow height={'33vh'} offset={8} size={12}>
        <Grid gap={8} maxItemWidth={120} rows={2}>
          {KLAVIS_SERVER_TYPES.map((type) => (
            <KlavisServerItem
              icon={type.icon}
              identifier={type.identifier}
              key={type.identifier}
              label={type.label}
              server={getServerByIdentifier(type.identifier)}
              serverName={type.serverName}
            />
          ))}
        </Grid>
      </ScrollShadow>
    </Flexbox>
  );
});

KlavisServerList.displayName = 'KlavisServerList';

export default KlavisServerList;
