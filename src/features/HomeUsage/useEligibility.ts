import { useActiveWorkspaceId } from '@/business/client/hooks/useActiveWorkspaceId';
import { useActiveWorkspaceSlug } from '@/business/client/hooks/useActiveWorkspaceSlug';
import { useResolvedHomeAgentId } from '@/features/Home/AgentSelect/useResolvedHomeAgentId';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useAiInfraStore } from '@/store/aiInfra';
import { aiProviderSelectors } from '@/store/aiInfra/selectors';
import { useUserStore } from '@/store/user';
import { authSelectors, userProfileSelectors } from '@/store/user/selectors';

import { hasSingleSmaiKey } from './credentials';

export const useUsageEligibility = () => {
  const workspaceId = useActiveWorkspaceId();
  const workspaceSlug = useActiveWorkspaceSlug();
  const { agentId } = useResolvedHomeAgentId();
  // Avoid the model selector's default-provider fallback before config hydration.
  const provider = useAgentStore(
    (s) => agentSelectors.getAgentConfigById(agentId ?? '')(s)?.provider,
  );
  const config = useAiInfraStore(aiProviderSelectors.providerConfigById('smai'));
  const initialized = useAiInfraStore(aiProviderSelectors.isInitAiProviderRuntimeState);
  const userId = useUserStore(userProfileSelectors.userId);
  const loggedIn = useUserStore(authSelectors.isLogin);

  return {
    config,
    eligible: !!(
      !workspaceId &&
      !workspaceSlug &&
      loggedIn &&
      userId &&
      initialized &&
      provider === 'smai' &&
      hasSingleSmaiKey(config)
    ),
    userId,
  };
};
