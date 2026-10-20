import { beforeEach, describe, expect, it, vi } from 'vitest';

import { globalService } from './global';

const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('@/libs/trpc/client', () => ({ lambdaClient: { config: { getBillboard: mocks } } }));
vi.mock('@/store/electron', () => ({ getElectronStoreState: vi.fn() }));
vi.mock('@/store/electron/selectors', () => ({ electronSyncSelectors: {} }));

beforeEach(() => vi.resetAllMocks());

describe('globalService.getBillboard', () => {
  it.each([null, { slug: 'news', items: [] }])(
    'passes the server result through, including withdrawal %j',
    async (value) => {
      mocks.query.mockResolvedValue(value);
      expect(await globalService.getBillboard()).toEqual(value);
    },
  );

  it('propagates request failures so polling keeps its last successful value', async () => {
    mocks.query.mockRejectedValue(new Error('unavailable'));
    await expect(globalService.getBillboard()).rejects.toThrow('unavailable');
  });
});
