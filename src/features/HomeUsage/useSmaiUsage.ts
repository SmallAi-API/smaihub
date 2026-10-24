import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { useActiveWorkspaceSlug } from '@/business/client/hooks/useActiveWorkspaceSlug';
import { mutate as mutateScoped, useClientDataSWR } from '@/libs/swr';
import { homeUsageKeys, statsKeys } from '@/libs/swr/keys';
import { aiProviderService } from '@/services/aiProvider';
import type { SmaiUsageResult } from '@/types/smaiUsage';

import { getUsageIdentity } from './credentials';
import { getSmaiUsageRevision, subscribeSmaiUsageChanged } from './events';
import { USAGE_POLL_INTERVAL, USAGE_SETTLEMENT_DELAY } from './refreshPolicy';
import { useUsageEligibility } from './useEligibility';

const canUseNetwork = () => document.visibilityState === 'visible' && navigator.onLine;

export const useSmaiUsage = (enabled: boolean) => {
  const { config, eligible, userId } = useUsageEligibility();
  const { pathname } = useLocation();
  const activeSlug = useActiveWorkspaceSlug();
  const home =
    pathname === '/' ||
    (!!activeSlug && (pathname === `/${activeSlug}` || pathname === `/${activeSlug}/`));
  const [networkVisible, setNetworkVisible] = useState(canUseNetwork);
  const identity = config && userId ? getUsageIdentity(config, userId) : undefined;
  const policy = identity?.policy;
  const active = enabled && eligible && home && networkVisible;

  const { data, isValidating, mutate } = useClientDataSWR<SmaiUsageResult>(
    active && identity ? homeUsageKeys.quota(userId!, identity.id) : null,
    () => policy!.request(() => aiProviderService.getSmaiUsage(), getSmaiUsageRevision()),
    {
      dedupingInterval: 0,
      keepPreviousData: false,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  useEffect(() => {
    const update = () => setNetworkVisible(canUseNetwork());
    update();
    document.addEventListener('visibilitychange', update);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      document.removeEventListener('visibilitychange', update);
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  useEffect(() => {
    if (!active || !policy) return;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    let dueAt = Infinity;

    const schedule = (delay: number) => {
      if (disposed || policy.paused) return;
      const next = Date.now() + Math.max(delay, policy.nextAllowedAt - Date.now(), 0);
      // A burst of completions cannot postpone a refresh indefinitely.
      if (next >= dueAt) return;
      clearTimeout(timer);
      dueAt = next;
      timer = setTimeout(
        async () => {
          dueAt = Infinity;
          if (disposed || !canUseNetwork()) return;
          const before = policy.handledRevision;
          await mutate();
          if (disposed) return;
          if (policy.result?.available && before !== policy.handledRevision) {
            // Same counters as settings/profile; update only after a real refresh.
            void Promise.allSettled([
              mutateScoped(statsKeys.countAgents()),
              mutateScoped(statsKeys.countTopics()),
              mutateScoped(statsKeys.countMessages()),
            ]);
          }
          const dirty = getSmaiUsageRevision() > policy.handledRevision;
          schedule(dirty ? USAGE_SETTLEMENT_DELAY : USAGE_POLL_INTERVAL + Math.random() * 15_000);
        },
        Math.max(0, next - Date.now()),
      );
    };

    const focus = () => {
      if (canUseNetwork() && policy.needsRefresh(getSmaiUsageRevision())) schedule(0);
    };
    const unsubscribe = subscribeSmaiUsageChanged(() => schedule(USAGE_SETTLEMENT_DELAY));
    window.addEventListener('focus', focus);
    schedule(policy.needsRefresh(getSmaiUsageRevision()) ? 0 : USAGE_POLL_INTERVAL);
    return () => {
      disposed = true;
      clearTimeout(timer);
      unsubscribe();
      window.removeEventListener('focus', focus);
    };
  }, [active, policy, mutate]);

  const refresh = async () => {
    if (!active || !policy) return;
    policy.resume();
    await mutate();
  };

  return {
    data: active && data?.available ? data.data : undefined,
    isLoading: active && !data && policy?.result === undefined,
    isRefreshing: isValidating,
    refresh,
  };
};
