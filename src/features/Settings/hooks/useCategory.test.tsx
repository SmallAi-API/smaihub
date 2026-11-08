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

const createWrapper = (
  showProvider: boolean,
  enableBusinessFeatures = false,
  showApiKeyManage = false,
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider
      createStore={() =>
        initServerConfigStore({
          serverConfig: { aiProvider: {}, enableBusinessFeatures, telemetry: {} },
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

const getItemKeys = () => {
  const { result } = renderHook(() => useCategory(), {
    wrapper: createWrapper(true),
  });

  return result.current.flatMap((group) => group.items.map((item) => item.key));
};

const initialUserStoreState = useUserStore.getState();

afterEach(() => {
  cleanup();
  useUserStore.setState(initialUserStoreState, true);
});

describe('settings useCategory', () => {
  const groupKeys = (key: SettingsGroupKey, enableBusinessFeatures = false) => {
    const { result } = renderHook(() => useCategory(), {
      wrapper: createWrapper(true, enableBusinessFeatures),
    });

    return result.current.find((group) => group.key === key)?.items.map((item) => item.key);
  };

  it('orders groups with Plans & Billing right after Account', () => {
    const { result } = renderHook(() => useCategory(), {
      wrapper: createWrapper(true, true),
    });

    expect(result.current.map((group) => group.key)).toEqual([
      SettingsGroupKey.Account,
      SettingsGroupKey.Subscription,
      SettingsGroupKey.Agent,
      SettingsGroupKey.Connection,
      SettingsGroupKey.Resource,
      SettingsGroupKey.System,
    ]);
  });

  it('keeps preferences, notifications and stats in the Account group', () => {
    expect(groupKeys(SettingsGroupKey.Account, true)).toEqual([
      SettingsTabs.Profile,
      SettingsTabs.Appearance,
      SettingsTabs.Hotkey,
      SettingsTabs.Notification,
      SettingsTabs.Stats,
    ]);
  });

  it('puts every outside service in the Connection group', () => {
    expect(groupKeys(SettingsGroupKey.Connection, true)).toEqual([
      SettingsTabs.Messenger,
      SettingsTabs.Integrations,
      SettingsTabs.Connector,
      SettingsTabs.Creds,
    ]);
  });

  it('lists each group and setting once', () => {
    const { result } = renderHook(() => useCategory(), {
      wrapper: createWrapper(true, true),
    });
    const groupKeys = result.current.map((group) => group.key);
    const itemKeys = result.current.flatMap((group) => group.items.map((item) => item.key));

    expect(new Set(groupKeys).size).toBe(groupKeys.length);
    expect(new Set(itemKeys).size).toBe(itemKeys.length);
  });

  // Messenger bots are LobeHub-operated and only configurable from the cloud
  // admin, so the tab is a dead end on self-hosted deployments.
  it('hides Messenger without business features', () => {
    expect(getItemKeys()).not.toContain(SettingsTabs.Messenger);
  });

  it('keeps Provider visible when provider settings are enabled', () => {
    expect(getItemKeys()).toContain(SettingsTabs.Provider);
  });

  it('hides Provider when provider settings are disabled', () => {
    const { result } = renderHook(() => useCategory(), {
      wrapper: createWrapper(false),
    });

    const keys = result.current.flatMap((group) => group.items.map((item) => item.key));

    expect(keys).not.toContain(SettingsTabs.Provider);
  });

  it('hides OAuth Apps by default', () => {
    expect(getItemKeys()).not.toContain(SettingsTabs.OAuthApps);
  });

  // The sandbox drives moved to Docs → Sandbox Storage; settings keep only the
  // environment definitions.
  it('keeps Environments in settings without a sandbox storage tab', () => {
    const keys = groupKeys(SettingsGroupKey.Resource, true);
    expect(keys).toContain(SettingsTabs.Environments);
    expect(keys).not.toContain('drive');
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
      wrapper: createWrapper(true, true, showApiKeyManage),
    });
    const keys = result.current.flatMap((group) => group.items.map((item) => item.key));

    expect(keys).not.toContain(SettingsTabs.APIKey);
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
