// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getInputPriceMultiplier } from '@/features/ModelSwitchPanel/utils';

import { computeChatCost } from '../../core/usageConverters/utils/computeChatCost';
import { params } from './index';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SMAI pricing import and model switch prices', () => {
  it('keeps authoritative pricing through model normalization and calculates the displayed multiplier', async () => {
    const client = {
      apiKey: 'test-key',
      baseURL: 'https://api.smai.ai/v1',
      models: {
        list: vi.fn().mockResolvedValue({
          data: [{ id: 'gpt-6.1-sol' }, { id: 'gpt-6-sol' }, { id: 'deepseek-v4-pro' }],
        }),
      },
    } as Parameters<typeof params.models>[0]['client'];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          data: [
            {
              billing_expr: 'tier("默认", p * 2 + cr * 0.1 + cc * 2.5 + c * 10)',
              billing_mode: 'tiered_expr',
              completion_ratio: 2,
              model_name: 'gpt-6.1-sol',
              model_ratio: 37.5,
              quota_type: 0,
            },
            {
              billing_expr:
                'len <= 272000 ? tier("默认", p * 2 + c * 10) : tier("长上下文", p * 4 + c * 15)',
              billing_mode: 'tiered_expr',
              model_name: 'gpt-6-sol',
              model_ratio: 37.5,
              quota_type: 0,
            },
            {
              billing_expr: 'tier("base", p * 0.5) * (hour("Asia/Shanghai") < 12 ? 2 : 1)',
              billing_mode: 'tiered_expr',
              model_name: 'deepseek-v4-pro',
              model_ratio: 37.5,
              quota_type: 0,
            },
          ],
          success: true,
        }),
        ok: true,
      }),
    );

    const models = await params.models({ client });
    const getPricing = (id: string) => models.find((model) => model.id === id)?.pricing;

    expect(getInputPriceMultiplier(getPricing('gpt-6.1-sol'))).toBe(2);
    expect(
      computeChatCost(getPricing('gpt-6.1-sol'), { inputTextTokens: 1000, outputTextTokens: 1000 })
        ?.totalCost,
    ).toBe(0.012);
    expect(getPricing('gpt-6.1-sol')?.units).toContainEqual({
      name: 'textOutput',
      rate: 10,
      strategy: 'fixed',
      unit: 'millionTokens',
    });
    expect(getInputPriceMultiplier(getPricing('gpt-6-sol'))).toBe(2);
    expect(getPricing('gpt-6-sol')?.units).toContainEqual({
      name: 'textOutput',
      strategy: 'tiered',
      tiers: [
        { rate: 10, upTo: 272000 },
        { rate: 15, upTo: 'infinity' },
      ],
      unit: 'millionTokens',
    });
    expect(getPricing('deepseek-v4-pro')).toEqual({ units: [] });
    expect(getInputPriceMultiplier(getPricing('deepseek-v4-pro'))).toBeUndefined();
    expect(
      computeChatCost(getPricing('deepseek-v4-pro'), { inputTextTokens: 1000 }),
    ).toBeUndefined();
  });
});
