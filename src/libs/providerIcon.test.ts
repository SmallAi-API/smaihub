import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import ProviderCard from '@/features/Settings/provider/(list)/ProviderGrid/Card';
import ProviderItem from '@/features/Settings/provider/ProviderMenu/Item';

import { ProviderCombine, ProviderIcon } from './providerIcon';

vi.mock('@/features/Settings/provider/(list)/ProviderGrid/EnableSwitch', () => ({
  default: () => null,
}));

vi.mock('@/hooks/useIsDark', () => ({ useIsDark: () => false }));

describe('provider artwork', () => {
  it.each([
    { provider: 'unsloth', title: 'Unsloth' },
    { provider: 'Unsloth', title: 'Unsloth' },
    { provider: 'typesafe', title: 'TypeSafe AI' },
    { provider: 'TypeSafe', title: 'TypeSafe AI' },
  ])('renders the official $provider avatar and wordmark', ({ provider, title }) => {
    const avatar = renderToStaticMarkup(createElement(ProviderIcon, { provider, type: 'avatar' }));
    const wordmark = renderToStaticMarkup(createElement(ProviderCombine, { provider }));

    expect(avatar).toContain(`<title>${title}</title>`);
    expect(avatar).not.toContain('lucide-provider');
    expect(wordmark).toContain(`<title>${title}</title>`);
    expect(wordmark).not.toContain('lucide-provider');
    expect((wordmark.match(/<svg /g) || []).length).toBe(2);
  });

  it.each([
    { id: 'smai', logo: '/logo.png', name: 'smai.ai' },
    { id: 'openai', logo: '/smallai.png', name: 'SmallAi GPT' },
    { id: 'newapi', logo: '/smallai.png', name: 'SmallAi' },
    { id: 'anthropic', logo: '/logo.png', name: 'Anthropic' },
  ])('keeps the configured $name artwork and visible name in settings', ({ id, logo, name }) => {
    const props = { enabled: false, id, name, source: 'builtin' as const };
    const card = createElement(ProviderCard, { ...props, onProviderSelect: () => {} });
    const menu = createElement(MemoryRouter, {
      children: createElement(ProviderItem, { ...props, onClick: () => {} }),
      initialEntries: ['/settings/provider/all'],
    });

    for (const element of [card, menu]) {
      const container = document.createElement('div');
      container.innerHTML = renderToStaticMarkup(element);

      expect(container.textContent).toContain(name);
      expect(container.querySelector(`img[alt="${name}"]`)?.getAttribute('src')).toBe(logo);
    }
  });
});
