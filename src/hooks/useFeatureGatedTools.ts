import { isToolEnabledByFeatureFlags } from '@lobechat/builtin-tools/featureGates';
import isEqual from 'fast-deep-equal';

import { useServerConfigStore } from '@/store/serverConfig';
import { useToolStore } from '@/store/tool';
import type { ToolStoreState } from '@/store/tool/initialState';

/** Subscribe to rollout changes as well as catalog changes; keep the stored inventory intact. */
export const useFeatureGatedTools = <T extends { identifier: string }>(
  selector: (state: ToolStoreState) => T[],
): T[] => {
  const flags = useServerConfigStore((s) => s.featureFlags);
  return useToolStore(
    (state) =>
      selector(state).filter((tool) => isToolEnabledByFeatureFlags(tool.identifier, flags)),
    isEqual,
  );
};
