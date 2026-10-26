import type { Pricing, PricingUnit, PricingUnitName } from 'model-bank';

import type { SMAITokenTier, SMAITokenVariable } from './billingExpression';
import { parseSMAIBillingExpression } from './billingExpression';

/** Public model/pricing.go contract in the SMAI new-api service. */
export interface SMAIPricing {
  audio_completion_ratio?: number;
  audio_ratio?: number;
  billing_expr?: string;
  billing_mode?: string;
  cache_ratio?: number;
  completion_ratio?: number;
  create_cache_ratio?: number;
  description?: string;
  enable_groups: string[];
  image_ratio?: number;
  model_name: string;
  model_price?: number;
  model_ratio?: number;
  /** 0: token billing; 1: USD per request (never a token price). */
  quota_type: number;
  supported_endpoint_types?: string[];
}

const TOKEN_UNITS: Partial<Record<SMAITokenVariable, PricingUnitName>> = {
  ai: 'audioInput',
  ao: 'audioOutput',
  c: 'textOutput',
  cr: 'textInput_cacheRead',
  img: 'imageInput',
  img_cr: 'imageInput_cacheRead',
  img_o: 'imageOutput',
  p: 'textInput',
};

const isRate = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

const createUnit = (
  name: PricingUnitName,
  tiers: SMAITokenTier[],
  variable: SMAITokenVariable,
): PricingUnit => {
  const rates = tiers.map((tier) => tier.rates[variable] ?? 0);
  if (rates.every((rate) => rate === rates[0])) {
    return { name, rate: rates[0], strategy: 'fixed', unit: 'millionTokens' };
  }
  return {
    name,
    strategy: 'tiered',
    tiers: tiers.map((tier, index) => ({ rate: rates[index], upTo: tier.upTo })),
    unit: 'millionTokens',
  };
};

const createCacheWriteUnit = (tiers: SMAITokenTier[]): PricingUnit | undefined => {
  const variables = tiers[0].rates;
  const hasHour = variables.cc1h !== undefined;
  const has12Hours = variables.cc12h !== undefined;
  if (variables.cc === undefined && !hasHour && !has12Hours) return undefined;
  if (!hasHour && !has12Hours) return createUnit('textInput_cacheWrite', tiers, 'cc');

  // When only a long-lived cache category is opt-in, ordinary writes remain
  // inside p upstream. Their price is the base input rate, not the long TTL.
  const cacheTiers = tiers.map((tier) => ({
    ...tier,
    rates: { ...tier.rates, cc: tier.rates.cc ?? tier.rates.p ?? 0 },
  }));

  // cc is the default write duration: 5m with Claude's cc1h, 30m with
  // OpenAI's cc12h. With both explicit long TTLs, avoid assigning a vendor TTL.
  const defaultTTL = hasHour ? (has12Hours ? 'default' : '5m') : '30m';
  const durations: [string, SMAITokenVariable][] = [
    [defaultTTL, 'cc'],
    ['1h', 'cc1h'],
    ['12h', 'cc12h'],
  ];
  const present = durations.filter(([, variable]) => cacheTiers[0].rates[variable] !== undefined);
  const variesByContext = present.some(([, variable]) =>
    cacheTiers.some((tier) => tier.rates[variable] !== cacheTiers[0].rates[variable]),
  );
  const prices: Record<string, number> = {};
  let start = 0;
  for (const tier of variesByContext ? cacheTiers : [cacheTiers[0]]) {
    for (const [ttl, variable] of present) {
      const key = variesByContext ? `[${start}, ${tier.upTo}]_${ttl}` : ttl;
      prices[key] = tier.rates[variable]!;
    }
    if (tier.upTo !== 'infinity') start = tier.upTo + 1;
  }
  return {
    lookup: { prices, pricingParams: variesByContext ? ['textInputRange', 'ttl'] : ['ttl'] },
    name: 'textInput_cacheWrite',
    strategy: 'lookup',
    unit: 'millionTokens',
  };
};

/**
 * An authoritative empty units array clears previously imported prices on model
 * refresh. undefined/null would preserve the old database value instead.
 */
export const convertSMAIPricing = (pricing: SMAIPricing): Pricing => {
  if (pricing.billing_mode === 'tiered_expr') {
    const tiers = parseSMAIBillingExpression(pricing.billing_expr ?? '');
    if (!tiers) return { units: [] };
    const units: PricingUnit[] = [];
    for (const [variable, name] of Object.entries(TOKEN_UNITS)) {
      if (tiers[0].rates[variable as SMAITokenVariable] !== undefined) {
        units.push(createUnit(name, tiers, variable as SMAITokenVariable));
      }
    }
    const cacheWrite = createCacheWriteUnit(tiers);
    if (cacheWrite) units.push(cacheWrite);
    return { units };
  }

  // model_price is a per-request USD amount only when quota_type is 1.
  // Unknown billing modes must not silently reuse stale ratio fields either.
  if (
    (pricing.billing_mode && pricing.billing_mode !== 'ratio') ||
    pricing.quota_type !== 0 ||
    !isRate(pricing.model_ratio)
  ) {
    return { units: [] };
  }
  const input = pricing.model_ratio * 2;
  const completionRatio = pricing.completion_ratio ?? 1;
  const units: PricingUnit[] = [];
  const add = (name: PricingUnitName, rate: number) => {
    if (!isRate(rate)) return false;
    units.push({ name, rate, strategy: 'fixed', unit: 'millionTokens' });
    return true;
  };
  if (
    !isRate(completionRatio) ||
    !add('textInput', input) ||
    !add('textOutput', input * completionRatio)
  ) {
    return { units: [] };
  }
  const relativeRates: [PricingUnitName, number | undefined][] = [
    ['textInput_cacheRead', pricing.cache_ratio],
    ['textInput_cacheWrite', pricing.create_cache_ratio],
    ['imageInput', pricing.image_ratio],
  ];
  for (const [name, ratio] of relativeRates) {
    if (ratio !== undefined && (!isRate(ratio) || !add(name, input * ratio))) return { units: [] };
  }
  if (pricing.audio_ratio !== undefined || pricing.audio_completion_ratio !== undefined) {
    const audioRatio = pricing.audio_ratio ?? 1;
    const audioCompletionRatio = pricing.audio_completion_ratio ?? 1;
    if (
      !isRate(audioRatio) ||
      !isRate(audioCompletionRatio) ||
      !add('audioInput', input * audioRatio) ||
      !add('audioOutput', input * audioRatio * audioCompletionRatio)
    ) {
      return { units: [] };
    }
  }
  return { units };
};
