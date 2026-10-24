import type { ReactNode } from 'react';
import { createElement } from 'react';

import { UsageCard, UsageCardActions } from '@/features/HomeUsage/UsageCard';
import { UsageCardSkeleton } from '@/features/HomeUsage/UsageCardSkeleton';
import { useUsageEligibility } from '@/features/HomeUsage/useEligibility';
import { useSmaiUsage } from '@/features/HomeUsage/useSmaiUsage';

/**
 * Whether the home usage widget exists for this deployment/viewer. Gates the
 * customize-panel switch and the rail-visibility math, so an unavailable
 * widget never leaves a dead toggle or an empty rail behind.
 */
export const useHomeUsageWidgetActive = (): boolean => useUsageEligibility().eligible;

/**
 * The usage widget's content, rendered as the last card of Home's rail.
 * `enabled` is false while the widget is switched off or its column is not on
 * the page, so implementations can skip fetching. While the first eligible request
 * is pending, a layout-matched skeleton is returned; unavailable responses
 * still render no card.
 */
export interface HomeUsageWidgetContent {
  action?: ReactNode;
  node: ReactNode;
}

export const useHomeUsageWidget = (enabled: boolean): HomeUsageWidgetContent | undefined => {
  const { data, isLoading, isRefreshing, refresh } = useSmaiUsage(enabled);

  if (!enabled) return undefined;
  if (isLoading) return { node: createElement(UsageCardSkeleton) };

  // The user explicitly requests no empty/error shell on a failed query.
  if (!data) return undefined;

  return {
    action: createElement(UsageCardActions, {
      isRefreshing,
      onRefresh: refresh,
      updatedAt: data.updatedAt,
    }),
    node: createElement(UsageCard, { data }),
  };
};
