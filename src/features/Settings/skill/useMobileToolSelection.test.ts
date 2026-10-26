import { VideoGenerationIdentifier } from '@lobechat/builtin-tool-video-generation';
import { act, renderHook } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useServerConfigStore } from '@/store/serverConfig';

import { useMobileToolSelection } from './useMobileToolSelection';

vi.mock('@/store/serverConfig', async () => {
  const { create } = await import('zustand');
  return {
    useServerConfigStore: create(() => ({
      featureFlags: { enableVideoGenerationSkill: false },
      serverConfigInit: true,
    })),
  };
});

const videoQuery = `open=builtin:${VideoGenerationIdentifier}`;

const setVideoEnabled = (enableVideoGenerationSkill: boolean) =>
  useServerConfigStore.setState((s) => ({
    featureFlags: { ...s.featureFlags, enableVideoGenerationSkill },
  }));

const renderSelection = (query: string, mobile = true) =>
  renderHook(
    () => ({
      location: useLocation(),
      navigate: useNavigate(),
      selection: useMobileToolSelection(mobile),
    }),
    {
      wrapper: ({ children }: PropsWithChildren) =>
        createElement(
          MemoryRouter,
          {
            initialEntries: ['/settings', `/settings/connector?${query}`],
            initialIndex: 1,
          },
          children,
        ),
    },
  );

beforeEach(() => {
  setVideoEnabled(false);
  useServerConfigStore.setState({ serverConfigInit: true });
});

describe('useMobileToolSelection', () => {
  it('rejects a deep link to a disabled builtin before mounting its detail', () => {
    const { result } = renderSelection(videoQuery);

    expect(result.current.selection).toBeUndefined();
    expect(result.current.location.search).toBe('');
  });

  it('closes an open detail when its feature flag turns off', () => {
    setVideoEnabled(true);
    const { result } = renderSelection(videoQuery);

    expect(result.current.selection?.identifier).toBe(VideoGenerationIdentifier);
    act(() => setVideoEnabled(false));

    expect(result.current.selection).toBeUndefined();
    expect(result.current.location.search).toBe('');
  });

  it('preserves the deep link until configuration finishes loading', () => {
    useServerConfigStore.setState({ serverConfigInit: false });
    const { result } = renderSelection(videoQuery);

    expect(result.current.selection).toBeUndefined();
    expect(result.current.location.search).toContain('open=');

    act(() => {
      setVideoEnabled(true);
      useServerConfigStore.setState({ serverConfigInit: true });
    });

    expect(result.current.selection?.identifier).toBe(VideoGenerationIdentifier);
    expect(result.current.location.search).toContain('open=');
  });

  it('cleans up a disabled deep link once configuration has resolved', () => {
    useServerConfigStore.setState({ serverConfigInit: false });
    const { result } = renderSelection(videoQuery);

    act(() => useServerConfigStore.setState({ serverConfigInit: true }));

    expect(result.current.selection).toBeUndefined();
    expect(result.current.location.search).toBe('');
  });

  it('replaces the invalid detail without adding a history entry or dropping other params', () => {
    const { result } = renderSelection(`${videoQuery}&filter=installed`);

    expect(result.current.location.search).toBe('?filter=installed');
    act(() => result.current.navigate(-1));
    expect(result.current.location.pathname).toBe('/settings');
  });

  it.each(['agent-skill', 'builtin-skill', 'mcp-connector'])(
    'keeps a %s detail independent of builtin tool flags',
    (type) => {
      const { result } = renderSelection(`open=${type}:${VideoGenerationIdentifier}`);

      expect(result.current.selection).toEqual({ identifier: VideoGenerationIdentifier, type });
      expect(result.current.location.search).toContain('open=');
    },
  );

  it('keeps an ungated builtin deep link without waiting for the tool catalog', () => {
    const { result } = renderSelection('open=builtin:lobe-web-browsing');

    expect(result.current.selection).toEqual({
      identifier: 'lobe-web-browsing',
      type: 'builtin',
    });
    expect(result.current.location.search).toContain('open=');
  });

  it('leaves desktop selection and URL handling alone', () => {
    const { result } = renderSelection(videoQuery, false);

    expect(result.current.selection).toBeUndefined();
    expect(result.current.location.search).toContain('open=');
  });
});
