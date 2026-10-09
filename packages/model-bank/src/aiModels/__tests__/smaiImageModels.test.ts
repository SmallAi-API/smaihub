import { describe, expect, it } from 'vitest';

import { ModelParamsMetaSchema } from '../../standard-parameters';
import { LOBE_DEFAULT_MODEL_LIST } from '../index';

const findNanoBanana21Card = () =>
  LOBE_DEFAULT_MODEL_LIST.find(
    (model) => model.providerId === 'smai' && model.id === 'gemini-nano-banana-2.1',
  );

describe('SMAI Nano Banana 2.1 model card', () => {
  it('registers the provider model ID as an enabled image model', () => {
    expect(findNanoBanana21Card()).toMatchObject({
      displayName: 'Nano Banana 2.1',
      enabled: true,
      id: 'gemini-nano-banana-2.1',
      type: 'image',
    });
  });

  it('offers the supported resolutions and panoramic aspect ratios', () => {
    const parameters = findNanoBanana21Card()?.parameters;

    expect(parameters?.resolution).toEqual({ default: '1K', enum: ['1K', '2K', '4K'] });
    expect(parameters?.aspectRatio?.default).toBe('auto');
    expect(parameters?.aspectRatio?.enum).toEqual(
      expect.arrayContaining(['1:1', '16:9', '9:16', '1:4', '4:1', '1:8', '8:1']),
    );
  });

  it('supports reference-image editing with a valid 14-image parameter schema', () => {
    const parameters = findNanoBanana21Card()?.parameters;

    expect(parameters?.prompt?.default).toBe('');
    expect(parameters?.imageUrls).toMatchObject({ default: [], maxCount: 14 });
    expect(() => ModelParamsMetaSchema.parse(parameters)).not.toThrow();
  });
});
