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
  navLayout: {
    bottomMenuItems: [] as MockNavItem[],
    topNavItems: [] as MockNavItem[],
  },
  updateSystemStatus: vi.fn(),
  windowOpen: vi.fn(),
}));

vi.mock('@lobehub/ui', () => ({
  Accordion: ({
    children,
    expandedKeys,
    onExpandedChange,
  }: {
    children: React.ReactNode;
    expandedKeys?: string[];
    onExpandedChange?: (keys: string[]) => void;
  }) => (
    <div data-expanded-keys={JSON.stringify(expandedKeys)} data-testid="sidebar-accordion">
      <button aria-label="collapse recents" onClick={() => onExpandedChange?.(['agent'])} />
      {children}
    </div>
  ),
  ActionIcon: () => <span />,
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Flexbox: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-body">{children}</div>
  ),
  Icon: () => <span />,
  Popover: ({ children, content }: { children: React.ReactNode; content: React.ReactNode }) => (
    <div data-testid="popover-wrapper">
      <div data-testid="popover-content">{content}</div>
      {children}
    </div>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

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

vi.mock('@/routes/(main)/home/features/Recents', () => ({
  default: ({ itemKey }: { itemKey: string }) => <div data-testid={`sidebar-item-${itemKey}`} />,
}));

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

    expect(spacerIndex).toBe(2);
    expect(children[0]).toHaveTextContent('Pages');
    expect(children[1]).toHaveAttribute('data-testid', 'sidebar-accordion');
    expect(children[3]).toHaveTextContent('Image');
    expect(children[4]).toHaveTextContent('Tasks');
    expect(children[5]).toHaveTextContent('Resource');
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
    expect(children[1]).toHaveAttribute('data-sidebar-bottom-spacer');
    expect(children[2]).toHaveTextContent('Image');
    expect(children[3]).toHaveTextContent('Tasks');
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
