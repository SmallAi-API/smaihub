import { cleanup, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mapFeatureFlagsEnvToState } from '@/config/featureFlags';
import { SettingsTabs } from '@/store/global/initialState';
import { initServerConfigStore, Provider } from '@/store/serverConfig/store';
import { useUserStore } from '@/store/user';

import { SettingsGroupKey, useCategory } from './useCategory';

vi.hoisted(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: vi.fn(() => null),
      removeItem: vi.fn(),
      setItem: vi.fn(),
    },
  });
});

const navigate = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => navigate,
}));

const createWrapper = (showProvider: boolean, showApiKeyManage = false) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider
      createStore={() =>
        initServerConfigStore({
          serverConfig: { aiProvider: {}, enableBusinessFeatures: true, telemetry: {} },
          featureFlags: {
            ...mapFeatureFlagsEnvToState({
              provider_settings: true,
            }),
            showApiKeyManage,
            showProvider,
          },
        })
      }
    >
      {children}
    </Provider>
  );

  return Wrapper;
};

const initialUserStoreState = useUserStore.getState();

afterEach(() => {
  cleanup();
  navigate.mockReset();
  useUserStore.setState(initialUserStoreState, true);
});

describe('mobile settings useCategory', () => {
  it('keeps connection settings together without duplicate groups or entries', () => {
    const { result } = renderHook(() => useCategory(), {
      wrapper: createWrapper(true),
    });
    const groupKeys = result.current.map((group) => group.key);
    const itemKeys = result.current.flatMap((group) => group.items.map((item) => item.key));
    const connectionGroup = result.current.find(
      (group) => group.key === SettingsGroupKey.Connection,
    );

    expect(groupKeys).toEqual([
      SettingsGroupKey.General,
      SettingsGroupKey.Subscription,
      SettingsGroupKey.Agent,
      SettingsGroupKey.Connection,
      SettingsGroupKey.System,
    ]);
    expect(new Set(itemKeys).size).toBe(itemKeys.length);
    expect(connectionGroup?.items.map((item) => item.key)).toEqual([
      SettingsTabs.Connector,
      SettingsTabs.Creds,
    ]);
  });

  it.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ])('keeps personal API Key hidden (manage=%s, dev=%s)', (showApiKeyManage, isDevMode) => {
    useUserStore.setState({
      settings: {
        ...initialUserStoreState.settings,
        general: { ...initialUserStoreState.settings.general, isDevMode },
      },
    });

    const { result } = renderHook(() => useCategory(), {
      wrapper: createWrapper(true, showApiKeyManage),
    });
    const keys = result.current.flatMap((group) => group.items.map((item) => item.key));

    expect(keys).not.toContain(SettingsTabs.APIKey);
  });

  it('keeps Provider visible and routes to the provider list when provider settings are enabled', () => {
    const { result } = renderHook(() => useCategory(), {
      wrapper: createWrapper(true),
    });

    const provider = result.current
      .flatMap((group) => group.items)
      .find((item) => item.key === SettingsTabs.Provider);

    expect(provider).toBeDefined();

    provider?.onClick?.();

    expect(navigate).toHaveBeenCalledWith('/settings/provider/all');
  });

  it('hides Provider when provider settings are disabled', () => {
    const { result } = renderHook(() => useCategory(), {
      wrapper: createWrapper(false),
    });

    const keys = result.current.flatMap((group) => group.items.map((item) => item.key));

    expect(keys).not.toContain(SettingsTabs.Provider);
  });

  it('hides OAuth Apps by default', () => {
    const { result } = renderHook(() => useCategory(), {
      wrapper: createWrapper(true),
    });

    const keys = result.current.flatMap((group) => group.items.map((item) => item.key));

    expect(keys).not.toContain(SettingsTabs.OAuthApps);
  });

  it('shows OAuth Apps when the Labs preference is enabled', () => {
    useUserStore.setState({
      preference: {
        ...initialUserStoreState.preference,
        lab: { ...initialUserStoreState.preference.lab, enableOAuthApps: true },
      },
    });

    const { result } = renderHook(() => useCategory(), {
      wrapper: createWrapper(true),
    });

    const systemGroup = result.current.find((group) => group.key === SettingsGroupKey.System);

    expect(systemGroup?.items.map((item) => item.key)).toContain(SettingsTabs.OAuthApps);
  });
});
