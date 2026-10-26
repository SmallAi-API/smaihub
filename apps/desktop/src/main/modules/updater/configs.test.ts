import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/const/env', () => ({ isDev: false }));
vi.mock('@/env', () => ({ getDesktopEnv: () => ({ UPDATE_CHANNEL: process.env.UPDATE_CHANNEL }) }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('stable update policy', () => {
  it.each(['stable', 'canary', 'nightly', 'beta', 'unknown'])(
    'uses stable updates for a %s build while preserving build identity',
    async (channel) => {
      vi.stubEnv('UPDATE_CHANNEL', channel);
      const { BUILD_CHANNEL, UPDATE_CHANNEL } = await import('./configs');

      expect(UPDATE_CHANNEL).toBe('stable');
      expect(BUILD_CHANNEL).toBe(channel);
    },
  );

  it.each(['stable', 'canary', 'nightly', 'beta', 'unknown', '', null, undefined])(
    'normalizes the stored channel %s to stable',
    async (channel) => {
      const { coerceStoredUpdateChannel } = await import('./configs');

      expect(coerceStoredUpdateChannel(channel)).toBe('stable');
    },
  );
});
