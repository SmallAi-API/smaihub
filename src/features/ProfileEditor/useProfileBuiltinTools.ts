import isEqual from 'fast-deep-equal';
import { useMemo } from 'react';

import { useFeatureGatedTools } from '@/hooks/useFeatureGatedTools';
import { useServerConfigStore } from '@/store/serverConfig';
import { useToolStore } from '@/store/tool';
import { builtinToolSelectors } from '@/store/tool/selectors';

export const useProfileBuiltinTools = (useAllMetaList: boolean) => {
  const featureFlags = useServerConfigStore((s) => s.featureFlags);
  // Rollout-disabled tools remain known so stale-plugin cleanup cannot erase their saved pins.
  const knownBuiltinList = useToolStore(builtinToolSelectors.installedAllMetaList, isEqual);
  const profileBuiltinList = useFeatureGatedTools(
    useAllMetaList
      ? (state) => builtinToolSelectors.installedProfileConfigurableMetaList(state, featureFlags)
      : builtinToolSelectors.metaList,
  );
  const excludedIds = useToolStore(
    (state) => builtinToolSelectors.nonProfileConfigurableBuiltinToolIds(state, featureFlags),
    isEqual,
  );
  const nonProfileConfigurableBuiltinToolIdentifiers = useMemo(
    () => new Set(excludedIds),
    [excludedIds],
  );

  return { knownBuiltinList, nonProfileConfigurableBuiltinToolIdentifiers, profileBuiltinList };
};
