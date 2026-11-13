import { describe, expect, it } from 'vitest';

import { LOBE_DEFAULT_MODEL_LIST } from '../index';
import { allModels } from './index';

describe('SMAI Gemini 4 Hydrogen', () => {
  it('registers exactly once in the provider and default catalogs with synchronous limits', () => {
    const providerModels = allModels.filter((model) => model.id === 'gemini-4-hydrogen');
    const defaultModels = LOBE_DEFAULT_MODEL_LIST.filter(
      (model) => model.providerId === 'smai' && model.id === 'gemini-4-hydrogen',
    );

    expect(providerModels).toHaveLength(1);
    expect(defaultModels).toHaveLength(1);
    for (const model of [...providerModels, ...defaultModels]) {
      if (model.type !== 'chat') expect.fail('Gemini 4 Hydrogen must be a chat model');

      expect(model).toMatchObject({
        abilities: {
          audio: true,
          functionCall: true,
          reasoning: true,
          search: true,
          structuredOutput: true,
          video: true,
          vision: true,
        },
        contextWindowTokens: 1_048_576,
        displayName: 'Gemini 4 Hydrogen',
        enabled: true,
        family: 'gemini',
        generation: 'gemini-4',
        maxOutput: 65_536,
        settings: {
          disabledParams: ['temperature', 'top_p'],
          extendParams: ['thinkingLevel5', 'urlContext'],
          searchImpl: 'params',
          searchProvider: 'google',
        },
        type: 'chat',
      });
      expect(model.abilities?.imageOutput).not.toBe(true);
      expect(model.pricing).toBeUndefined();
    }
  });
});
