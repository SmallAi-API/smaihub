import type { LobeChatDatabase } from '@lobechat/database';
import { TRPCError } from '@trpc/server';
import { KlavisClient } from 'klavis';

import { getKlavisApiKeyForUser, getServerKlavisApiKey } from '@/config/klavis';

/**
 * Klavis Client cache (server-side only)
 *
 * BYOK: each user may bring their own key, so we cache one client per apiKey
 * (not per userId — different users sharing the same key reuse the same client).
 *
 * A small LRU cap prevents unbounded growth when users rotate keys frequently.
 */
const CACHE_CAP = 32;
const klavisClientCache = new Map<string, KlavisClient>();

const cacheClient = (apiKey: string): KlavisClient => {
  const existing = klavisClientCache.get(apiKey);
  if (existing) {
    // Refresh LRU position
    klavisClientCache.delete(apiKey);
    klavisClientCache.set(apiKey, existing);
    return existing;
  }

  const client = new KlavisClient({ apiKey });
  klavisClientCache.set(apiKey, client);

  if (klavisClientCache.size > CACHE_CAP) {
    const oldestKey = klavisClientCache.keys().next().value;
    if (oldestKey) klavisClientCache.delete(oldestKey);
  }

  return client;
};

/**
 * Get a Klavis Client for the given user.
 *
 * Throws TRPCError(PRECONDITION_FAILED, 'KLAVIS_KEY_REQUIRED') when neither
 * a user-level key nor an env-level fallback is configured.
 */
export const getKlavisClientForUser = async (
  userId: string | undefined,
  db: LobeChatDatabase | undefined,
): Promise<KlavisClient> => {
  const apiKey = await getKlavisApiKeyForUser(userId, db);

  if (!apiKey) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: 'KLAVIS_KEY_REQUIRED',
    });
  }

  return cacheClient(apiKey);
};

/**
 * Same as getKlavisClientForUser but returns undefined when no key is available
 * instead of throwing. Use for non-critical paths (e.g., manifest listing).
 */
export const tryGetKlavisClientForUser = async (
  userId: string | undefined,
  db: LobeChatDatabase | undefined,
): Promise<KlavisClient | undefined> => {
  const apiKey = await getKlavisApiKeyForUser(userId, db);
  if (!apiKey) return undefined;
  return cacheClient(apiKey);
};

/**
 * @deprecated Prefer `getKlavisClientForUser` — this falls back to the env key only
 * and is kept for paths that have no user/db context.
 */
export const getKlavisClient = (): KlavisClient => {
  const apiKey = getServerKlavisApiKey();
  if (!apiKey) {
    throw new Error('Klavis API key is not configured on server');
  }
  return cacheClient(apiKey);
};

/**
 * Check whether a Klavis client can be created from the env key alone.
 * For BYOK availability use `tryGetKlavisClientForUser` instead.
 */
export const isKlavisClientAvailable = (): boolean => {
  return !!getServerKlavisApiKey();
};
