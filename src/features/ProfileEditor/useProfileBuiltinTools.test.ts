import { VideoGenerationIdentifier } from '@lobechat/builtin-tool-video-generation';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_FEATURE_FLAGS,
  type IFeatureFlagsState,
  mapFeatureFlagsEnvToState,
} from '@/config/featureFlags';
import { useFeatureGatedTools } from '@/hooks/useFeatureGatedTools';
import { useToolStore } from '@/store/tool';
import { builtinToolSelectors } from '@/store/tool/selectors';

import { resolveStalePluginCleanup } from './staleProfilePlugins';
import { useProfileBuiltinTools } from './useProfileBuiltinTools';

const mocks = vi.hoisted(() => ({
  setFeatureFlags: vi.fn<(featureFlags: IFeatureFlagsState) => void>(),
}));

vi.mock('@/store/serverConfig', async () => {
  const { create } = await import('zustand');
  const store = create<{ featureFlags: Partial<IFeatureFlagsState> }>(() => ({ featureFlags: {} }));
  mocks.setFeatureFlags.mockImplementation((featureFlags) => store.setState({ featureFlags }));
  return { useServerConfigStore: store, getServerConfigStoreState: store.getState };
});
vi.mock('@/store/tool', async () => {
  const { createWithEqualityFn } = await import('zustand/traditional');
  const { initialState } = await import('@/store/tool/initialState');
  const store = createWithEqualityFn(() => ({ ...initialState, uninstalledBuiltinTools: [] }));
  return { useToolStore: store };
});
vi.mock('@/store/tool/selectors', async () => {
  const { builtinToolSelectors } = await import('@/store/tool/slices/builtin/selectors');
  return { builtinToolSelectors };
});

const setEnabled = (enabled: boolean) => {
  mocks.setFeatureFlags(
    mapFeatureFlagsEnvToState({
      ...DEFAULT_FEATURE_FLAGS,
      video_generation_skill: enabled,
    }),
  );
};
const ids = (items: { identifier: string }[]) => items.map((item) => item.identifier);

describe('video skill rollout visibility', () => {
  beforeEach(() => setEnabled(false));

  it('reacts to flag changes without a catalog reload for settings and store lists', () => {
    const { result } = renderHook(() => useFeatureGatedTools((s) => s.builtinTools));
    expect(ids(result.current)).not.toContain(VideoGenerationIdentifier);
    expect(ids(result.current)).toContain('lobe-image-generation');
    act(() => setEnabled(true));
    expect(ids(result.current)).toContain(VideoGenerationIdentifier);
    act(() => setEnabled(false));
    expect(ids(result.current)).not.toContain(VideoGenerationIdentifier);
    expect(ids(useToolStore.getState().builtinTools)).toContain(VideoGenerationIdentifier);
  });

  it.each([false, true])(
    'hides the chat menu in manual mode %s and restores it when enabled',
    (manual) => {
      const selector = manual
        ? builtinToolSelectors.metaListIncludingHidden
        : builtinToolSelectors.metaList;
      const { result } = renderHook(() => useFeatureGatedTools(selector));
      expect(ids(result.current)).not.toContain(VideoGenerationIdentifier);
      act(() => setEnabled(true));
      expect(ids(result.current)).toContain(VideoGenerationIdentifier);
    },
  );

  it.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ])(
    'keeps saved profile pins with manual mode %s and broad picker %s',
    (manual, useAllMetaList) => {
      const { result } = renderHook(() => useProfileBuiltinTools(manual, useAllMetaList));
      expect(ids(result.current.profileBuiltinList)).not.toContain(VideoGenerationIdentifier);
      expect(
        result.current.nonProfileConfigurableBuiltinToolIdentifiers.has(VideoGenerationIdentifier),
      ).toBe(true);
      expect(ids(result.current.knownBuiltinList)).toContain(VideoGenerationIdentifier);
      expect(
        resolveStalePluginCleanup({
          canEditContent: true,
          canEditResource: true,
          isAccessResolved: true,
          isConnectorsInit: true,
          isToolCatalogSynced: true,
          plugins: [VideoGenerationIdentifier],
          validIdentifiers: new Set(ids(result.current.knownBuiltinList)),
        }),
      ).toBeNull();
      act(() => setEnabled(true));
      expect(ids(result.current.profileBuiltinList)).toContain(VideoGenerationIdentifier);
      expect(
        result.current.nonProfileConfigurableBuiltinToolIdentifiers.has(VideoGenerationIdentifier),
      ).toBe(false);
    },
  );

  it('retains inventory for historical lookups but removes discovery while disabled', () => {
    const state = useToolStore.getState();
    expect(ids(builtinToolSelectors.allMetaList(state))).toContain(VideoGenerationIdentifier);
    expect(ids(builtinToolSelectors.installedAllMetaList(state))).toContain(
      VideoGenerationIdentifier,
    );
    expect(ids(builtinToolSelectors.discoverableMetaList(state))).not.toContain(
      VideoGenerationIdentifier,
    );
    setEnabled(true);
    expect(ids(builtinToolSelectors.discoverableMetaList(state))).toContain(
      VideoGenerationIdentifier,
    );
  });
});
