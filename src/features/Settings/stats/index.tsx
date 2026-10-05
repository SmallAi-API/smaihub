'use client';

import { Grid } from '@lobehub/ui';
import { Divider } from '@lobehub/ui/base-ui';
import { Form } from '@lobehub/ui/base-ui/form';
import dayjs from 'dayjs';
import { memo, type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SettingHeader from '@/features/Settings/features/SettingHeader';
import { useClientDataSWR } from '@/libs/swr';
import { statsKeys } from '@/libs/swr/keys';
import { usageService } from '@/services/usage';

import {
  ShareButton,
  TotalAssistants,
  TotalMessages,
  TotalTokens,
  TotalTopics,
  Welcome,
} from './features/overview';
import { AssistantsRank, ModelsRank, TopicsRank } from './features/rankings';
import { AiHeatmaps } from './features/visualization';
import { type UserDisplayResolver } from './types';

interface StatsSettingProps {
  /**
   * Enable the "By User" group-by dimension in the Usage section. Only
   * meaningful when multiple users contribute to the data (i.e. workspace
   * mode). Combine with `resolveUser` to render names instead of opaque IDs.
   */
  enableUserDimension?: boolean;
  /**
   * Replace the personal Welcome banner (uses user nickname / registration
   * date) with a custom node. Pass `false` to drop the banner entirely.
   * When set (non-undefined), the personal ShareButton is also hidden because
   * the share link embeds user-identity context.
   */
  headerNode?: ReactNode | false;
  mobile?: boolean;
  /** Resolve userId → display info. Required when `enableUserDimension` is true. */
  resolveUser?: UserDisplayResolver;
  /** Render the standard personal-settings title and divider. */
  showSettingHeader?: boolean;
}

const StatsSetting = memo<StatsSettingProps>(({ mobile, headerNode, showSettingHeader = true }) => {
  const { t, i18n } = useTranslation('auth');
  dayjs.locale(i18n.language);

  const [dateStrings] = useState<string>();

  const { mutate } = useClientDataSWR(statsKeys.usageStat(), async () =>
    usageService.findAndGroupByDay(dateStrings),
  );

  useEffect(() => {
    if (dateStrings) {
      mutate();
    }
  }, [dateStrings, mutate]);

  return (
    <>
      {showSettingHeader && <SettingHeader title={t('tab.stats')} />}
      {/* ========== Header Section ========== */}
      <Form.Group
        collapsible={false}
        extra={headerNode === undefined ? <ShareButton /> : undefined}
        variant={'filled'}
        title={
          headerNode === undefined ? (
            <Welcome mobile={mobile} />
          ) : headerNode === false ? undefined : (
            headerNode
          )
        }
      >
        <Grid gap={8} maxItemWidth={150} rows={4}>
          <TotalAssistants mobile={mobile} />
          <TotalTopics mobile={mobile} />
          <TotalMessages mobile={mobile} />
          <TotalTokens />
        </Grid>
        <Divider dashed style={{ marginBlock: 24 }} />
        <AiHeatmaps mobile={mobile} />
        <Divider dashed style={{ marginBlock: 24 }} />
        <Grid gap={16} rows={3} style={{ paddingBottom: 12 }}>
          <ModelsRank />
          <AssistantsRank mobile={mobile} />
          <TopicsRank mobile={mobile} />
        </Grid>
      </Form.Group>
    </>
  );
});

export default StatsSetting;
