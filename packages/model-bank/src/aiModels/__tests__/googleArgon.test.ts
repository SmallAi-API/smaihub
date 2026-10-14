import { describe, expect, it } from 'vitest';

import { allModels as googleModels } from '../google';
import { LOBE_DEFAULT_MODEL_LIST } from '../index';

describe('Gemini 4 Argon registration', () => {
  it('is available in Google and the default SMAI catalog with the synchronous limits', () => {
    const google = googleModels.find((model) => model.id === 'gemini-4-argon');
    const smai = LOBE_DEFAULT_MODEL_LIST.find(
      (model) => model.providerId === 'smai' && model.id === 'gemini-4-argon',
    );
    expect(googleModels.filter((model) => model.id === 'gemini-4-argon')).toHaveLength(1);
    expect(
      LOBE_DEFAULT_MODEL_LIST.filter(
        (model) => model.providerId === 'smai' && model.id === 'gemini-4-argon',
      ),
    ).toHaveLength(1);

    for (const model of [google, smai]) {
      expect(model).toMatchObject({
        abilities: { audio: true, functionCall: true, reasoning: true, video: true, vision: true },
        contextWindowTokens: 1_048_576,
        enabled: true,
        maxOutput: 65_536,
        settings: {
          disabledParams: ['temperature', 'top_p'],
          extendParams: ['thinkingLevel3', 'urlContext'],
        },
        type: 'chat',
      });
      expect(model).not.toMatchObject({ abilities: { imageOutput: true } });
      expect(model?.pricing?.units.some((unit) => unit.name === 'textInput_cacheWrite')).not.toBe(
        true,
      );
    }
    expect(smai?.pricing).toBeUndefined();
  });
});
