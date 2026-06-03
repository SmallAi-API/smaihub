'use client';

import { FormGroup, Grid } from '@lobehub/ui';
import { Divider } from 'antd';
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
import { AssistantsRank, ModelsRank, TopicsRank } from './features/rankings';
import { AiHeatmaps } from './features/visualization';

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
  }, [dateStrings, mutate]);

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
        <Divider dashed />
        <AiHeatmaps mobile={mobile} />
        <Divider dashed />
        <Grid gap={16} rows={3} style={{ paddingBottom: 12 }}>
          <ModelsRank />
          <AssistantsRank mobile={mobile} />
          <TopicsRank mobile={mobile} />
        </Grid>
      </FormGroup>
    </>
  );
});

export default StatsSetting;
