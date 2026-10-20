import { act, renderHook } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { GlobalBillboard } from '@/types/serverConfig';

import { ServerConfigActionImpl } from './action';
import type { ServerConfigStore } from './store';

const mocks = vi.hoisted(() => ({ getBillboard: vi.fn() }));
vi.mock('@/services/global', () => ({ globalService: mocks }));
// Use real SWR scheduling without unrelated workspace/cache subscriptions.
vi.mock('@/libs/swr', async () => {
  const { default: useSWR } = await import('swr');
  return { useClientPollingSWR: useSWR, useOnlyFetchOnceSWR: useSWR };
});

const billboard: GlobalBillboard = {
  endAt: '2026-11-01T00:00:00Z',
  id: 1,
  items: [{ description: 'Details', id: 1, title: 'News' }],
  slug: 'first',
  startAt: '2026-10-01T00:00:00Z',
  title: 'News',
};

const setup = (enabled = true, retry = false) => {
  let state = { billboard: null as GlobalBillboard | null, featureFlags: { unchanged: true } };
  const set = vi.fn((patch) => {
    state = { ...state, ...patch };
  });
  const actions = new ServerConfigActionImpl(set, () => state as unknown as ServerConfigStore);
  const cache = new Map();
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      SWRConfig,
      {
        value: { dedupingInterval: 0, provider: () => cache, shouldRetryOnError: retry },
      },
      children,
    );
  const hook = renderHook(
    ({ enabled }) => {
      const response = actions.useFetchBillboard(enabled);
      return { error: response.error, mutate: response.mutate };
    },
    { initialProps: { enabled }, wrapper },
  );
  return { ...hook, getState: () => state, set };
};

beforeEach(() => {
  vi.useFakeTimers();
  mocks.getBillboard.mockReset().mockResolvedValue(billboard);
});
afterEach(() => vi.useRealTimers());

describe('billboard polling', () => {
  it('starts only after server initialization, then updates every minute without touching other config', async () => {
    const hook = setup(false);
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(mocks.getBillboard).not.toHaveBeenCalled();
    hook.rerender({ enabled: true });
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(hook.getState().billboard).toEqual(billboard);
    const updated = { ...billboard, slug: 'second', title: 'Updated' };
    mocks.getBillboard.mockResolvedValue(updated);
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(hook.getState().billboard).toEqual(updated);
    expect(hook.getState().featureFlags).toEqual({ unchanged: true });
    expect(hook.set).toHaveBeenLastCalledWith({ billboard: updated }, false, 'refreshBillboard');
    hook.unmount();
  });

  it('clears a withdrawn announcement when the server returns null', async () => {
    const hook = setup();
    await act(() => vi.advanceTimersByTimeAsync(0));
    mocks.getBillboard.mockResolvedValue(null);
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(hook.getState().billboard).toBeNull();
    hook.unmount();
  });

  it('retains the last successful announcement on errors and recovers on revalidation', async () => {
    const hook = setup();
    await act(() => vi.advanceTimersByTimeAsync(0));
    mocks.getBillboard.mockRejectedValue(new Error('upstream unavailable'));
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(hook.getState().billboard).toEqual(billboard);
    expect(hook.result.current.error).toBeDefined();
    mocks.getBillboard.mockResolvedValue(null);
    await act(() => hook.result.current.mutate());
    expect(hook.getState().billboard).toBeNull();
    hook.unmount();
  });

  it('recovers automatically after more than five consecutive feed errors', async () => {
    mocks.getBillboard.mockRejectedValue(new Error('offline feed'));
    const hook = setup(true, true);
    await act(() => vi.advanceTimersByTimeAsync(0));
    for (let attempt = 0; attempt < 6; attempt++) {
      await act(() => vi.advanceTimersByTimeAsync(60_000));
    }
    expect(mocks.getBillboard).toHaveBeenCalledTimes(7);
    mocks.getBillboard.mockResolvedValue(billboard);
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(hook.getState().billboard).toEqual(billboard);
    hook.unmount();
  });

  it.each([401, 403, 429])('does not automatically retry HTTP %s', async (status) => {
    mocks.getBillboard.mockRejectedValue({ data: { httpStatus: status } });
    const hook = setup(true, true);
    await act(() => vi.advanceTimersByTimeAsync(0));
    await act(() => vi.advanceTimersByTimeAsync(180_000));
    expect(mocks.getBillboard).toHaveBeenCalledTimes(1);
    hook.unmount();
  });
});
