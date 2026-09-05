import { createElement, type ReactNode } from 'react';

import { useResolvedHomeAgentId } from '@/features/Home/AgentSelect/useResolvedHomeAgentId';
import HomePromoBanner from '@/features/Home/HomePromoBanner';
import { useStarterModelDefaults } from '@/features/Home/NewModelShortcuts/useStarterModelDefaults';
import { usePermission } from '@/hooks/usePermission';

/**
 * The time-sensitive promotion spoken by Home's portrait.
 */
export const useHomePromoLine = (): ReactNode | undefined => {
  const { agentId } = useResolvedHomeAgentId();
  const { allowed } = usePermission('create_content');
  const { defaultHomeNewModels } = useStarterModelDefaults();

  if (!allowed || !agentId || !defaultHomeNewModels.some((item) => item.model === 'gpt-6-astra')) {
    return undefined;
  }

  return createElement(HomePromoBanner);
};
