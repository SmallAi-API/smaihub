import { ENABLE_BUSINESS_FEATURES } from '@lobechat/business-const';
import { describe, expect, it } from 'vitest';

import { GEMINI_3_5_MODEL, GEMINI_3_5_PROVIDER } from './starterModels';

describe('starter models', () => {
  it('uses the DeepSeek provider in OSS and the smai.ai provider in business builds', () => {
    expect(GEMINI_3_5_MODEL).toBe('deepseek-v4-pro');
    expect(GEMINI_3_5_PROVIDER).toBe(ENABLE_BUSINESS_FEATURES ? 'smai' : 'smai');
  });
});
