import { FluentEmoji } from '@lobehub/fluent-emoji';
import { ActionIcon, Block, Flexbox, Icon, Progress, Text, Tooltip } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { ArrowUpRightIcon, RefreshCwIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import DataStatistics from '@/features/User/DataStatistics';
import type { SmaiUsageData } from '@/types/smaiUsage';

import { formatQuota, remainingPercent } from './formatQuota';

const styles = stylex.create({
  keyHint: { color: cssVar.colorTextSecondary, fontSize: 12 },
  metric: { flex: '1', minWidth: 0 },
  number: {
    color: cssVar.colorText,
    fontSize: 18,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 600,
    overflowWrap: 'anywhere',
  },
  secondaryNumber: { fontSize: 16 },
  stats: { color: cssVar.colorTextSecondary, fontSize: 12 },
  time: { color: cssVar.colorTextDescription, fontSize: 11 },
});

interface UsageCardProps {
  data: SmaiUsageData;
}

interface UsageCardActionsProps {
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  updatedAt: number;
}

export const UsageCardActions = ({ isRefreshing, onRefresh, updatedAt }: UsageCardActionsProps) => {
  const { t, i18n } = useTranslation('home');
  const locale = i18n.resolvedLanguage || 'en-US';
  const updated = new Date(updatedAt);

  return (
    <Flexbox horizontal align={'center'} gap={4} justify={'flex-end'}>
      <Tooltip title={updated.toLocaleString(locale)}>
        <time {...stylex.props(styles.time)} dateTime={updated.toISOString()}>
          {t('usage.updatedAt', {
            time: updated.toLocaleTimeString(locale, {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          })}
        </time>
      </Tooltip>
      <ActionIcon
        aria-label={t('usage.refresh')}
        disabled={isRefreshing}
        icon={RefreshCwIcon}
        loading={isRefreshing}
        size={'small'}
        title={t('usage.refresh')}
        onClick={onRefresh}
      />
    </Flexbox>
  );
};

export const UsageCard = ({ data }: UsageCardProps) => {
  const { t, i18n } = useTranslation('home');
  const locale = i18n.resolvedLanguage || 'en-US';
  const remaining = formatQuota(data.totalAvailable, data, locale, 2);
  const granted = formatQuota(data.totalGranted, data, locale, 2);
  const unit = granted.currency || t('usage.billingQuota');

  return (
    <Flexbox data-testid={'home-smai-usage'} gap={16}>
      <Flexbox gap={8}>
        <Block {...stylex.props(styles.metric)} gap={6} padding={8} variant={'filled'}>
          <Text {...stylex.props(styles.keyHint)}>{data.keyHint ?? 'sk-****'}</Text>
          <Tooltip
            title={
              data.unlimitedQuota
                ? t('usage.unlimitedHint')
                : `${remaining.exact} / ${granted.exact} ${unit}`
            }
          >
            {data.unlimitedQuota ? (
              <FluentEmoji aria-label={t('usage.unlimited')} emoji={'♾️'} role={'img'} size={22} />
            ) : (
              <Flexbox horizontal align={'center'} gap={4}>
                <span {...stylex.props(styles.number)}>{remaining.text}</span>
                <Text fontSize={16} type={'secondary'}>
                  /
                </Text>
                <span {...stylex.props(styles.number, styles.secondaryNumber)}>{granted.text}</span>
              </Flexbox>
            )}
          </Tooltip>
        </Block>
        {!data.unlimitedQuota && (
          <Progress
            aria-label={t('usage.remainingProgress')}
            format={(percent) => `${Math.round(percent)}%`}
            percent={remainingPercent(data.totalAvailable, data.totalGranted)}
            status={'active'}
            variant={'inset'}
          />
        )}
      </Flexbox>
      <Flexbox gap={8}>
        <Flexbox horizontal align={'center'} justify={'space-between'}>
          <Text fontSize={12} type={'secondary'}>
            {t('usage.topics')}
          </Text>
          <Link {...stylex.props(styles.stats)} to={'/settings/stats'}>
            <Flexbox horizontal align={'center'} gap={2}>
              {t('usage.details')}
              <Icon aria-hidden icon={ArrowUpRightIcon} size={12} />
            </Flexbox>
          </Link>
        </Flexbox>
        <DataStatistics paddingInline={0} style={{ marginBottom: 0 }} />
      </Flexbox>
    </Flexbox>
  );
};
