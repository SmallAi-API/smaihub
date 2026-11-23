import type * as LobechatConst from '@lobechat/const';
import { MotionProvider } from '@lobehub/ui';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as m from 'motion/react-m';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

const analyticsTrack = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en-US' },
    t: (key: string) =>
      ({
        'getApp': 'Get App',
        'tab.apiAccess': 'Get API Key',
        'userPanel.help': 'Help',
        'userPanel.inviteFriend': 'Invite a friend',
        'userPanel.setting': 'Settings',
      })[key] || key,
  }),
}));

interface RenderFooterOptions {
  billboardItems?: unknown[];
  desktop?: boolean;
  enableBusinessFeatures?: boolean;
  homeSidebar?: boolean;
  layout?: 'compact' | 'expanded';
  showSettingsEntry?: boolean;
}

let mockServerConfigState: Record<string, unknown>;

const renderFooter = async ({
  billboardItems = [],
  desktop = false,
  enableBusinessFeatures = false,
  homeSidebar = false,
  layout = 'compact',
  showSettingsEntry = true,
}: RenderFooterOptions = {}) => {
  vi.resetModules();
  analyticsTrack.mockReset();
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => null),
    removeItem: vi.fn(),
    setItem: vi.fn(),
  });

  mockServerConfigState = {
    enableBusinessFeatures,
  };

  vi.doMock('@lobechat/const', async (importOriginal) => {
    const actual = (await importOriginal()) as typeof LobechatConst;

    return {
      ...actual,
      isDesktop: desktop,
    };
  });
  function createAnalyticsApi() {
    return {
      analytics: { track: analyticsTrack },
    };
  }
  vi.doMock('@/libs/analytics/client', () => ({
    useAnalytics: createAnalyticsApi,
  }));
  vi.doMock('@/features/Billboard/MenuItems', () => ({
    useBillboardMenuItems: () => billboardItems,
  }));
  vi.doMock('@/features/NavPanel/useActiveNavKey', () => ({
    useActiveNavKey: () => (homeSidebar ? 'home' : 'discover'),
  }));
  vi.doMock('@/features/User/UserPanel/ThemeButton', () => ({
    default: () => null,
  }));
  vi.doMock('@/features/Workspace/WorkspaceLink', () => ({
    default: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  }));
  function createNavLayoutState() {
    return {
      bottomMenuItems: [],
      footer: { layout, showEvalEntry: false, showSettingsEntry },
      topNavItems: [],
      userPanel: {
        showDataImporter: false,
        showMemory: true,
      },
    };
  }
  vi.doMock('@/hooks/useNavLayout', () => ({
    useNavLayout: createNavLayoutState,
  }));
  function selectFromServerConfigStore(selector: (state: Record<string, unknown>) => unknown) {
    return selector(mockServerConfigState);
  }
  vi.doMock('@/store/serverConfig', () => ({
    serverConfigSelectors: {
      enableBusinessFeatures: (s: Record<string, unknown>) => !!s.enableBusinessFeatures,
    },
    useServerConfigStore: selectFromServerConfigStore,
  }));
  const { default: Footer } = await import('./index');

  render(
    <MotionProvider motion={m}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Footer />} path="/" />
          <Route element={<div>Onboarding route</div>} path="/onboarding" />
        </Routes>
      </MemoryRouter>
    </MotionProvider>,
  );
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.doUnmock('@lobechat/const');
  vi.doUnmock('@/libs/analytics/client');
  vi.doUnmock('@/features/Billboard/MenuItems');
  vi.doUnmock('@/features/NavPanel/useActiveNavKey');
  vi.doUnmock('@/features/User/UserPanel/ThemeButton');
  vi.doUnmock('@/features/Workspace/WorkspaceLink');
  vi.doUnmock('@/hooks/useNavLayout');
  vi.doUnmock('@/store/serverConfig');
});

describe('Footer billboard anchor', () => {
  it('marks the help button in compact layout as the billboard dismiss anchor', async () => {
    await renderFooter({ homeSidebar: true });

    expect(screen.getByRole('button', { name: 'Help' })).toHaveAttribute('data-billboard-anchor');
  }, 20000);
});

describe('Footer settings entry', () => {
  it('shows Settings as a single dedicated link in the compact layout', async () => {
    const user = userEvent.setup();
    await renderFooter();

    expect(screen.getByRole('button', { name: 'Settings' }).closest('a')).toHaveAttribute(
      'href',
      '/settings',
    );
    await user.click(screen.getByRole('button', { name: 'Help' }));
    expect(await screen.findByRole('link', { name: 'Get API Key' })).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
  }, 20000);

  it('shows Settings in the Help menu in the expanded layout', async () => {
    const user = userEvent.setup();
    await renderFooter({ layout: 'expanded' });

    expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Help' }));
    expect(await screen.findByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings',
    );
  }, 20000);

  it.each(['compact', 'expanded'] as const)(
    'honors the settings entry flag in the %s layout',
    async (layout) => {
      const user = userEvent.setup();
      await renderFooter({ layout, showSettingsEntry: false });

      expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Help' }));
      expect(await screen.findByRole('link', { name: 'Get API Key' })).toBeVisible();
      expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
    },
    20000,
  );
});

describe('Footer help menu tracking', () => {
  it('shows the external API link before Get App on web', async () => {
    const user = userEvent.setup();
    await renderFooter();

    await user.click(screen.getByRole('button', { name: 'Help' }));

    const getApp = await screen.findByRole('link', { name: 'Get App' });
    const apiKey = screen.getByRole('link', { name: 'Get API Key' });

    expect(getApp).toHaveAttribute('href', '/apps');
    expect(apiKey).toHaveAttribute('href', 'https://api.smai.ai');
    expect(apiKey.compareDocumentPosition(getApp) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  }, 20000);

  it('shows Get App in desktop builds too', async () => {
    const user = userEvent.setup();
    await renderFooter({ desktop: true });

    await user.click(screen.getByRole('button', { name: 'Help' }));

    expect(await screen.findByRole('link', { name: 'Get App' })).toHaveAttribute('href', '/apps');
  }, 20000);

  it('tracks menu open with the visible item keys', async () => {
    const user = userEvent.setup();
    await renderFooter({ enableBusinessFeatures: true });

    await user.click(screen.getByRole('button', { name: 'Help' }));

    const openedCall = analyticsTrack.mock.calls.find(
      ([event]) => event?.name === 'home_footer_menu_opened',
    );
    expect(openedCall).toBeTruthy();
    expect((openedCall![0].properties.keys as string).split(',')).toContain('inviteFriend');
  }, 20000);

  it('tracks a unified click event when the invite friend entry is clicked', async () => {
    const user = userEvent.setup();
    await renderFooter({ enableBusinessFeatures: true });

    await user.click(screen.getByRole('button', { name: 'Help' }));
    await user.click(await screen.findByText('Invite a friend'));

    expect(analyticsTrack).toHaveBeenCalledWith({
      name: 'home_footer_menu_clicked',
      properties: { key: 'inviteFriend', spm: 'homepage.footer.inviteFriend.clicked' },
    });
  }, 20000);

  it('does not render the invite friend entry without business features', async () => {
    const user = userEvent.setup();
    await renderFooter({ enableBusinessFeatures: false });

    await user.click(screen.getByRole('button', { name: 'Help' }));

    expect(screen.queryByText('Invite a friend')).not.toBeInTheDocument();
  }, 20000);

  it('excludes billboard items from the opened keys to keep per-key CTR aligned', async () => {
    const user = userEvent.setup();
    await renderFooter({
      billboardItems: [{ key: 'billboard-promo', label: 'Promo', onClick: vi.fn() }],
      enableBusinessFeatures: true,
      homeSidebar: true,
    });

    await user.click(screen.getByRole('button', { name: 'Help' }));

    const openedCall = analyticsTrack.mock.calls.find(
      ([event]) => event?.name === 'home_footer_menu_opened',
    );
    const keys = (openedCall![0].properties.keys as string).split(',');
    // own items are tracked and reported as exposure...
    expect(keys).toContain('inviteFriend');
    // ...but billboard items (which emit their own billboard_* events) are not,
    // so their CTR denominator never gets an orphaned exposure.
    expect(keys).not.toContain('billboard-promo');
  }, 20000);

  it('separates the invitation and help groups once', async () => {
    const user = userEvent.setup();
    await renderFooter({ enableBusinessFeatures: true });

    await user.click(screen.getByRole('button', { name: 'Help' }));
    const menu = await screen.findByRole('menu');
    const sequence = [...menu.querySelectorAll('[role="menuitem"], [role="separator"]')].map(
      (node) => (node.getAttribute('role') === 'separator' ? '|' : node.textContent),
    );

    expect(sequence).toEqual(['Invite a friend', '|', 'Get API Key', 'Get App']);
  }, 20000);
});
