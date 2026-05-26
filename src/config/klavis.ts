import type { LobeChatDatabase } from '@lobechat/database';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

import { UserModel, UserNotFoundError } from '@/database/models/user';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';

/**
 * Klavis Service Configuration (BYOK)
 *
 * Resolution order for the API key per request:
 * 1. The calling user's `keyVaults.klavis.apiKey` (encrypted at rest, decrypted via KeyVaultsGateKeeper)
 * 2. Fallback to env `KLAVIS_API_KEY`
 * 3. If neither exists, the caller throws KLAVIS_KEY_REQUIRED
 *
 * Security:
 * - The user-level key is never returned to the client.
 * - The env key is server-side only.
 * - Hard failures (DB down, decryption broken) are surfaced rather than silently
 *   swapped for the env key — that would let one user execute calls under another
 *   tenant's identity if KEY_VAULTS_SECRET is misconfigured.
 */
export const getKlavisConfig = () => {
  return createEnv({
    client: {},
    runtimeEnv: {
      KLAVIS_API_KEY: process.env.KLAVIS_API_KEY,
    },
    server: {
      KLAVIS_API_KEY: z.string().optional(),
    },
  });
};

export const klavisEnv = getKlavisConfig();

/**
 * Get env-level Klavis API Key (server-side only).
 */
export const getServerKlavisApiKey = (): string | undefined => {
  if (typeof window !== 'undefined') {
    console.error('[Klavis] Attempted to access API key from client-side!');
    return undefined;
  }
  return klavisEnv.KLAVIS_API_KEY;
};

/**
 * Resolve the Klavis API key for a given user (server-side only).
 *
 * - Returns the user's decrypted key when present.
 * - Falls back to the env key only when:
 *   • caller has no userId/db (anonymous flows), or
 *   • the user row genuinely does not exist yet (UserNotFoundError).
 * - Re-throws on DB / decryption / unknown errors so misconfiguration is loud
 *   instead of silently downgrading to a shared identity.
 */
export const getKlavisApiKeyForUser = async (
  userId: string | undefined,
  db: LobeChatDatabase | undefined,
): Promise<string | undefined> => {
  if (typeof window !== 'undefined') {
    console.error('[Klavis] Attempted to access API key from client-side!');
    return undefined;
  }

  if (userId && db) {
    try {
      const keyVaults = await UserModel.getUserApiKeys(
        db,
        userId,
        KeyVaultsGateKeeper.getUserKeyVaults,
      );
      const userKey = keyVaults?.klavis?.apiKey;
      if (userKey) return userKey;
    } catch (error) {
      // Only fall back when the user row is genuinely missing (e.g., very
      // first call before user record materializes). Anything else is a real
      // server error and must surface.
      if (!(error instanceof UserNotFoundError)) {
        console.error('[Klavis] Failed to read user keyVaults:', error);
        throw error;
      }
    }
  }

  return getServerKlavisApiKey();
};
