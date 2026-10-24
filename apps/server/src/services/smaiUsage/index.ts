import { createHmac, randomBytes } from 'node:crypto';

import { ssrfSafeFetch } from '@lobechat/ssrf-safe-fetch';
import { z } from 'zod';

import type { SmaiUsageData, SmaiUsageResult } from '@/types/smaiUsage';

const USAGE_CACHE_MS = 15_000;
const STATUS_CACHE_MS = 15 * 60_000;
const MAX_CACHE_ENTRIES = 500;
const usageSchema = z.object({
  code: z.literal(true),
  data: z.object({
    object: z.literal('token_usage'),
    total_available: z.number().int(),
    total_granted: z.number().int().nonnegative(),
    total_used: z.number().int().nonnegative(),
    unlimited_quota: z.boolean(),
  }),
});
const statusSchema = z.object({
  data: z.object({
    quota_display_type: z.string().optional(),
    quota_per_unit: z.number().positive(),
    usd_exchange_rate: z.number().positive().optional(),
  }),
  success: z.literal(true),
});
type QuotaDisplayConfig = Pick<SmaiUsageData, 'displayType' | 'quotaPerUnit' | 'usdExchangeRate'>;
interface Credentials {
  apiKey?: string;
  baseURL?: string;
  userId: string;
}
interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

/** Keep a proxy's path prefix, removing only the model API's trailing version. */
export const normalizeSmaiUsageBaseURL = (baseURL?: string): string => {
  const url = new URL(baseURL?.trim() || 'https://api.smai.ai');
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Unsupported provider URL');
  }
  url.search = '';
  url.hash = '';
  url.pathname = url.pathname.replace(/\/+$/, '').replace(/\/v\d+[a-z]*$/i, '');
  return url.toString().replace(/\/$/, '');
};

const retryAfterMilliseconds = (value: string | null, now: number): number => {
  const seconds = value?.trim() ? Number(value) : Number.NaN;
  const delay = Number.isFinite(seconds)
    ? seconds * 1000
    : value
      ? Date.parse(value) - now
      : Number.NaN;
  return Number.isFinite(delay) ? Math.max(1000, delay) : 60_000;
};

/** Keep only a short prefix and suffix for recognition; never return the credential itself. */
export const maskSmaiApiKey = (apiKey: string): string => {
  const key = apiKey.trim();
  if (key.length < 13) return 'sk-****';

  const prefix = key.startsWith('sk-') ? key.slice(0, 6) : key.slice(0, 3);
  return `${prefix}****${key.slice(-3)}`;
};

/** Uses explicitly supplied personal credentials, never a deployment's API key. */
export class SmaiUsageService {
  private readonly cacheSecret = randomBytes(32);
  private readonly usageCache = new Map<string, CacheEntry<SmaiUsageResult>>();
  private readonly statusCache = new Map<string, CacheEntry<QuotaDisplayConfig>>();
  private readonly pendingUsage = new Map<string, Promise<SmaiUsageResult>>();
  private readonly pendingStatus = new Map<string, Promise<QuotaDisplayConfig | undefined>>();

  private remember<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T, ttl: number) {
    const now = Date.now();
    if (cache.size >= MAX_CACHE_ENTRIES) {
      for (const [entryKey, entry] of cache) {
        if (entry.expiresAt <= now) cache.delete(entryKey);
      }
      if (cache.size >= MAX_CACHE_ENTRIES) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) cache.delete(oldest);
      }
    }
    cache.set(key, { expiresAt: now + ttl, value });
  }

  private request(url: string, apiKey?: string) {
    return ssrfSafeFetch(
      url,
      {
        credentials: 'omit',
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
        method: 'GET',
        redirect: 'error',
        signal: AbortSignal.timeout(8_000),
      },
      { allowPrivateIPAddress: false, maxContentLength: 64 * 1024 },
    );
  }

  private async getDisplayConfig(baseURL: string): Promise<QuotaDisplayConfig | undefined> {
    const hit = this.statusCache.get(baseURL);
    if (hit && hit.expiresAt > Date.now()) return hit.value;
    const pending = this.pendingStatus.get(baseURL);
    if (pending) return pending;
    const fetch = async () => {
      try {
        const response = await this.request(`${baseURL}/api/status`);
        if (response.status !== 200) return;
        const body = statusSchema.safeParse(await response.json());
        if (!body.success) return;
        const config = {
          displayType: body.data.data.quota_display_type,
          quotaPerUnit: body.data.data.quota_per_unit,
          usdExchangeRate: body.data.data.usd_exchange_rate,
        };
        this.remember(this.statusCache, baseURL, config, STATUS_CACHE_MS);
        return config;
      } catch {
        return;
      }
    };
    const promise = fetch().finally(() => this.pendingStatus.delete(baseURL));
    this.pendingStatus.set(baseURL, promise);
    return promise;
  }

  getUsage = async ({
    apiKey: rawKey,
    baseURL: rawURL,
    userId,
  }: Credentials): Promise<SmaiUsageResult> => {
    const apiKey = rawKey?.trim();
    if (!apiKey || /[,\s]/.test(apiKey)) return { available: false, reason: 'not_configured' };
    let baseURL: string;
    try {
      baseURL = normalizeSmaiUsageBaseURL(rawURL);
    } catch {
      return { available: false, reason: 'not_configured' };
    }
    const credentialId = createHmac('sha256', this.cacheSecret)
      .update(JSON.stringify([userId, baseURL, apiKey]))
      .digest('hex');
    const hit = this.usageCache.get(credentialId);
    if (hit && hit.expiresAt > Date.now()) return hit.value;
    const pending = this.pendingUsage.get(credentialId);
    if (pending) return pending;
    const fetch = async (): Promise<SmaiUsageResult> => {
      try {
        const response = await this.request(`${baseURL}/api/usage/token/`, apiKey);
        if (response.status === 401 || response.status === 403) {
          return { available: false, reason: 'invalid_credentials' };
        }
        if (response.status === 429) {
          return {
            available: false,
            reason: 'rate_limited',
            retryAfterMs: retryAfterMilliseconds(response.headers.get('retry-after'), Date.now()),
          };
        }
        if (response.status !== 200) return { available: false, reason: 'unavailable' };
        const body = usageSchema.safeParse(await response.json());
        if (!body.success) return { available: false, reason: 'unavailable' };
        const updatedAt = Date.now();
        const config = await this.getDisplayConfig(baseURL);
        const result: SmaiUsageResult = {
          available: true,
          credentialId,
          data: {
            ...config,
            keyHint: maskSmaiApiKey(apiKey),
            totalAvailable: body.data.data.total_available,
            totalGranted: body.data.data.total_granted,
            totalUsed: body.data.data.total_used,
            unlimitedQuota: body.data.data.unlimited_quota,
            updatedAt,
          },
        };
        this.remember(
          this.usageCache,
          credentialId,
          result,
          Math.max(0, updatedAt + USAGE_CACHE_MS - Date.now()),
        );
        return result;
      } catch {
        // Upstream errors may contain credentials; never return/log them.
        return { available: false, reason: 'unavailable' };
      }
    };
    const promise = fetch().finally(() => this.pendingUsage.delete(credentialId));
    this.pendingUsage.set(credentialId, promise);
    return promise;
  };
}

export const smaiUsageService = new SmaiUsageService();
