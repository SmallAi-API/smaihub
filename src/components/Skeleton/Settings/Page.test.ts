import { cleanup, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OWN_FRAME_TABS } from '@/features/Settings/features/ownFrameTabs';
import { SettingsTabs } from '@/store/global/initialState';
import { initServerConfigStore, Provider } from '@/store/serverConfig/store';

import { resolveSettingsSkeletonTab } from './Page';
import { getSettingsTabSkeleton, SETTINGS_TAB_SKELETONS } from './tabs';

const platform = vi.hoisted(() => ({ isDesktop: false }));

vi.mock('@lobechat/const', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  get isDesktop() {
    return platform.isDesktop;
  },
}));

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useTranslation: () => ({ ready: true, t: (key: string) => key }),
}));

afterEach(cleanup);

describe('resolveSettingsSkeletonTab', () => {
  it('reads the tab and its sub-segment', () => {
    expect(resolveSettingsSkeletonTab('/settings/messenger/discord')).toEqual({
      sub: 'discord',
      tab: 'messenger',
    });
    expect(resolveSettingsSkeletonTab('/settings/billing')).toEqual({ tab: 'billing' });
  });

  it('opens the profile for the bare settings path', () => {
    expect(resolveSettingsSkeletonTab('/settings')).toEqual({ tab: 'profile' });
  });
});

describe('SETTINGS_TAB_SKELETONS', () => {
  it.each([
    { isDesktop: false, enableGatewayMode: false },
    { isDesktop: false, enableGatewayMode: true },
    { isDesktop: true, enableGatewayMode: false },
    { isDesktop: true, enableGatewayMode: true },
  ])('keeps advanced loading aligned with Stable-only settings: %j', (config) => {
    platform.isDesktop = config.isDesktop;
    const store = initServerConfigStore({
      serverConfig: { aiProvider: {}, telemetry: {}, enableGatewayMode: config.enableGatewayMode },
    });
    const skeleton = getSettingsTabSkeleton(SettingsTabs.Advanced)!;
    render(createElement(Provider, { createStore: () => store }, createElement(skeleton.Body)));

    expect(screen.getByText('tab.advanced.toolsAndDiagnostics.title')).toBeInTheDocument();
    expect(screen.getByText('settingCommon.devMode.title')).toBeInTheDocument();
    expect(Boolean(screen.queryByText('tab.advanced.gatewayMode.title'))).toBe(
      config.enableGatewayMode,
    );
    expect(screen.queryByText('tab.advanced.appUpdates.title')).not.toBeInTheDocument();
    expect(screen.queryByText('tab.advanced.updateChannel.title')).not.toBeInTheDocument();
  });

  it('ignores inherited object keys', () => {
    expect(getSettingsTabSkeleton('toString')).toBeUndefined();
  });

  it('gives every own-frame tab with a registered skeleton a page', () => {
    for (const tab of OWN_FRAME_TABS) {
      const skeleton = SETTINGS_TAB_SKELETONS[tab as SettingsTabs];
      if (skeleton) expect(skeleton.Page, tab).toBeDefined();
    }
  });

  it('only gives own-frame tabs a page of their own', () => {
    for (const [tab, skeleton] of Object.entries(SETTINGS_TAB_SKELETONS)) {
      if (skeleton?.Page) expect(OWN_FRAME_TABS.has(tab), tab).toBe(true);
    }
  });
});
