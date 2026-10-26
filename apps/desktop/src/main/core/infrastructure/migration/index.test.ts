import type Store from 'electron-store';
import { describe, expect, it, vi } from 'vitest';

import type { ElectronMainStore } from '@/types/store';

import { APPLIED_STORE_MIGRATIONS_KEY, runStoreMigrations } from './index';

vi.mock('@/modules/updater/configs', () => ({
  UPDATE_CHANNEL: 'stable',
  coerceStoredUpdateChannel: () => 'stable',
}));

describe('stable update-channel migration', () => {
  it.each(['canary', 'nightly', 'beta', 'stable', undefined])(
    'migrates an existing %s preference even after earlier migrations ran',
    (channel) => {
      const data = new Map<string, unknown>([
        [APPLIED_STORE_MIGRATIONS_KEY, ['001-normalize-update-channel', '002-fix-gateway-url']],
        ['updateChannel', channel],
        ['gatewayUrl', 'https://custom.gateway.test'],
      ]);
      const store = {
        get: (key: string) => data.get(key),
        set: vi.fn((key: string, value: unknown) => data.set(key, value)),
      };
      const persistedStore = store as unknown as Store<ElectronMainStore>;

      runStoreMigrations(persistedStore);

      expect(data.get('updateChannel')).toBe('stable');
      expect(data.get('gatewayUrl')).toBe('https://custom.gateway.test');
      expect(data.get(APPLIED_STORE_MIGRATIONS_KEY)).toEqual([
        '001-normalize-update-channel',
        '002-fix-gateway-url',
        '003-stable-update-channel',
      ]);

      store.set.mockClear();
      runStoreMigrations(persistedStore);
      expect(store.set).not.toHaveBeenCalled();
    },
  );
});
