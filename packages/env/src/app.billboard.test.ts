import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('BILLBOARD_URL', undefined);
});
afterEach(() => vi.unstubAllEnvs());

describe('BILLBOARD_URL', () => {
  it.each([undefined, '', '   '])('is optional when set to %j', async (value) => {
    vi.stubEnv('BILLBOARD_URL', value);
    const { getAppConfig } = await import('./app');
    expect(getAppConfig().BILLBOARD_URL).toBeUndefined();
  });

  it('reads the trimmed server URL independently of Edge Config', async () => {
    vi.stubEnv('BILLBOARD_URL', ' https://new-api.example.com/api/billboard/active ');
    vi.stubEnv('VERCEL_EDGE_CONFIG', 'https://edge-config.vercel.com/existing?token=example');
    const { getAppConfig } = await import('./app');
    expect(getAppConfig().BILLBOARD_URL).toBe('https://new-api.example.com/api/billboard/active');
    expect(getAppConfig().VERCEL_EDGE_CONFIG).toContain('edge-config.vercel.com');
  });

  it.each([
    'bad URL',
    'http://example.com/feed',
    'file:///feed.json',
    'https://user:password@example.com/feed',
  ])('rejects %s', async (value) => {
    vi.stubEnv('BILLBOARD_URL', value);
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(import('./app')).rejects.toThrow();
    } finally {
      log.mockRestore();
    }
  });
});
