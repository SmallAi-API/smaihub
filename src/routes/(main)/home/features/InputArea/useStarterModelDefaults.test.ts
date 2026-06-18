import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NEW_CLAUDE_MODEL } from './starterModels';
import { useStarterModelDefaults } from './useStarterModelDefaults';

const mocks = vi.hoisted(() => ({
  enableBusinessFeatures: false,
}));

vi.mock('@/store/serverConfig', () => ({
  serverConfigSelectors: {
    enableBusinessFeatures: (state: { enableBusinessFeatures: boolean }) =>
      state.enableBusinessFeatures,
  },
  useServerConfigStore: <T>(selector: (state: { enableBusinessFeatures: boolean }) => T) =>
    selector({ enableBusinessFeatures: mocks.enableBusinessFeatures }),
}));

beforeEach(() => {
  mocks.enableBusinessFeatures = false;
});

describe('useStarterModelDefaults', () => {
  it('uses the OSS fallback home new model entries in the current product order', () => {
    const { result } = renderHook(() => useStarterModelDefaults());

    expect(NEW_CLAUDE_MODEL).toBe('claude-opus-4-8');
    expect(result.current.fallbackChatProvider).toBe('newapi');
    expect(result.current.defaultHomeNewModels).toEqual([
      {
        model: 'claude-opus-4-8',
        provider: 'smai',
        title: 'Claude 4.8 Opus',
        type: 'chat',
      },
      {
        model: 'gpt-5.5',
        provider: 'smai',
        title: 'GPT 5.5',
        type: 'chat',
      },
      {
        model: 'gpt-image-2',
        title: 'GPT Image 2',
        type: 'image',
      },
      {
        model: 'dreamina-seedance-2-0-260128',
        title: 'Seedance 2.0',
        type: 'video',
      },
    ]);
  });

  it('uses the business fallback home new model entries in the current product order', () => {
    mocks.enableBusinessFeatures = true;

    const { result } = renderHook(() => useStarterModelDefaults());

    expect(result.current.fallbackChatProvider).toBe('smai');
    expect(result.current.defaultHomeNewModels).toEqual([
      {
        model: 'claude-opus-4-8',
        provider: 'smai',
        title: 'Claude 4.8 Opus',
        type: 'chat',
      },
      {
        model: 'gpt-5.5',
        provider: 'smai',
        title: 'GPT 5.5',
        type: 'chat',
      },
      {
        model: 'gpt-image-2',
        title: 'GPT Image 2',
        type: 'image',
      },
      {
        model: 'dreamina-seedance-2-0-260128',
        title: 'Seedance 2.0',
        type: 'video',
      },
    ]);
  });
});
