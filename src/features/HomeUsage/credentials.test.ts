import { describe, expect, it } from 'vitest';

import type { AiProviderRuntimeConfig } from '@/types/aiProvider';

import { getUsageIdentity, hasSingleSmaiKey } from './credentials';

const config = (apiKey: string, baseURL = ''): AiProviderRuntimeConfig => ({
  config: {},
  keyVaults: { apiKey, baseURL },
  settings: {},
});

describe('personal quota credential identity', () => {
  it.each([undefined, config(''), config('sk-one,sk-two'), config('sk-one\nsk-two')])(
    'rejects absent or ambiguous credentials',
    (value) => {
      expect(hasSingleSmaiKey(value)).toBe(false);
    },
  );
  it('accepts one configured key', () => {
    expect(hasSingleSmaiKey(config(' sk-one '))).toBe(true);
  });
  it('preserves the request budget when runtime config is rehydrated', () => {
    const first = getUsageIdentity(config('sk-one'), 'same-user');
    expect(getUsageIdentity(config('sk-one'), 'same-user')).toBe(first);
  });
  it('isolates a different user, key or endpoint without leaking key material', () => {
    const identities = [
      getUsageIdentity(config('sk-one'), 'user-one'),
      getUsageIdentity(config('sk-two'), 'user-one'),
      getUsageIdentity(config('sk-two'), 'user-two'),
      getUsageIdentity(config('sk-two', 'https://another.example'), 'user-two'),
    ];
    expect(new Set(identities.map((entry) => entry.id)).size).toBe(4);
    expect(JSON.stringify(identities)).not.toContain('sk-one');
    expect(JSON.stringify(identities)).not.toContain('sk-two');
  });
});
