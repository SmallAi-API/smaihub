// @vitest-environment node
import { eq } from 'drizzle-orm';
import type { Pricing } from 'model-bank';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { convertSMAIPricing } from '../../../../model-runtime/src/providers/smai/pricing';
import { getTestDB } from '../../core/getTestDB';
import { aiModels, users } from '../../schemas';
import { AiModelModel } from '../aiModel';

vi.mock('@lobechat/business-model-bank/model-config', () => ({
  loadModels: vi.fn().mockResolvedValue([]),
}));

const db = await getTestDB();
const userId = 'smai-remote-pricing-test';
const modelId = 'gpt-6.1-sol';
const model = new AiModelModel(db, userId);

const oldPricing: Pricing = {
  units: [
    { name: 'textInput', rate: 75, strategy: 'fixed', unit: 'millionTokens' },
    { name: 'textOutput', rate: 150, strategy: 'fixed', unit: 'millionTokens' },
  ],
};

beforeEach(async () => {
  await db.insert(users).values({ id: userId });
  await db.insert(aiModels).values({
    id: modelId,
    pricing: oldPricing,
    providerId: 'smai',
    source: 'remote',
    userId,
  });
});

afterEach(async () => {
  await db.delete(users).where(eq(users.id, userId));
});

describe('authoritative SMAI pricing refresh', () => {
  it.each([
    [
      'tier("默认", p * 2 + c * 10)',
      {
        units: [
          { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
          { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        ],
      },
    ],
    ['tier("base", p * 2) * (hour("Asia/Shanghai") < 12 ? 2 : 1)', { units: [] }],
  ])('replaces old remote prices using %s', async (expression, expected) => {
    const pricing = convertSMAIPricing({
      billing_expr: expression,
      billing_mode: 'tiered_expr',
      completion_ratio: 2,
      enable_groups: ['default'],
      model_name: modelId,
      model_ratio: 37.5,
      quota_type: 0,
    });

    await model.batchUpdateAiModels('smai', [{ id: modelId, pricing, source: 'remote' }]);

    expect((await model.findById(modelId))?.pricing).toEqual(expected);
  });

  it('preserves an existing price when the pricing endpoint was unavailable', async () => {
    await model.batchUpdateAiModels('smai', [{ id: modelId, source: 'remote' }]);

    expect((await model.findById(modelId))?.pricing).toEqual(oldPricing);
  });
});
