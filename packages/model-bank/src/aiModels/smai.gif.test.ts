import { describe, expect, it } from 'vitest';

import { gptImage25Schema, gptImage26Schema } from '../const/imageParameters';
import { extractDefaultValues, ModelParamsMetaSchema } from '../standard-parameters';
import { smaiImageModels } from './smai';

describe('SMAI GPT Image 2.6 GIF model card', () => {
  it.each([
    ['gpt-image-2.6-flare', 'GPT Image 2.6 Flare'],
    ['gpt-image-2.6-sunburst', 'GPT Image 2.6 Sunburst'],
  ])('offers GIF output on %s', (id, displayName) => {
    const card = smaiImageModels.find((model) => model.id === id);
    expect(card?.parameters).toBe(gptImage26Schema);
    expect(card).toMatchObject({
      displayName,
      enabled: true,
      parameters: { outputFormat: { default: 'png', enum: ['png', 'gif'] } },
      type: 'image',
    });
  });

  it.each(['gpt-image-2.6-flare', 'gpt-image-2.6-sunburst'])(
    'extracts PNG defaults with animation settings ready on %s',
    (id) => {
      const card = smaiImageModels.find((model) => model.id === id);
      expect(extractDefaultValues(card!.parameters)).toMatchObject({
        frameCount: 9,
        frameDurationMs: 200,
        imageUrls: [],
        outputFormat: 'png',
        prompt: '',
        quality: 'auto',
        size: 'auto',
      });
      expect(() => ModelParamsMetaSchema.parse(card!.parameters)).not.toThrow();
    },
  );

  it('removes the nonstandard GPT Image 2.6 alias', () => {
    expect(smaiImageModels.some(({ id }) => id === 'gpt-image-2.6')).toBe(false);
  });

  it.each(['gpt-image-2.5-flare', 'gpt-image-2.5-sunburst'])(
    'keeps animation controls off %s',
    (id) => {
      const parameters = smaiImageModels.find((model) => model.id === id)?.parameters;

      expect(parameters).toBe(gptImage25Schema);
      expect(parameters).not.toHaveProperty('outputFormat');
      expect(parameters).not.toHaveProperty('frameCount');
      expect(parameters).not.toHaveProperty('frameDurationMs');
    },
  );
});
