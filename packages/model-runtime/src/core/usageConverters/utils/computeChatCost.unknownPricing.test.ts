import { describe, expect, it } from 'vitest';

import { computeChatCost } from './computeChatCost';

describe('computeChatCost unknown pricing', () => {
  it('keeps an authoritative empty price unknown instead of reporting a free request', () => {
    expect(computeChatCost({ units: [] }, { inputTextTokens: 1000 })).toBeUndefined();
  });

  it('still calculates zero for an explicitly free token price', () => {
    expect(
      computeChatCost(
        {
          units: [{ name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' }],
        },
        { inputTextTokens: 1000 },
      )?.totalCost,
    ).toBe(0);
  });
});
