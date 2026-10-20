import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { GlobalBillboard } from '@/types/serverConfig';

import { useBillboardWindow } from './useBillboardWindow';

const now = Date.parse('2026-10-20T00:00:00Z');
const schedule = (start: number, end: number): GlobalBillboard => ({
  endAt: new Date(end).toISOString(),
  id: 1,
  items: [],
  slug: 'news',
  startAt: new Date(start).toISOString(),
  title: 'News',
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
});
afterEach(() => vi.useRealTimers());

describe('useBillboardWindow', () => {
  it('opens at start and hides just after the inclusive end, without a fetch or rerender from parents', () => {
    const { result, unmount } = renderHook(() =>
      useBillboardWindow(schedule(now + 1000, now + 2000)),
    );
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(true);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(false);
    unmount();
  });

  it.each([
    null,
    undefined,
    { ...schedule(now, now + 1000), startAt: 'invalid' },
    schedule(now + 1000, now),
    schedule(now, now),
  ])('hides missing or invalid schedule %j', (value) => {
    const { result, unmount } = renderHook(() => useBillboardWindow(value));
    expect(result.current).toBe(false);
    unmount();
  });

  it('replaces the expiry timer when a schedule changes and handles withdrawal', () => {
    const { result, rerender, unmount } = renderHook<
      boolean,
      { billboard: GlobalBillboard | null }
    >(({ billboard }) => useBillboardWindow(billboard), {
      initialProps: { billboard: schedule(now, now + 1000) },
    });
    rerender({ billboard: schedule(now, now + 3000) });
    act(() => vi.advanceTimersByTime(1001));
    expect(result.current).toBe(true);
    rerender({ billboard: null });
    expect(result.current).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    unmount();
  });

  it.each(['visibilitychange', 'pageshow'])(
    'catches up on %s after background timer throttling',
    (event) => {
      const { result, unmount } = renderHook(() => useBillboardWindow(schedule(now, now + 1000)));
      vi.setSystemTime(now + 5000);
      act(() => (event === 'pageshow' ? window : document).dispatchEvent(new Event(event)));
      expect(result.current).toBe(false);
      unmount();
    },
  );

  it('handles schedules further away than the browser timeout limit', () => {
    const start = now + 2_147_483_647 + 1000;
    const { result, unmount } = renderHook(() => useBillboardWindow(schedule(start, start + 1000)));
    act(() => vi.advanceTimersByTime(2_147_483_647));
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(true);
    unmount();
  });

  it('removes timers and listeners on unmount', () => {
    const removeDocument = vi.spyOn(document, 'removeEventListener');
    const removeWindow = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useBillboardWindow(schedule(now, now + 1000)));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(removeDocument).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(removeWindow).toHaveBeenCalledWith('pageshow', expect.any(Function));
    removeDocument.mockRestore();
    removeWindow.mockRestore();
  });
});
