/**
 * @vitest-environment happy-dom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import MessengerBanner, { MESSENGER_BANNER_ID } from './MessengerBanner';

const mocks = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock('@lobehub/icons', () => {
  const agent =
    (testId: string) =>
    ({ size }: { size?: number }) => <span data-size={size} data-testid={testId} />;

  return {
    ClaudeCode: { Color: agent('agent-ClaudeCode') },
    Codex: { Color: agent('agent-Codex') },
    HermesAgent: agent('agent-HermesAgent'),
    OpenClaw: { Color: agent('agent-OpenClaw') },
    Pi: agent('agent-Pi'),
  };
});

vi.mock('@lobehub/ui', () => ({
  Flexbox: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
  Icon: ({ icon: IconComponent }: { icon: (props: Record<string, unknown>) => ReactNode }) => (
    <IconComponent />
  ),
}));

vi.mock('antd-style', () => ({
  createStaticStyles: () => ({
    avatar: 'avatar',
    icon: 'icon',
    iconGroup: 'iconGroup',
    text: 'text',
  }),
}));

vi.mock('lucide-react', () => ({ Sparkles: () => <span data-testid="sparkles" /> }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/features/Workspace/useWorkspaceAwareNavigate', () => ({
  useWorkspaceAwareNavigate: () => mocks.navigate,
}));
vi.mock('./InputBanner', () => ({
  InputBanner: ({
    children,
    onClick,
    testId,
  }: {
    children?: ReactNode;
    onClick?: () => void;
    testId?: string;
  }) => (
    <div data-testid={testId} onClick={onClick}>
      {children}
    </div>
  ),
}));

describe('MessengerBanner', () => {
  it('keeps the original coding-agent artwork and Apps destination', () => {
    render(<MessengerBanner />);

    expect(MESSENGER_BANNER_ID).toBe('messenger-v2');
    expect(screen.getByTestId('sparkles')).toBeInTheDocument();
    for (const id of [
      'agent-ClaudeCode',
      'agent-Codex',
      'agent-HermesAgent',
      'agent-OpenClaw',
      'agent-Pi',
    ]) {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    }

    fireEvent.click(screen.getByTestId('messenger-banner'));
    expect(mocks.navigate).toHaveBeenCalledWith('/apps');
  });
});
