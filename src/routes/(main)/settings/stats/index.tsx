'use client';

import { FormGroup, Grid } from '@lobehub/ui';
import dayjs from 'dayjs';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useClientDataSWR } from '@/libs/swr';
import SettingHeader from '@/routes/(main)/settings/features/SettingHeader';
import { usageService } from '@/services/usage';

import {
  ShareButton,
  TotalAssistants,
  TotalMessages,
  TotalTopics,
  TotalWords,
  Welcome,
} from './features/overview';

const StatsSetting = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t, i18n } = useTranslation('auth');
  dayjs.locale(i18n.language);

  const [dateStrings] = useState<string>();

  const { mutate } = useClientDataSWR('usage-stat', async () =>
    usageService.findAndGroupByDay(dateStrings),
  );

  useEffect(() => {
    if (dateStrings) {
      mutate();
    }
  }, [dateStrings]);

  return (
    <>
      <SettingHeader title={t('tab.stats')} />
      {/* ========== Header Section ========== */}
      <FormGroup
        collapsible={false}
        extra={<ShareButton />}
        gap={16}
        title={<Welcome mobile={mobile} />}
        variant={'filled'}
      >
        <Grid gap={8} maxItemWidth={150} rows={4}>
          <TotalAssistants mobile={mobile} />
          <TotalTopics mobile={mobile} />
          <TotalMessages mobile={mobile} />
          <TotalWords />
        </Grid>
      </FormGroup>
    </>
  );
});

export default StatsSetting;
