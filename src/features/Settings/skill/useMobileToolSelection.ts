import { isToolEnabledByFeatureFlags } from '@lobechat/builtin-tools/featureGates';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router';

import { useServerConfigStore } from '@/store/serverConfig';

import { MOBILE_SELECTION_PARAM, parseMobileSelection } from './mobileSelection';

/** Stacked details use the URL, independently of the desktop skill split's state. */
export const useMobileToolSelection = (stacked: boolean) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const featureFlags = useServerConfigStore((s) => s.featureFlags);
  const serverConfigInit = useServerConfigStore((s) => s.serverConfigInit);
  const selection = stacked
    ? parseMobileSelection(searchParams.get(MOBILE_SELECTION_PARAM))
    : undefined;
  const disabled =
    selection?.type === 'builtin' &&
    !isToolEnabledByFeatureFlags(selection.identifier, featureFlags);

  useEffect(() => {
    // Hide disabled details immediately, but keep their URL until the resolved
    // flags arrive. Catalog loading must not discard an otherwise valid link.
    if (!disabled || !serverConfigInit) return;
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        params.delete(MOBILE_SELECTION_PARAM);
        return params;
      },
      { replace: true },
    );
  }, [disabled, serverConfigInit, setSearchParams]);

  return disabled ? undefined : selection;
};
