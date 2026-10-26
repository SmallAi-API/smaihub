import { ssrfSafeFetch } from '@lobechat/ssrf-safe-fetch';
import type { Pricing } from 'model-bank';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SmaiPricingService } from './smaiPricing';

vi.mock('@lobechat/ssrf-safe-fetch', () => ({ ssrfSafeFetch: vi.fn() }));

const pricingItem = {
  billing_expr: 'tier("默认", p * 2 + cr * 0.1 + cc * 2.5 + c * 10)',
  billing_mode: 'tiered_expr',
  completion_ratio: 2,
  enable_groups: ['default'],
  model_name: 'gpt-6.1-sol',
  model_ratio: 37.5,
  quota_type: 0,
};
const response = (item = pricingItem) =>
  new Response(JSON.stringify({ data: [item], success: true }));
const oldPricing: Pricing = {
  units: [{ name: 'textInput', rate: 75, strategy: 'fixed', unit: 'millionTokens' }],
};
const models = () => [
  { enabled: true, id: 'gpt-6.1-sol', pricing: oldPricing, providerId: 'smai', sort: 3 },
];
const inputRate = (data: Awaited<ReturnType<SmaiPricingService['applyToModels']>>) =>
  data[0].pricing?.units.find((unit) => unit.name === 'textInput');

describe('SmaiPricingService', () => {
  let service: SmaiPricingService;

  beforeEach(() => {
    service = new SmaiPricingService();
    vi.mocked(ssrfSafeFetch).mockReset();
    vi.mocked(ssrfSafeFetch).mockImplementation(async () => response());
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-26T00:00:00Z'));
    vi.stubEnv('SMAI_PROXY_URL', undefined);
    vi.stubEnv('SMAI_API_KEY', undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('prices the built-in list from the default public endpoint without importing models', async () => {
    const original = [
      ...models(),
      { enabled: false, id: 'unlisted-model', pricing: oldPricing, providerId: 'smai', sort: 4 },
    ];
    const result = await service.applyToModels(original);

    expect(inputRate(result)).toMatchObject({ rate: 2 });
    expect(result[0]).toMatchObject({ enabled: true, sort: 3 });
    expect(result[1]).toBe(original[1]);
    expect(original[0].pricing).toBe(oldPricing);
    expect(ssrfSafeFetch).toHaveBeenCalledWith(
      'https://api.smai.ai/api/pricing',
      expect.objectContaining({
        credentials: 'omit',
        headers: { Accept: 'application/json; charset=utf-8' },
        redirect: 'error',
        signal: expect.any(AbortSignal),
      }),
      { allowPrivateIPAddress: false, maxContentLength: 2 * 1024 * 1024 },
    );
  });

  it('respects the configured gateway prefix and credentials and shares the deadline with public retry', async () => {
    vi.mocked(ssrfSafeFetch).mockResolvedValueOnce(new Response('', { status: 401 }));
    const config = {
      keyVaults: { apiKey: ' test-key ', baseURL: 'https://gateway.example/proxy/v1/' },
    };
    const result = await service.applyToModels(models(), config);

    expect(inputRate(result)).toMatchObject({ rate: 2 });
    expect(ssrfSafeFetch).toHaveBeenCalledTimes(2);
    const [first, second] = vi.mocked(ssrfSafeFetch).mock.calls;
    expect(first[0]).toBe('https://gateway.example/proxy/api/pricing');
    expect(first[1]?.headers).toMatchObject({ Authorization: 'Bearer test-key' });
    expect(second[1]?.headers).not.toHaveProperty('Authorization');
    expect(second[1]?.signal).toBe(first[1]?.signal);
  });

  it('retries network rejection without auth exactly once', async () => {
    vi.mocked(ssrfSafeFetch).mockRejectedValueOnce(new Error('network'));
    vi.mocked(ssrfSafeFetch).mockResolvedValueOnce(new Response('', { status: 503 }));
    const original = models();

    expect(await service.applyToModels(original, { keyVaults: { apiKey: 'key' } })).toBe(original);
    expect(ssrfSafeFetch).toHaveBeenCalledTimes(2);
  });

  it('caches prices for five minutes and coalesces simultaneous readers', async () => {
    await Promise.all([service.applyToModels(models()), service.applyToModels(models())]);
    await service.applyToModels(models());
    expect(ssrfSafeFetch).toHaveBeenCalledTimes(1);

    vi.setSystemTime(Date.now() + 300_001);
    vi.mocked(ssrfSafeFetch).mockResolvedValueOnce(
      response({ ...pricingItem, billing_expr: 'tier("new", p * 3 + c * 12)' }),
    );

    expect(inputRate(await service.applyToModels(models()))).toMatchObject({ rate: 3 });
    expect(ssrfSafeFetch).toHaveBeenCalledTimes(2);
  });

  it('isolates caches by endpoint and credentials', async () => {
    await service.applyToModels(models(), { keyVaults: { apiKey: 'key-one' } });
    await service.applyToModels(models(), { keyVaults: { apiKey: 'key-two' } });
    await service.applyToModels(models(), {
      keyVaults: { apiKey: 'key-two', baseURL: 'https://other.example/v1' },
    });

    expect(ssrfSafeFetch).toHaveBeenCalledTimes(3);
  });

  it('uses deployment credentials for the deployment gateway when no personal configuration exists', async () => {
    vi.stubEnv('SMAI_PROXY_URL', 'https://deployment.example/v1');
    vi.stubEnv('SMAI_API_KEY', 'deployment-key');
    await service.applyToModels(models());

    expect(ssrfSafeFetch).toHaveBeenCalledWith(
      'https://deployment.example/api/pricing',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer deployment-key' }),
      }),
      expect.anything(),
    );
  });

  it('never sends deployment credentials to a personally configured gateway', async () => {
    vi.stubEnv('SMAI_PROXY_URL', 'https://deployment.example/v1');
    vi.stubEnv('SMAI_API_KEY', 'deployment-key');
    await service.applyToModels(models(), {
      keyVaults: { baseURL: 'https://personal.example/v1' },
    });

    expect(vi.mocked(ssrfSafeFetch).mock.calls[0][0]).toBe('https://personal.example/api/pricing');
    expect(vi.mocked(ssrfSafeFetch).mock.calls[0][1]?.headers).not.toHaveProperty('Authorization');
  });

  it('keeps a previous quote on a temporary outage and throttles retries', async () => {
    await service.applyToModels(models());
    vi.setSystemTime(Date.now() + 300_001);
    vi.mocked(ssrfSafeFetch).mockRejectedValueOnce(new Error('timeout'));

    expect(inputRate(await service.applyToModels(models()))).toMatchObject({ rate: 2 });
    expect(inputRate(await service.applyToModels(models()))).toMatchObject({ rate: 2 });
    expect(ssrfSafeFetch).toHaveBeenCalledTimes(2);

    vi.setSystemTime(Date.now() + 30_001);
    await service.applyToModels(models());
    expect(ssrfSafeFetch).toHaveBeenCalledTimes(3);
  });

  it('retains saved metadata on initial failure and retries on a later model load', async () => {
    vi.mocked(ssrfSafeFetch).mockRejectedValueOnce(new Error('timeout'));
    const original = models();

    expect(await service.applyToModels(original)).toBe(original);
    expect(await service.applyToModels(original)).toBe(original);
    expect(ssrfSafeFetch).toHaveBeenCalledTimes(1);

    vi.setSystemTime(Date.now() + 30_001);
    expect(inputRate(await service.applyToModels(original))).toMatchObject({ rate: 2 });
  });

  it.each([
    { data: [pricingItem], success: false },
    { data: {}, success: true },
    { data: [{ ...pricingItem, model_ratio: '37.5' }], success: true },
    { data: [], success: true },
    { data: Array.from({ length: 10_001 }).fill(null), success: true },
  ])('keeps saved models for invalid or empty responses', async (body) => {
    vi.mocked(ssrfSafeFetch).mockResolvedValueOnce(new Response(JSON.stringify(body)));
    const original = models();
    expect(await service.applyToModels(original)).toBe(original);
  });

  it('keeps saved prices when the response is not JSON or has a non-OK status', async () => {
    const original = models();
    vi.mocked(ssrfSafeFetch).mockResolvedValueOnce(new Response('invalid JSON'));
    expect(await service.applyToModels(original)).toBe(original);
    vi.setSystemTime(Date.now() + 30_001);
    vi.mocked(ssrfSafeFetch).mockResolvedValueOnce(new Response('', { status: 503 }));
    expect(await service.applyToModels(original)).toBe(original);
  });

  it('replaces an unsupported expression with unknown pricing instead of old ratio prices', async () => {
    vi.mocked(ssrfSafeFetch).mockResolvedValueOnce(
      response({
        ...pricingItem,
        billing_expr: 'tier("base", p * 0.5) * (hour("Asia/Shanghai") < 12 ? 2 : 1)',
      }),
    );
    expect((await service.applyToModels(models()))[0].pricing).toEqual({ units: [] });
  });

  it('supports model lists with no providerId, including legacy ratio pricing', async () => {
    vi.mocked(ssrfSafeFetch).mockResolvedValueOnce(
      response({ ...pricingItem, billing_mode: 'ratio', model_ratio: 0 }),
    );
    expect(inputRate(await service.applyToModels([{ id: 'gpt-6.1-sol' }]))).toMatchObject({
      rate: 0,
    });
  });

  it('skips other providers, empty lists and providers reached from the browser only', async () => {
    const other = [{ id: 'gpt-6.1-sol', pricing: oldPricing, providerId: 'openai' }];
    expect(await service.applyToModels(other)).toBe(other);
    expect(await service.applyToModels([])).toEqual([]);
    await service.applyToModels(models(), { fetchOnClient: true });
    expect(ssrfSafeFetch).not.toHaveBeenCalled();
  });

  it('updates SMAI only when another provider offers the same model', async () => {
    const other = { ...models()[0], providerId: 'openai' };
    const result = await service.applyToModels([...models(), other]);
    expect(inputRate(result)).toMatchObject({ rate: 2 });
    expect(result[1]).toBe(other);
  });

  it.each(['file:///tmp/pricing', 'https://user:password@example.com', 'not a URL'])(
    'rejects invalid gateway URLs: %s',
    async (baseURL) => {
      const original = models();
      expect(await service.applyToModels(original, { keyVaults: { baseURL } })).toBe(original);
      expect(ssrfSafeFetch).not.toHaveBeenCalled();
    },
  );

  it('bounds retained cache entries', async () => {
    for (let index = 0; index < 101; index += 1) {
      await service.applyToModels(models(), {
        keyVaults: { baseURL: `https://gateway-${index}.example` },
      });
    }
    await service.applyToModels(models(), { keyVaults: { baseURL: 'https://gateway-0.example' } });
    expect(ssrfSafeFetch).toHaveBeenCalledTimes(102);
  });
});
