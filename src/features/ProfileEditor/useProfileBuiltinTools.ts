import isEqual from 'fast-deep-equal';
import { useMemo } from 'react';

import { useFeatureGatedTools } from '@/hooks/useFeatureGatedTools';
import { useServerConfigStore } from '@/store/serverConfig';
import { useToolStore } from '@/store/tool';
import { builtinToolSelectors } from '@/store/tool/selectors';

export const useNonProfileConfigurableBuiltinToolIds = (isManualMode: boolean) => {
  const featureFlags = useServerConfigStore((s) => s.featureFlags);
  return useToolStore(
    builtinToolSelectors.nonProfileConfigurableBuiltinToolIds({ featureFlags, isManualMode }),
    isEqual,
  );
};

export const useProfileBuiltinTools = (isManualMode: boolean, useAllMetaList: boolean) => {
  const featureFlags = useServerConfigStore((s) => s.featureFlags);
  // Rollout-disabled tools remain known so stale-plugin cleanup cannot erase their saved pins.
  const knownBuiltinList = useToolStore(builtinToolSelectors.installedAllMetaList, isEqual);
  const profileBuiltinList = useFeatureGatedTools(
    useAllMetaList
      ? builtinToolSelectors.installedProfileConfigurableMetaList({ featureFlags, isManualMode })
      : builtinToolSelectors.metaList,
  );
  const excludedIds = useNonProfileConfigurableBuiltinToolIds(isManualMode);
  const nonProfileConfigurableBuiltinToolIdentifiers = useMemo(
    () => new Set(excludedIds),
    [excludedIds],
  );

  return { knownBuiltinList, nonProfileConfigurableBuiltinToolIdentifiers, profileBuiltinList };
};
