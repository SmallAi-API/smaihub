import type * as LobechatConstModule from '@lobechat/const';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useElectronStore } from '@/store/electron';

import { useAvatarUrl } from './useAvatarUrl';

vi.mock('zustand/traditional');

const mockConstEnv = vi.hoisted(() => ({ isDesktop: false }));

vi.mock('@lobechat/const', async (importOriginal) => {
  const actual = await importOriginal<typeof LobechatConstModule>();
  return {
    ...actual,
    get isDesktop() {
      return mockConstEnv.isDesktop;
    },
    OFFICIAL_URL: 'https://app.lobehub.com',
  };
});

const setDesktopCloud = () => {
  mockConstEnv.isDesktop = true;
  act(() => {
    useElectronStore.setState({
      dataSyncConfig: { remoteServerUrl: '', storageMode: 'cloud' },
    });
  });
};

describe('useAvatarUrl', () => {
  it('should return undefined when no avatar is given', () => {
    setDesktopCloud();

    const { result } = renderHook(() => useAvatarUrl(undefined));

    expect(result.current).toBeUndefined();
  });

  it('should pass through root-relative avatars on web', () => {
    mockConstEnv.isDesktop = false;
    act(() => {
      useElectronStore.setState({
        dataSyncConfig: { remoteServerUrl: 'https://server.com', storageMode: 'cloud' },
      });
    });

    const { result } = renderHook(() => useAvatarUrl('/api/avatar.png'));

    expect(result.current).toBe('/api/avatar.png');
  });

  it('should prefix a server-backed path on desktop', () => {
    setDesktopCloud();

    const { result } = renderHook(() => useAvatarUrl('/api/avatar.png'));

    expect(result.current).toBe('https://app.lobehub.com/api/avatar.png');
  });

  // Regression: prefixing these turned a local disk read into a network request.
  // On a flaky connection the <img> errored and @lobehub/ui fell back to the
  // title's initials — the agent rendered as "SM" instead of its avatar.
  it.each(['/logo.png', '/avatars/agent-default.png', '/icons/icon-192x192.png'])(
    'should leave bundled asset %s local on desktop',
    (avatar) => {
      setDesktopCloud();

      const { result } = renderHook(() => useAvatarUrl(avatar));

      expect(result.current).toBe(avatar);
    },
  );

  // Regression: an uploaded avatar is stored as `/f/<fileId>`, an auth-guarded
  // route. Prefixing it produced a bare cross-origin <img> with no credentials,
  // which 404s. It must stay root-relative so the desktop backend proxy can
  // intercept it and inject Oidc-Auth.
  it('should leave the uploaded-file proxy path local on desktop', () => {
    setDesktopCloud();

    const { result } = renderHook(() => useAvatarUrl('/f/file_abc123'));

    expect(result.current).toBe('/f/file_abc123');
  });

  it('should not treat a server path that merely contains a bundled segment as bundled', () => {
    setDesktopCloud();

    const { result } = renderHook(() => useAvatarUrl('/api/avatars/uploaded.png'));

    expect(result.current).toBe('https://app.lobehub.com/api/avatars/uploaded.png');
  });

  it('should return emoji and absolute avatars unchanged on desktop', () => {
    setDesktopCloud();

    const { result: emoji } = renderHook(() => useAvatarUrl('😀'));
    const { result: absolute } = renderHook(() => useAvatarUrl('https://example.com/avatar.png'));
    const { result: dataUri } = renderHook(() => useAvatarUrl('data:image/png;base64,abc'));

    expect(emoji.current).toBe('😀');
    expect(absolute.current).toBe('https://example.com/avatar.png');
    expect(dataUri.current).toBe('data:image/png;base64,abc');
  });

  it('should return original avatar when desktop has no remote server URL', () => {
    mockConstEnv.isDesktop = true;
    act(() => {
      useElectronStore.setState({
        dataSyncConfig: { remoteServerUrl: '', storageMode: 'selfHost' },
      });
    });

    const { result } = renderHook(() => useAvatarUrl('/api/avatar.png'));

    expect(result.current).toBe('/api/avatar.png');
  });
});
