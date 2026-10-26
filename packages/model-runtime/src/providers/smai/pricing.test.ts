import type { PricingUnitName } from 'model-bank';
import { describe, expect, it } from 'vitest';

import type { SMAIPricing } from './pricing';
import { convertSMAIPricing } from './pricing';

const expressionPricing = (billing_expr: string): SMAIPricing => ({
  billing_expr,
  billing_mode: 'tiered_expr',
  completion_ratio: 2,
  enable_groups: ['default'],
  model_name: 'gpt-6.1-sol',
  model_price: 0,
  model_ratio: 37.5,
  quota_type: 0,
});

const fixedUnit = (name: PricingUnitName, rate: number) => ({
  name,
  rate,
  strategy: 'fixed',
  unit: 'millionTokens',
});

describe('convertSMAIPricing', () => {
  it('prices ordinary cache writes at the input rate when only long writes are split out', () => {
    expect(
      convertSMAIPricing(expressionPricing('tier("x", p * 2 + cc1h * 4)')).units,
    ).toContainEqual({
      lookup: { prices: { '1h': 4, '5m': 2 }, pricingParams: ['ttl'] },
      name: 'textInput_cacheWrite',
      strategy: 'lookup',
      unit: 'millionTokens',
    });
    expect(convertSMAIPricing(expressionPricing('tier("x", cc1h * 0)')).units).toContainEqual({
      lookup: { prices: { '1h': 0, '5m': 0 }, pricingParams: ['ttl'] },
      name: 'textInput_cacheWrite',
      strategy: 'lookup',
      unit: 'millionTokens',
    });
  });
  it('uses the GPT 6.1 Sol expression instead of the 37.5/2 fallback ratios', () => {
    const pricing = convertSMAIPricing(
      expressionPricing('tier("默认", p * 2 + cr * 0.1 + cc * 2.5 + c * 10)'),
    );
    expect(pricing.units).toEqual(
      expect.arrayContaining([
        fixedUnit('textInput', 2),
        fixedUnit('textOutput', 10),
        fixedUnit('textInput_cacheRead', 0.1),
        fixedUnit('textInput_cacheWrite', 2.5),
      ]),
    );
  });

  it('preserves the GPT 6 Sol context tiers for input, output and cache prices', () => {
    const pricing = convertSMAIPricing(
      expressionPricing(
        'len <= 272000 ? tier("默认", p * 2 + cr * 0.2 + cc * 2.5 + c * 10) : tier("长上下文", p * 4 + cr * 0.4 + cc * 5 + c * 15)',
      ),
    );
    for (const [name, low, high] of [
      ['textInput', 2, 4],
      ['textOutput', 10, 15],
      ['textInput_cacheRead', 0.2, 0.4],
      ['textInput_cacheWrite', 2.5, 5],
    ]) {
      expect(pricing.units).toContainEqual({
        name,
        strategy: 'tiered',
        tiers: [
          { rate: low, upTo: 272000 },
          { rate: high, upTo: 'infinity' },
        ],
        unit: 'millionTokens',
      });
    }
  });

  it.each([
    [
      'Kimi K3',
      'tier("base", p * 2.85 + c * 14.2 + cr * 0.285 + cc * 2.85 + cc1h * 5.71)',
      2.85,
      14.2,
      0.285,
      2.85,
      5.71,
    ],
    [
      'Claude Fable 5.1',
      'tier("默认", p * 10 + c * 50 + cr * 1 + cc * 12.5 + cc1h * 20)',
      10,
      50,
      1,
      12.5,
      20,
    ],
  ])(
    'preserves %s token prices and cache write TTLs',
    (_name, expression, input, output, read, shortWrite, longWrite) => {
      const pricing = convertSMAIPricing(expressionPricing(expression));
      expect(pricing.units).toEqual(
        expect.arrayContaining([
          fixedUnit('textInput', input),
          fixedUnit('textOutput', output),
          fixedUnit('textInput_cacheRead', read),
          {
            lookup: { prices: { '1h': longWrite, '5m': shortWrite }, pricingParams: ['ttl'] },
            name: 'textInput_cacheWrite',
            strategy: 'lookup',
            unit: 'millionTokens',
          },
        ]),
      );
    },
  );

  it('retains both context and cache duration dimensions for Claude Haiku', () => {
    const pricing = convertSMAIPricing(
      expressionPricing(
        'len <= 100000 ? tier("默认", p * 0.1 + c * 0.5 + cr * 0.01 + cc * 0.125 + cc1h * 0.2) : tier("长上下文", p * 0.5 + c * 2.5 + cr * 0.05 + cc * 0.625 + cc1h * 1)',
      ),
    );
    expect(pricing.units).toContainEqual({
      lookup: {
        prices: {
          '[0, 100000]_1h': 0.2,
          '[0, 100000]_5m': 0.125,
          '[100001, infinity]_1h': 1,
          '[100001, infinity]_5m': 0.625,
        },
        pricingParams: ['textInputRange', 'ttl'],
      },
      name: 'textInput_cacheWrite',
      strategy: 'lookup',
      unit: 'millionTokens',
    });
  });

  it('uses fixed prices for unchanged units even when other prices have context tiers', () => {
    expect(
      convertSMAIPricing(
        expressionPricing(
          'len < 100 ? tier("short", p * 2 + c * 10 + cc * 2 + cc1h * 3) : tier("long", p * 4 + c * 10 + cc * 2 + cc1h * 3)',
        ),
      ).units,
    ).toContainEqual(fixedUnit('textOutput', 10));
  });

  it('maps image, audio and long-duration OpenAI cache variables', () => {
    const pricing = convertSMAIPricing(
      expressionPricing(
        'tier("multi", p * 2 + c * 10 + img * 3 + img_cr * 0.3 + img_o * 20 + ai * 5 + ao * 15 + cc * 2.5 + cc12h * 5)',
      ),
    );
    expect(pricing.units).toEqual(
      expect.arrayContaining([
        fixedUnit('imageInput', 3),
        fixedUnit('imageInput_cacheRead', 0.3),
        fixedUnit('imageOutput', 20),
        fixedUnit('audioInput', 5),
        fixedUnit('audioOutput', 15),
        {
          lookup: { prices: { '12h': 5, '30m': 2.5 }, pricingParams: ['ttl'] },
          name: 'textInput_cacheWrite',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
      ]),
    );
  });

  it('does not invent a default duration when both long-duration families are explicit', () => {
    expect(
      convertSMAIPricing(expressionPricing('tier("x", p + cc * 2 + cc1h * 3 + cc12h * 4)')).units,
    ).toContainEqual({
      lookup: { prices: { '12h': 4, '1h': 3, 'default': 2 }, pricingParams: ['ttl'] },
      name: 'textInput_cacheWrite',
      strategy: 'lookup',
      unit: 'millionTokens',
    });
  });

  it('supports ratio-only servers, preserves zero and ignores model_price for token billing', () => {
    const pricing = convertSMAIPricing({
      cache_ratio: 0,
      completion_ratio: 4,
      create_cache_ratio: 1.25,
      enable_groups: ['default'],
      image_ratio: 2,
      model_name: 'glm-5.3',
      model_price: 999,
      model_ratio: 0.5,
      quota_type: 0,
    });
    expect(pricing.units).toEqual([
      fixedUnit('textInput', 1),
      fixedUnit('textOutput', 4),
      fixedUnit('textInput_cacheRead', 0),
      fixedUnit('textInput_cacheWrite', 1.25),
      fixedUnit('imageInput', 2),
    ]);
    expect(
      convertSMAIPricing({
        ...expressionPricing(''),
        billing_mode: 'ratio',
        completion_ratio: 0,
        model_ratio: 0,
      }).units,
    ).toEqual([fixedUnit('textInput', 0), fixedUnit('textOutput', 0)]);
  });

  it('defaults absent completion ratios to one and includes legacy audio prices', () => {
    const base: SMAIPricing = {
      enable_groups: [],
      model_name: 'audio',
      model_ratio: 1,
      quota_type: 0,
    };
    expect(convertSMAIPricing(base).units).toEqual([
      fixedUnit('textInput', 2),
      fixedUnit('textOutput', 2),
    ]);
    expect(
      convertSMAIPricing({ ...base, audio_completion_ratio: 3, audio_ratio: 5 }).units,
    ).toEqual(expect.arrayContaining([fixedUnit('audioInput', 10), fixedUnit('audioOutput', 30)]));
    expect(convertSMAIPricing({ ...base, audio_completion_ratio: 0 }).units).toContainEqual(
      fixedUnit('audioOutput', 0),
    );
    expect(convertSMAIPricing({ ...base, audio_ratio: 0 }).units).toContainEqual(
      fixedUnit('audioInput', 0),
    );
  });

  it.each([
    { billing_expr: '', billing_mode: 'tiered_expr' },
    { billing_expr: undefined, billing_mode: 'tiered_expr' },
    { billing_expr: 'tier("request", fixed(0.1))', billing_mode: 'tiered_expr' },
    {
      billing_expr: 'tier("base", p * 0.5 + c * 1.5) * (hour("Asia/Shanghai") < 12 ? 2 : 1)',
      billing_mode: 'tiered_expr',
    },
    { billing_mode: 'future_mode' },
    { billing_mode: undefined, model_price: 0.1, quota_type: 1 },
    { billing_mode: undefined, model_ratio: undefined },
    { billing_mode: undefined, model_ratio: -1 },
    { billing_mode: undefined, model_ratio: Number.POSITIVE_INFINITY },
    { billing_mode: undefined, completion_ratio: -1 },
    { billing_mode: undefined, cache_ratio: -1 },
    { billing_mode: undefined, create_cache_ratio: Number.NaN },
    { billing_mode: undefined, audio_ratio: -1 },
    { billing_mode: undefined, audio_completion_ratio: -1 },
  ])(
    'clears old prices instead of falling back when authoritative pricing cannot be displayed: %j',
    (overrides) => {
      expect(convertSMAIPricing({ ...expressionPricing(''), ...overrides })).toEqual({ units: [] });
    },
  );
});
