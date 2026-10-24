import type { SmaiUsageResult } from '@/types/smaiUsage';

export const USAGE_MIN_INTERVAL = 15_000;
export const USAGE_POLL_INTERVAL = 120_000;
export const USAGE_FOCUS_STALE_TIME = 30_000;
export const USAGE_SETTLEMENT_DELAY = 6_000;

/** Per-credential, memory-only request budget shared by every refresh trigger. */
export class UsageRefreshPolicy {
  handledRevision = -1;
  lastSuccessAt = 0;
  nextAllowedAt = 0;
  result: SmaiUsageResult | undefined;
  private blocked = false;
  private failures = 0;
  private pending?: Promise<SmaiUsageResult>;

  constructor(private readonly now = Date.now) {}

  get paused() {
    return this.blocked;
  }

  resume() {
    this.blocked = false;
  }

  needsRefresh(revision: number) {
    return (
      !this.result ||
      revision > this.handledRevision ||
      this.now() - this.lastSuccessAt >= USAGE_FOCUS_STALE_TIME
    );
  }

  async request(load: () => Promise<SmaiUsageResult>, revision: number): Promise<SmaiUsageResult> {
    if (this.pending) return this.pending;
    if (this.blocked || this.now() < this.nextAllowedAt) {
      return this.result ?? { available: false, reason: 'unavailable' };
    }

    this.nextAllowedAt = this.now() + USAGE_MIN_INTERVAL;
    this.pending = (async () => {
      let result: SmaiUsageResult;
      try {
        result = await load();
      } catch {
        // Never interpret a transport/auth failure as a zero balance.
        result = { available: false, reason: 'unavailable' };
      }
      this.result = result;
      if (result.available) {
        this.lastSuccessAt = this.now();
        // The upstream proxy caches after reading quota. Start the cooldown on
        // receipt so a slow response cannot consume the entire cache lifetime.
        this.nextAllowedAt = this.now() + USAGE_MIN_INTERVAL;
        this.handledRevision = revision;
        this.failures = 0;
      } else {
        this.failures += 1;
        this.blocked =
          result.reason === 'invalid_credentials' || result.reason === 'not_configured';
        this.nextAllowedAt = Math.max(
          this.nextAllowedAt,
          this.now() +
            (result.retryAfterMs ?? Math.min(30_000 * 2 ** (this.failures - 1), 120_000)),
        );
      }
      return result;
    })();
    try {
      return await this.pending;
    } finally {
      this.pending = undefined;
    }
  }
}
