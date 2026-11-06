import { describe, expect, it } from 'vitest';

import { extractDefaultValues, ModelParamsMetaSchema } from '../standard-parameters';
import { gptImage25Schema, gptImage26Schema } from './imageParameters';

describe('GPT Image 2.6 parameters', () => {
  it('reuses the existing static-image constraints without sharing its schema object', () => {
    expect(gptImage26Schema).not.toBe(gptImage25Schema);
    for (const key of ['imageUrls', 'prompt', 'quality', 'size'] as const) {
      expect(gptImage26Schema[key]).toBe(gptImage25Schema[key]);
    }
    expect(() => ModelParamsMetaSchema.parse(gptImage26Schema)).not.toThrow();
  });

  it('starts with PNG and exposes the GIF settings within the documented API limits', () => {
    expect(extractDefaultValues(gptImage26Schema)).toMatchObject({
      frameCount: 9,
      frameDurationMs: 200,
      outputFormat: 'png',
    });
    expect(gptImage26Schema.outputFormat?.enum).toEqual(['png', 'gif']);
    expect(gptImage26Schema.frameCount).toMatchObject({ max: 16, min: 2, step: 1 });
    expect(gptImage26Schema.frameDurationMs).toMatchObject({ max: 2000, min: 20, step: 10 });
  });
});
