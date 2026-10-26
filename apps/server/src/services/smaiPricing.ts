import { createHash } from 'node:crypto';

import { convertSMAIPricing } from '@lobechat/model-runtime/providers/smai/pricing';
import { ssrfSafeFetch } from '@lobechat/ssrf-safe-fetch';
import type { Pricing } from 'model-bank';
import { z } from 'zod';

import { normalizeSmaiBaseURL } from '@/server/utils/smai';

const CACHE_TTL_MS = 5 * 60_000;
const RETRY_MS = 30_000;
const MAX_CACHE_ENTRIES = 100;

const pricingSchema = z.object({
  audio_completion_ratio: z.number().optional(),
  audio_ratio: z.number().optional(),
  billing_expr: z.string().optional(),
  billing_mode: z.string().optional(),
  cache_ratio: z.number().optional(),
  completion_ratio: z.number().optional(),
  create_cache_ratio: z.number().optional(),
  enable_groups: z.array(z.string()),
  image_ratio: z.number().optional(),
  model_name: z.string().min(1),
  model_price: z.number().optional(),
  model_ratio: z.number().optional(),
  quota_type: z.number().int(),
});
const responseSchema = z.object({
  data: z.array(z.unknown()).max(10_000),
  success: z.literal(true),
});

interface PricingProviderConfig {
  fetchOnClient?: boolean | null;
  keyVaults?: { apiKey?: string; baseURL?: string };
}

interface PricedModel {
  id: string;
  pricing?: Pricing | null;
  providerId?: string;
}

interface CacheEntry {
  expiresAt: number;
  pricing?: Map<string, Pricing>;
}

/** Refresh prices at read time so old imported rows never override a new quote. */
export class SmaiPricingService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly pending = new Map<string, Promise<Map<string, Pricing> | undefined>>();

  private async request(
    baseURL: string,
    apiKey?: string,
  ): Promise<Map<string, Pricing> | undefined> {
    try {
      // Share a deadline across the authenticated request and its public retry.
      const signal = AbortSignal.timeout(3_000);
      const fetchPricing = (authenticated: boolean) =>
        ssrfSafeFetch(
          `${baseURL}/api/pricing`,
          {
            credentials: 'omit',
            headers: {
              Accept: 'application/json; charset=utf-8',
              ...(authenticated && apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            },
            redirect: 'error',
            signal,
          },
          { allowPrivateIPAddress: false, maxContentLength: 2 * 1024 * 1024 },
        );

      let response: Response;
      let usedAuth = !!apiKey;
      try {
        response = await fetchPricing(usedAuth);
      } catch {
        if (!apiKey) return;
        usedAuth = false;
        response = await fetchPricing(false);
      }
      if (!response.ok && usedAuth) response = await fetchPricing(false);
      if (!response.ok) return;
      const body = responseSchema.safeParse(await response.json());
      if (!body.success) return;

      const pricing = new Map<string, Pricing>();
      for (const item of body.data.data) {
        const parsed = pricingSchema.safeParse(item);
        if (parsed.success) pricing.set(parsed.data.model_name, convertSMAIPricing(parsed.data));
      }
      return pricing;
    } catch {
      // Pricing outages must not prevent models from loading. Keep a last known
      // quote when available; otherwise retain the existing model metadata.
      return;
    }
  }

  private async getPricing(config?: PricingProviderConfig) {
    let baseURL: string;
    let apiKey: string | undefined;
    try {
      baseURL = normalizeSmaiBaseURL(config?.keyVaults?.baseURL || process.env.SMAI_PROXY_URL);
      // A user's custom gateway must never receive the deployment's API key.
      const serverGateway = normalizeSmaiBaseURL(process.env.SMAI_PROXY_URL);
      apiKey = (
        config?.keyVaults?.apiKey ||
        (baseURL === serverGateway ? process.env.SMAI_API_KEY : undefined)
      )?.trim();
    } catch {
      return;
    }
    const key = createHash('sha256')
      .update(JSON.stringify([baseURL, apiKey]))
      .digest('hex');
    const now = Date.now();
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > now) return cached.pricing;
    const pending = this.pending.get(key);
    if (pending) return pending;

    const request = this.request(baseURL, apiKey)
      .then((pricing) => {
        if (this.cache.size >= MAX_CACHE_ENTRIES && !this.cache.has(key)) {
          const oldest = this.cache.keys().next().value;
          if (oldest !== undefined) this.cache.delete(oldest);
        }
        const value = pricing ?? cached?.pricing;
        this.cache.set(key, {
          expiresAt: Date.now() + (pricing ? CACHE_TTL_MS : RETRY_MS),
          pricing: value,
        });
        return value;
      })
      .finally(() => this.pending.delete(key));
    this.pending.set(key, request);
    return request;
  }

  applyToModels = async <T extends PricedModel>(
    models: T[],
    config?: PricingProviderConfig,
  ): Promise<T[]> => {
    const isSmaiModel = (model: T) => !model.providerId || model.providerId === 'smai';
    // Respect providers configured to be reached only from the user's device.
    if (config?.fetchOnClient || !models.some(isSmaiModel)) return models;
    const pricing = await this.getPricing(config);
    if (!pricing?.size) return models;
    return models.map((model) => {
      const quote = isSmaiModel(model) ? pricing.get(model.id) : undefined;
      return quote ? { ...model, pricing: quote } : model;
    });
  };
}

export const smaiPricingService = new SmaiPricingService();
