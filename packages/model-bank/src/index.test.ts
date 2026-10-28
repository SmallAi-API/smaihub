import { describe, expect, it } from 'vitest';

import { ModelProvider } from './const/modelProvider';
import * as ModelBank from './index';

describe('model-bank root exports', () => {
  it('exports a model array for every static provider used by server config', () => {
    const missingProviders = Object.values(ModelProvider).filter(
      (provider) =>
        provider !== ModelProvider.LobeHub && !Array.isArray(Reflect.get(ModelBank, provider)),
    );

    expect(missingProviders).toEqual([]);
  });
});
