// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { maskSmaiApiKey, normalizeSmaiUsageBaseURL, SmaiUsageService } from './index';

const { safeFetch } = vi.hoisted(() => ({ safeFetch: vi.fn() }));
vi.mock('@lobechat/ssrf-safe-fetch', () => ({ ssrfSafeFetch: safeFetch }));

const credentials = { apiKey: 'sk-personal-example', userId: 'user-one' };
const usage = {
  object: 'token_usage',
  total_available: 4_000_000,
  total_granted: 5_000_000,
  total_used: 1_000_000,
  unlimited_quota: false,
};
const status = { quota_display_type: 'USD', quota_per_unit: 250_000, usd_exchange_rate: 7.2 };
const json = (body: unknown, responseStatus = 200, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), { headers, status: responseStatus });
const mockSuccessfulProvider = () => {
  safeFetch.mockImplementation(async (url: string) =>
    url.endsWith('/api/status')
      ? json({ data: status, success: true })
      : json({ code: true, data: usage }),
  );
};
const usageCalls = () =>
  safeFetch.mock.calls.filter(([url]) => String(url).endsWith('/api/usage/token/'));

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-24T00:00:00Z'));
  mockSuccessfulProvider();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('normalizeSmaiUsageBaseURL', () => {
  it.each([
    [undefined, 'https://api.smai.ai'],
    ['https://provider.example/v1/', 'https://provider.example'],
    ['https://provider.example/proxy/v1beta///', 'https://provider.example/proxy'],
    ['https://provider.example/proxy/', 'https://provider.example/proxy'],
  ])('normalizes %s without losing a proxy prefix', (input, expected) => {
    expect(normalizeSmaiUsageBaseURL(input)).toBe(expected);
  });
  it.each(['file:///etc/passwd', 'https://user:password@provider.example'])('rejects %s', (url) => {
    expect(() => normalizeSmaiUsageBaseURL(url)).toThrow();
  });
});

describe('maskSmaiApiKey', () => {
  it.each([
    ['sk-124abcdefghijklmnopqrstuvwxyz123', 'sk-124****123'],
    ['short', 'sk-****'],
    ['sk-123456789', 'sk-****'],
    ['sk-1234567890', 'sk-123****890'],
  ])('returns only a safe hint for %s', (apiKey, expected) => {
    expect(maskSmaiApiKey(apiKey)).toBe(expected);
    expect(maskSmaiApiKey(apiKey)).not.toContain(apiKey);
  });
});

describe('SmaiUsageService', () => {
  it('queries the key and reads the actual conversion configuration without exposing secrets', async () => {
    const result = await new SmaiUsageService().getUsage({
      ...credentials,
      baseURL: 'https://provider.example/proxy/v1/',
    });
    expect(result).toMatchObject({
      available: true,
      data: {
        displayType: 'USD',
        keyHint: 'sk-per****ple',
        quotaPerUnit: 250_000,
        totalAvailable: 4_000_000,
        totalGranted: 5_000_000,
        totalUsed: 1_000_000,
        unlimitedQuota: false,
        usdExchangeRate: 7.2,
      },
    });
    expect(safeFetch).toHaveBeenCalledWith(
      'https://provider.example/proxy/api/usage/token/',
      expect.objectContaining({
        credentials: 'omit',
        headers: { Authorization: 'Bearer sk-personal-example' },
        redirect: 'error',
        signal: expect.any(AbortSignal),
      }),
      expect.objectContaining({ allowPrivateIPAddress: false, maxContentLength: 65_536 }),
    );
    const [, options] = safeFetch.mock.calls.find(([url]) => String(url).endsWith('/api/status'))!;
    expect(options.headers).toBeUndefined();
    expect(JSON.stringify(result)).not.toContain(credentials.apiKey);
  });
  it.each([undefined, '', 'sk-one,sk-two', 'sk-one\nsk-two'])(
    'requires one unambiguous personal key: %s',
    async (apiKey) => {
      expect(await new SmaiUsageService().getUsage({ apiKey, userId: 'user-one' })).toEqual({
        available: false,
        reason: 'not_configured',
      });
      expect(safeFetch).not.toHaveBeenCalled();
    },
  );
  it.each([401, 403])('reports HTTP %i without exposing the response', async (code) => {
    safeFetch.mockResolvedValue(json({ message: credentials.apiKey }, code));
    expect(await new SmaiUsageService().getUsage(credentials)).toEqual({
      available: false,
      reason: 'invalid_credentials',
    });
  });
  it.each([
    { code: false, data: usage },
    { data: usage, success: true },
    { code: true, data: { ...usage, object: 'wallet_usage' } },
    { code: true, data: { ...usage, total_available: '4000000' } },
  ])('requires code=true and the documented usage shape', async (body) => {
    safeFetch.mockResolvedValue(json(body));
    expect(await new SmaiUsageService().getUsage(credentials)).toEqual({
      available: false,
      reason: 'unavailable',
    });
  });
  it('preserves unlimited semantics with a zero remaining value', async () => {
    safeFetch.mockImplementation(async (url: string) =>
      url.endsWith('/api/status')
        ? json({ data: status, success: true })
        : json({ code: true, data: { ...usage, total_available: 0, unlimited_quota: true } }),
    );
    expect(await new SmaiUsageService().getUsage(credentials)).toMatchObject({
      available: true,
      data: { totalAvailable: 0, unlimitedQuota: true },
    });
  });
  it('does not invent a monetary conversion when status fails', async () => {
    safeFetch.mockImplementation(async (url: string) =>
      url.endsWith('/api/status') ? json({}, 500) : json({ code: true, data: usage }),
    );
    const result = await new SmaiUsageService().getUsage(credentials);
    expect(result.available).toBe(true);
    if (result.available) expect(result.data.quotaPerUnit).toBeUndefined();
  });
  it.each(['90', 'Sat, 24 Oct 2026 00:01:30 GMT'])('honors Retry-After %s', async (retryAfter) => {
    safeFetch.mockResolvedValue(json({}, 429, { 'retry-after': retryAfter }));
    expect(await new SmaiUsageService().getUsage(credentials)).toEqual({
      available: false,
      reason: 'rate_limited',
      retryAfterMs: 90_000,
    });
  });
  it('collapses concurrency, caches usage 15 seconds and status 15 minutes', async () => {
    const service = new SmaiUsageService();
    const results = await Promise.all(
      Array.from({ length: 10 }, () => service.getUsage(credentials)),
    );
    expect(results.every((result) => result.available)).toBe(true);
    expect(usageCalls()).toHaveLength(1);
    await service.getUsage(credentials);
    expect(usageCalls()).toHaveLength(1);
    vi.advanceTimersByTime(15_001);
    await service.getUsage(credentials);
    expect(usageCalls()).toHaveLength(2);
    expect(
      safeFetch.mock.calls.filter(([url]) => String(url).endsWith('/api/status')),
    ).toHaveLength(1);
    vi.advanceTimersByTime(15 * 60_000);
    await service.getUsage(credentials);
    expect(
      safeFetch.mock.calls.filter(([url]) => String(url).endsWith('/api/status')),
    ).toHaveLength(2);
  });
  it('separates users, keys and endpoints', async () => {
    const service = new SmaiUsageService();
    const results = await Promise.all([
      service.getUsage(credentials),
      service.getUsage({ ...credentials, userId: 'user-two' }),
      service.getUsage({ ...credentials, apiKey: 'sk-another-key' }),
      service.getUsage({ ...credentials, baseURL: 'https://another.example/v1' }),
    ]);
    expect(usageCalls()).toHaveLength(4);
    expect(new Set(results.flatMap((r) => (r.available ? [r.credentialId] : []))).size).toBe(4);
  });
  it('hides expired balances on failure and recovers without caching the failure as zero', async () => {
    const service = new SmaiUsageService();
    await service.getUsage(credentials);
    vi.advanceTimersByTime(15_001);
    safeFetch.mockRejectedValue(new Error('sensitive upstream timeout details'));
    expect(await service.getUsage(credentials)).toEqual({
      available: false,
      reason: 'unavailable',
    });
    mockSuccessfulProvider();
    expect(await service.getUsage(credentials)).toMatchObject({ available: true });
    expect(usageCalls()).toHaveLength(3);
  });
});
