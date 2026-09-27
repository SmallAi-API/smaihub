import { describe, expect, it } from 'vitest';

import * as real from '../../../../../packages/business/const/src';
import * as realBranding from '../../../../../packages/business/const/src/branding';
import * as stubBranding from './branding';
import * as stub from './index';

describe('desktop business-const stub', () => {
  it('exposes every export of @lobechat/business-const', () => {
    expect(Object.keys(stub)).toEqual(expect.arrayContaining(Object.keys(real)));
  });

  it('exposes every export of @lobechat/business-const/branding', () => {
    expect(Object.keys(stubBranding)).toEqual(expect.arrayContaining(Object.keys(realBranding)));
  });

  it('keeps the desktop-specific overrides', () => {
    expect(stub.DEFAULT_MINI_MODEL).toBe('gpt-5.4-mini');
    expect(stub.ENABLE_BUSINESS_FEATURES).toBe(false);
  });
});
