import { describe, expect, it, vi } from 'vitest';

import type { SmaiUsageResult } from '@/types/smaiUsage';

import { UsageRefreshPolicy } from './refreshPolicy';

const balance: SmaiUsageResult = {
  available: true,
  credentialId: 'opaque',
  data: {
    totalAvailable: 4,
    totalGranted: 5,
    totalUsed: 1,
    unlimitedQuota: false,
    updatedAt: 0,
  },
};

describe('UsageRefreshPolicy', () => {
  it('coalesces concurrent requests and enforces the same 15 second budget for all triggers', async () => {
    let now = 1000;
    const gate = new UsageRefreshPolicy(() => now);
    const load = vi.fn(async () => balance);
    await Promise.all([gate.request(load, 0), gate.request(load, 0), gate.request(load, 0)]);
    expect(load).toHaveBeenCalledTimes(1);
    now += 14_999;
    await gate.request(load, 1);
    expect(load).toHaveBeenCalledTimes(1);
    expect(gate.handledRevision).toBe(0);
    now += 1;
    await gate.request(load, 1);
    expect(load).toHaveBeenCalledTimes(2);
    expect(gate.handledRevision).toBe(1);
  });
  it('keeps completions arriving during a query dirty for the next settled refresh', async () => {
    let resolve!: (value: SmaiUsageResult) => void;
    const gate = new UsageRefreshPolicy(() => 1000);
    const request = gate.request(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
      1,
    );
    resolve(balance);
    await request;
    expect(gate.needsRefresh(2)).toBe(true);
    expect(gate.needsRefresh(1)).toBe(false);
  });
  it('starts the cooldown after a slow response to avoid acknowledging cached pre-consumption quota', async () => {
    let now = 1000;
    const gate = new UsageRefreshPolicy(() => now);
    await gate.request(async () => {
      now += 1000;
      return balance;
    }, 0);
    const load = vi.fn(async () => balance);
    now = 16_000;
    await gate.request(load, 1);
    expect(load).not.toHaveBeenCalled();
    expect(gate.handledRevision).toBe(0);
    now = 17_000;
    await gate.request(load, 1);
    expect(load).toHaveBeenCalledTimes(1);
    expect(gate.handledRevision).toBe(1);
  });
  it('hides failed balances, backs off, and recovers without showing zero', async () => {
    let now = 1000;
    const gate = new UsageRefreshPolicy(() => now);
    await gate.request(async () => balance, 0);
    now += 15_000;
    const failure = vi.fn(async () => {
      throw new Error('network');
    });
    expect(await gate.request(failure, 1)).toEqual({ available: false, reason: 'unavailable' });
    now += 29_999;
    await gate.request(failure, 1);
    expect(failure).toHaveBeenCalledTimes(1);
    now += 1;
    expect(await gate.request(async () => balance, 1)).toEqual(balance);
  });
  it('pauses invalid credentials until configuration changes or explicit retry', async () => {
    let now = 1000;
    const gate = new UsageRefreshPolicy(() => now);
    await gate.request(async () => ({ available: false, reason: 'invalid_credentials' }), 0);
    const load = vi.fn(async () => balance);
    now += 120_000;
    await gate.request(load, 1);
    expect(load).not.toHaveBeenCalled();
    gate.resume();
    await gate.request(load, 1);
    expect(load).toHaveBeenCalledTimes(1);
  });
  it('honors Retry-After even when users request manual refresh', async () => {
    let now = 1000;
    const gate = new UsageRefreshPolicy(() => now);
    await gate.request(
      async () => ({ available: false, reason: 'rate_limited', retryAfterMs: 90_000 }),
      0,
    );
    const load = vi.fn(async () => balance);
    gate.resume();
    now += 89_999;
    await gate.request(load, 0);
    expect(load).not.toHaveBeenCalled();
    now += 1;
    await gate.request(load, 0);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
