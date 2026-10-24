import type { AiProviderRuntimeConfig } from '@/types/aiProvider';

import { UsageRefreshPolicy } from './refreshPolicy';

let sequence = 0;
let current:
  | {
      apiKey: string;
      baseURL: string;
      identity: { id: number; policy: UsageRefreshPolicy };
      userId: string;
    }
  | undefined;

export const hasSingleSmaiKey = (config: AiProviderRuntimeConfig | undefined) => {
  const key = config?.keyVaults.apiKey?.trim();
  return !!key && !/[,\s]/.test(key);
};

/** Compare credentials only in memory; never copy secrets into an SWR key.
 * Runtime hydration may replace config objects without changing the credential.
 */
export const getUsageIdentity = (config: AiProviderRuntimeConfig, userId: string) => {
  const apiKey = config.keyVaults.apiKey?.trim() || '';
  const baseURL = config.keyVaults.baseURL?.trim() || '';
  if (current?.userId !== userId || current.apiKey !== apiKey || current.baseURL !== baseURL) {
    current = {
      apiKey,
      baseURL,
      identity: { id: ++sequence, policy: new UsageRefreshPolicy() },
      userId,
    };
  }
  return current.identity;
};
