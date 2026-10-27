import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Body from './index';

interface MockGlobalState {
  status: {
    hiddenSidebarSections?: string[];
    sidebarExpandedKeys?: string[];
    sidebarItems?: string[];
  };
  updateSystemStatus: (patch: Partial<MockGlobalState['status']>) => void;
}

interface MockNavItem {
  external?: boolean;
  key: string;
  popoverImageSrc?: string;
  title: string;
  url?: string;
}

const mocks = vi.hoisted(() => ({
  electronOpenExternalLink: vi.fn(),
  globalState: undefined as unknown as MockGlobalState,
  isDesktop: false,
  showBillboard: false,
  navLayout: {
    bottomMenuItems: [] as MockNavItem[],
    topNavItems: [] as MockNavItem[],
  },
  updateSystemStatus: vi.fn(),
  windowOpen: vi.fn(),
}));

vi.mock('@lobehub/ui', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const factories: ((original: typeof importOriginal) => unknown)[] = [
    async (importOriginal) => ({
      ...(await importOriginal<object>()),
      Flexbox: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="sidebar-body">{children}</div>
      ),
    }),
    async (importOriginal) => ({
      ...(await importOriginal<object>()),
      AccordionRoot: ({
        children,
        value,
        onValueChange,
      }: {
        children: React.ReactNode;
        onValueChange?: (keys: string[]) => void;
        value?: string[];
      }) => (
        <div data-expanded-keys={JSON.stringify(value)} data-testid="sidebar-accordion">
          <button aria-label="collapse recents" onClick={() => onValueChange?.(['agent'])} />
          {children}
        </div>
      ),
    }),
  ];
  const merged: Record<string, unknown> = { ...actual };
  for (const factory of factories) {
    const part = (await factory(importOriginal)) as Record<string, unknown>;
    for (const [key, value] of Object.entries(part)) if (value !== actual[key]) merged[key] = value;
  }
  return merged;
});

vi.mock('react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
}));

vi.mock('@/features/NavPanel/components/NavItem', () => ({
  default: ({ title, onClick }: { onClick?: (e: React.MouseEvent) => void; title: string }) => (
    <div onClick={onClick}>{title}</div>
  ),
}));

vi.mock('@/const/version', () => ({
  get isDesktop() {
    return mocks.isDesktop;
  },
}));

vi.mock('@/services/electron/system', () => ({
  electronSystemService: {
    openExternalLink: (...args: unknown[]) => mocks.electronOpenExternalLink(...args),
  },
}));

vi.mock('@/hooks/useActiveTabKey', () => ({
  useActiveTabKey: () => 'home',
}));

vi.mock('@/hooks/useNavLayout', () => ({
  useNavLayout: () => mocks.navLayout,
}));

vi.mock('@/utils/navigation', () => ({
  isModifierClick: () => false,
}));

vi.mock('@/features/Home/Recents', () => ({
  default: ({ itemKey }: { itemKey: string }) => <div data-testid={`sidebar-item-${itemKey}`} />,
}));

vi.mock('@/features/Channels/ChannelList', () => ({
  default: () => <div data-testid="sidebar-channels" />,
}));

vi.mock('@/features/Billboard', async () => {
  const { useState } = await import('react');
  const MockBillboard = () => {
    const [visible, setVisible] = useState(true);
    return mocks.showBillboard && visible ? (
      <section aria-label="Announcement">
        News
        <button onClick={() => setVisible(false)}>Close announcement</button>
      </section>
    ) : null;
  };
  return { default: MockBillboard };
});

vi.mock('./Agent', () => ({
  default: ({ itemKey }: { itemKey: string }) => <div data-testid={`sidebar-item-${itemKey}`} />,
}));

vi.mock('./Private', () => ({
  default: ({ itemKey }: { itemKey: string }) => <div data-testid={`sidebar-item-${itemKey}`} />,
}));

vi.mock('./CustomizeSidebarModal', () => ({
  openCustomizeSidebarModal: vi.fn(),
}));

vi.mock('@/store/global', () => ({
  useGlobalStore: (selector: (state: MockGlobalState) => unknown) => selector(mocks.globalState),
}));

beforeEach(() => {
  mocks.updateSystemStatus.mockReset();
  mocks.electronOpenExternalLink.mockReset();
  mocks.windowOpen.mockReset();
  mocks.isDesktop = false;
  mocks.showBillboard = false;
  mocks.navLayout = {
    bottomMenuItems: [],
    topNavItems: [],
  };
  mocks.globalState = {
    status: {
      hiddenSidebarSections: [],
      sidebarExpandedKeys: ['recents', 'agent'],
      sidebarItems: ['recents', 'agent'],
    },
    updateSystemStatus: mocks.updateSystemStatus,
  };
  vi.stubGlobal('open', mocks.windowOpen);
});

afterEach(() => {
  cleanup();
});

describe('Home sidebar body', () => {
  it('places announcements immediately above generation after the flexible spacer', () => {
    mocks.showBillboard = true;
    mocks.navLayout.bottomMenuItems = [
      { key: 'image', title: 'Generate', url: '/image' },
      { key: 'community', title: 'Community', url: '/community' },
    ];
    mocks.globalState.status.sidebarItems = ['agent', '__spacer__', 'image', 'community'];

    render(<Body />);

    const card = screen.getByRole('region', { name: 'Announcement' });
    expect(card.previousElementSibling).toHaveAttribute('data-sidebar-bottom-spacer');
    expect(card.nextElementSibling).toHaveAttribute('href', '/image');
    expect(card.nextElementSibling?.nextElementSibling).toHaveAttribute('href', '/community');
  });

  it('keeps announcements above the remaining bottom entries when generation is hidden', () => {
    mocks.showBillboard = true;
    mocks.navLayout.bottomMenuItems = [
      { key: 'image', title: 'Generate', url: '/image' },
      { key: 'community', title: 'Community', url: '/community' },
    ];
    mocks.globalState.status.sidebarItems = ['agent', '__spacer__', 'image', 'community'];
    mocks.globalState.status.hiddenSidebarSections = ['image'];

    render(<Body />);

    expect(screen.getByRole('region', { name: 'Announcement' }).nextElementSibling).toHaveAttribute(
      'href',
      '/community',
    );
    expect(screen.queryByText('Generate')).not.toBeInTheDocument();
  });

  it('reclaims the announcement slot when the card is dismissed', () => {
    mocks.showBillboard = true;
    mocks.navLayout.bottomMenuItems = [{ key: 'image', title: 'Generate', url: '/image' }];
    mocks.globalState.status.sidebarItems = ['agent', '__spacer__', 'image'];
    render(<Body />);

    expect(screen.getByRole('region', { name: 'Announcement' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close announcement' }));

    expect(screen.queryByRole('region', { name: 'Announcement' })).not.toBeInTheDocument();
    expect(screen.getByText('Generate').closest('a')?.previousElementSibling).toHaveAttribute(
      'data-sidebar-bottom-spacer',
    );
  });

  it('uses persisted sidebar accordion expanded keys', () => {
    mocks.globalState.status.sidebarExpandedKeys = ['agent'];

    render(<Body />);

    expect(screen.getByTestId('sidebar-accordion')).toHaveAttribute(
      'data-expanded-keys',
      '["agent"]',
    );
  });

  it('persists sidebar accordion expanded changes', () => {
    render(<Body />);

    fireEvent.click(screen.getByRole('button', { name: 'collapse recents' }));

    expect(mocks.updateSystemStatus).toHaveBeenCalledWith({ sidebarExpandedKeys: ['agent'] });
  });

  it('renders items strictly in sidebarItems order with the spacer at its stored position', () => {
    mocks.navLayout = {
      bottomMenuItems: [
        { key: 'image', title: 'Image', url: '/image' },
        { key: 'resource', title: 'Resource', url: '/resource' },
      ],
      topNavItems: [
        { key: 'pages', title: 'Pages', url: '/page' },
        { key: 'tasks', title: 'Tasks', url: '/tasks' },
      ],
    };
    mocks.globalState.status.sidebarItems = [
      'pages',
      'recents',
      'agent',
      '__spacer__',
      'image',
      'tasks',
      'resource',
    ];

    render(<Body />);

    const children = Array.from(screen.getByTestId('sidebar-body').children);
    const spacerIndex = children.findIndex((child) =>
      child.hasAttribute('data-sidebar-bottom-spacer'),
    );

    expect(spacerIndex).toBe(3);
    expect(children[0]).toHaveTextContent('Pages');
    expect(children[1]).toHaveAttribute('data-testid', 'sidebar-accordion');
    expect(children[2]).toHaveAttribute('data-testid', 'sidebar-channels');
    expect(children[4]).toHaveTextContent('Image');
    expect(children[5]).toHaveTextContent('Tasks');
    expect(children[6]).toHaveTextContent('Resource');
  });

  it('keeps a top item that was dragged past the spacer in its new position', () => {
    mocks.navLayout = {
      bottomMenuItems: [{ key: 'image', title: 'Image', url: '/image' }],
      topNavItems: [{ key: 'tasks', title: 'Tasks', url: '/tasks' }],
    };
    // User dragged `tasks` from the top section to sit after `image`.
    mocks.globalState.status.sidebarItems = ['recents', 'agent', '__spacer__', 'image', 'tasks'];

    render(<Body />);

    const children = Array.from(screen.getByTestId('sidebar-body').children);

    expect(children[0]).toHaveAttribute('data-testid', 'sidebar-accordion');
    expect(children[1]).toHaveAttribute('data-testid', 'sidebar-channels');
    expect(children[2]).toHaveAttribute('data-sidebar-bottom-spacer');
    expect(children[3]).toHaveTextContent('Image');
    expect(children[4]).toHaveTextContent('Tasks');
  });

  it('places Channels directly below Agents, outside the Agent accordion', () => {
    mocks.globalState.status.sidebarItems = ['agent', 'recents'];

    render(<Body />);

    const children = Array.from(screen.getByTestId('sidebar-body').children);

    expect(children[0]).toContainElement(screen.getByTestId('sidebar-item-agent'));
    expect(children[1]).toHaveAttribute('data-testid', 'sidebar-channels');
    expect(children[2]).toContainElement(screen.getByTestId('sidebar-item-recents'));
  });

  it('opens external links via window.open in web mode (regression: docs link must not use SPA Link)', () => {
    mocks.navLayout = {
      bottomMenuItems: [
        {
          external: true,
          key: 'docs',
          title: 'Docs',
          url: 'https://docs.smai.ai/docs/smai-app',
        },
      ],
      topNavItems: [],
    };
    mocks.globalState.status.sidebarItems = ['docs'];

    render(<Body />);

    const docsItem = screen.getByText('Docs');
    // Must NOT be wrapped in a react-router <Link> (which renders <a href>) for external URLs.
    expect(docsItem.closest('a')).toBeNull();

    fireEvent.click(docsItem);

    expect(mocks.windowOpen).toHaveBeenCalledWith(
      'https://docs.smai.ai/docs/smai-app',
      '_blank',
      'noopener,noreferrer',
    );
    expect(mocks.electronOpenExternalLink).not.toHaveBeenCalled();
  });

  it('opens external links via Electron in desktop mode', () => {
    mocks.isDesktop = true;
    mocks.navLayout = {
      bottomMenuItems: [
        {
          external: true,
          key: 'docs',
          title: 'Docs',
          url: 'https://docs.smai.ai/docs/smai-app',
        },
      ],
      topNavItems: [],
    };
    mocks.globalState.status.sidebarItems = ['docs'];

    render(<Body />);

    fireEvent.click(screen.getByText('Docs'));

    expect(mocks.electronOpenExternalLink).toHaveBeenCalledWith(
      'https://docs.smai.ai/docs/smai-app',
    );
    expect(mocks.windowOpen).not.toHaveBeenCalled();
  });

  it('renders popover image for items with popoverImageSrc (regression: support kefu image)', () => {
    mocks.navLayout = {
      bottomMenuItems: [
        {
          key: 'support',
          popoverImageSrc: '/kefu.png',
          title: 'Support',
        },
      ],
      topNavItems: [],
    };
    mocks.globalState.status.sidebarItems = ['support'];

    render(<Body />);

    const popoverContent = screen.getByTestId('popover-content');
    const img = popoverContent.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('/kefu.png');
    expect(img?.getAttribute('alt')).toBe('Support');
  });
});
