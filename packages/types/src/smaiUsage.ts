export interface SmaiUsageData {
  displayType?: string;
  /** Server-generated safe hint; never contains the full API key. */
  keyHint?: string;
  quotaPerUnit?: number;
  totalAvailable: number;
  totalGranted: number;
  totalUsed: number;
  unlimitedQuota: boolean;
  updatedAt: number;
  usdExchangeRate?: number;
}

export type SmaiUsageUnavailableReason =
  'invalid_credentials' | 'not_configured' | 'rate_limited' | 'unavailable';

export type SmaiUsageResult =
  | {
      available: false;
      reason: SmaiUsageUnavailableReason;
      retryAfterMs?: number;
    }
  | {
      available: true;
      /** Opaque identity of this user's endpoint and credential; never the API key. */
      credentialId: string;
      data: SmaiUsageData;
    };
