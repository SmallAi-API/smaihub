/** @vitest-environment happy-dom */
import { act, cleanup, renderHook } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SmaiUsageResult } from '@/types/smaiUsage';

import { notifySmaiUsageChanged } from './events';
import { useSmaiUsage } from './useSmaiUsage';

const env = vi.hoisted(() => ({
  config: { keyVaults: { apiKey: 'key' } },
  eligible: true,
  online: true,
  pathname: '/',
  userId: 'user',
  visibility: 'visible',
  workspaceSlug: undefined as string | undefined,
}));
const getSmaiUsage = vi.hoisted(() => vi.fn());
const mutateStats = vi.hoisted(() => vi.fn());
vi.mock('@/business/client/hooks/useActiveWorkspaceSlug', () => ({
  useActiveWorkspaceSlug: () => env.workspaceSlug,
}));
vi.mock('react-router', () => ({ useLocation: () => ({ pathname: env.pathname }) }));
vi.mock('./useEligibility', () => ({
  useUsageEligibility: () => ({ config: env.config, eligible: env.eligible, userId: env.userId }),
}));
vi.mock('@/services/aiProvider', () => ({ aiProviderService: { getSmaiUsage } }));
vi.mock('@/libs/swr', async () => ({
  mutate: mutateStats,
  useClientDataSWR: (await import('swr')).default,
}));

const balance = (totalAvailable = 4): SmaiUsageResult => ({
  available: true,
  credentialId: 'opaque',
  data: {
    totalAvailable,
    totalGranted: 5,
    totalUsed: 5 - totalAvailable,
    unlimitedQuota: false,
    updatedAt: Date.now(),
  },
});
const advance = async (milliseconds = 0) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
  });
};
const open = (enabled = true) => {
  const cache = new Map();
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(SWRConfig, { value: { provider: () => cache } }, children);
  return renderHook(() => useSmaiUsage(enabled), { wrapper });
};
let testId = 0;

describe('useSmaiUsage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-24T08:00:00Z'));
    Object.assign(env, {
      config: { keyVaults: { apiKey: `key-${++testId}` } },
      eligible: true,
      online: true,
      pathname: '/',
      userId: `user-${testId}`,
      visibility: 'visible',
      workspaceSlug: undefined,
    });
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(
      () => env.visibility as DocumentVisibilityState,
    );
    vi.spyOn(navigator, 'onLine', 'get').mockImplementation(() => env.online);
    getSmaiUsage.mockReset().mockResolvedValue(balance());
    mutateStats.mockReset().mockResolvedValue(undefined);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
  it.each(['disabled', 'ineligible', 'other route'] as const)(
    'does not query when %s',
    async (state) => {
      env.eligible = state !== 'ineligible';
      env.pathname = state === 'other route' ? '/settings/stats' : '/';
      const { result } = open(state !== 'disabled');
      await advance(300_000);
      expect(getSmaiUsage).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
    },
  );
  it('exposes a loading state before the first eligible response', async () => {
    const { result } = open();
    expect(result.current.isLoading).toBe(true);
    await advance();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.totalAvailable).toBe(4);
  });
  it('应该在首次查询失败后结束骨架并隐藏卡片数据', async () => {
    let resolve!: (value: SmaiUsageResult) => void;
    getSmaiUsage.mockReturnValueOnce(
      new Promise<SmaiUsageResult>((done) => {
        resolve = done;
      }),
    );
    const { result } = open();
    await advance();

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    await act(async () => {
      resolve({ available: false, reason: 'invalid_credentials' });
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
  it('应该在手动刷新期间保留当前额度并遵守相同的请求预算', async () => {
    const { result } = open();
    await advance();
    await act(async () => {
      await result.current.refresh();
      await result.current.refresh();
    });
    expect(getSmaiUsage).toHaveBeenCalledTimes(1);

    await advance(15_000);
    let resolve!: (value: SmaiUsageResult) => void;
    getSmaiUsage.mockReturnValueOnce(
      new Promise<SmaiUsageResult>((done) => {
        resolve = done;
      }),
    );
    let refresh!: Promise<void>;
    act(() => {
      refresh = result.current.refresh();
    });
    await advance();

    expect(getSmaiUsage).toHaveBeenCalledTimes(2);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRefreshing).toBe(true);
    expect(result.current.data?.totalAvailable).toBe(4);
    await act(async () => {
      resolve(balance(3));
      await refresh;
    });

    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.data?.totalAvailable).toBe(3);
  });
  it('hides its balance and cancels refreshes when leaving home', async () => {
    const { result, rerender } = open();
    await advance();
    expect(result.current.data?.totalAvailable).toBe(4);
    env.pathname = '/settings/stats';
    rerender();
    expect(result.current.data).toBeUndefined();
    act(() => notifySmaiUsageChanged('smai'));
    await advance(300_000);
    expect(getSmaiUsage).toHaveBeenCalledTimes(1);
  });
  it.each(['hidden', 'offline'] as const)(
    'hides balance and stops requests while %s',
    async (state) => {
      const { result } = open();
      await advance();
      act(() => {
        if (state === 'hidden') {
          env.visibility = 'hidden';
          document.dispatchEvent(new Event('visibilitychange'));
        } else {
          env.online = false;
          window.dispatchEvent(new Event('offline'));
        }
      });
      expect(result.current.data).toBeUndefined();
      act(() => notifySmaiUsageChanged('smai'));
      await advance(300_000);
      expect(getSmaiUsage).toHaveBeenCalledTimes(1);
    },
  );
  it('coalesces completion bursts and keeps the budget after equivalent config hydration', async () => {
    const { rerender } = open();
    await advance();
    expect(getSmaiUsage).toHaveBeenCalledTimes(1);
    await advance(1000);
    env.config = { keyVaults: { ...env.config.keyVaults } };
    rerender();
    act(() => {
      notifySmaiUsageChanged('smai');
      notifySmaiUsageChanged('smai');
      notifySmaiUsageChanged('smai');
    });
    await advance(13_999);
    expect(getSmaiUsage).toHaveBeenCalledTimes(1);
    await advance(1);
    expect(getSmaiUsage).toHaveBeenCalledTimes(2);
  });
  it('uses new credentials and ignores a late balance from the previous key', async () => {
    let resolveOld!: (value: SmaiUsageResult) => void;
    let resolveNew!: (value: SmaiUsageResult) => void;
    getSmaiUsage
      .mockReturnValueOnce(
        new Promise<SmaiUsageResult>((resolve) => {
          resolveOld = resolve;
        }),
      )
      .mockReturnValueOnce(
        new Promise<SmaiUsageResult>((resolve) => {
          resolveNew = resolve;
        }),
      );
    const { result, rerender } = open();
    await advance();
    expect(getSmaiUsage).toHaveBeenCalledTimes(1);
    env.config = { keyVaults: { apiKey: 'replacement-key' } };
    rerender();
    expect(result.current.data).toBeUndefined();
    await advance();
    expect(getSmaiUsage).toHaveBeenCalledTimes(2);
    await act(async () => {
      resolveNew(balance(3));
    });
    expect(result.current.data?.totalAvailable).toBe(3);
    await act(async () => {
      resolveOld(balance(99));
    });
    expect(result.current.data?.totalAvailable).toBe(3);
  });
  it('hides a failed refresh and pauses invalid credentials', async () => {
    const { result } = open();
    await advance();
    expect(result.current.data?.totalAvailable).toBe(4);
    getSmaiUsage.mockResolvedValueOnce({ available: false, reason: 'invalid_credentials' });
    act(() => notifySmaiUsageChanged('smai'));
    await advance(15_000);
    expect(result.current.data).toBeUndefined();
    await advance(300_000);
    expect(getSmaiUsage).toHaveBeenCalledTimes(2);
  });
  it.each(['hidden', 'offline'] as const)(
    'refreshes dirty usage after returning from %s within the same budget',
    async (state) => {
      const { result } = open();
      await advance();
      expect(getSmaiUsage).toHaveBeenCalledTimes(1);
      getSmaiUsage.mockResolvedValueOnce(balance(3));
      act(() => {
        if (state === 'hidden') {
          env.visibility = 'hidden';
          document.dispatchEvent(new Event('visibilitychange'));
        } else {
          env.online = false;
          window.dispatchEvent(new Event('offline'));
        }
      });
      act(() => notifySmaiUsageChanged('smai'));
      await advance(1000);
      act(() => {
        if (state === 'hidden') {
          env.visibility = 'visible';
          document.dispatchEvent(new Event('visibilitychange'));
        } else {
          env.online = true;
          window.dispatchEvent(new Event('online'));
        }
      });
      await advance(13_999);
      expect(getSmaiUsage).toHaveBeenCalledTimes(1);
      await advance(1);
      expect(getSmaiUsage).toHaveBeenCalledTimes(2);
      expect(result.current.data?.totalAvailable).toBe(3);
    },
  );
});
