// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { detectModelProvider } from '../../utils/modelParse';
import { parseGoogleModelId, shouldOmitGoogleSamplingParams } from '../google/modelId';
import { LobeSMAIAI } from './index';

vi.mock('../../utils/getModelPricing', () => ({ getModelPricing: vi.fn() }));

const referenceImage = 'data:image/png;base64,aW1hZ2U=';

describe('SMAI Nano Banana 2.1 image generation', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation(async () =>
      Response.json({
        candidates: [
          {
            content: {
              parts: [
                { inlineData: { data: 'draft', mimeType: 'image/png' }, thought: true },
                { inlineData: { data: 'final', mimeType: 'image/png' } },
              ],
            },
          },
        ],
      }),
    );
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('recognizes the provider alias as Nano Banana 2.1', () => {
    expect(detectModelProvider('nanobanana-2.1')).toBe('google');
    expect(parseGoogleModelId('nanobanana-2.1')).toMatchObject({
      family: 'nanoBanana',
      majorVersion: 2,
      minorVersion: 1,
    });
    expect(shouldOmitGoogleSamplingParams('nanobanana-2.1')).toBe(true);
  });

  it.each(['https://api.smai.ai', 'https://gateway.example.com/v1'])(
    'generates an image via generateContent at %s while preserving the alias',
    async (baseURL) => {
      const runtime = new LobeSMAIAI({ apiKey: 'test-key', baseURL });

      const result = await runtime.createImage({
        model: 'nanobanana-2.1',
        params: { aspectRatio: '16:9', prompt: 'Draw an apple', resolution: '2K' },
      });

      expect(result?.imageUrl).toBe('data:image/png;base64,final');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0];
      expect(String(url)).toBe(
        `${baseURL.replace(/\/v1$/, '')}/v1beta/models/nanobanana-2.1:generateContent`,
      );
      expect(JSON.parse(init.body).generationConfig).toMatchObject({
        imageConfig: { aspectRatio: '16:9', imageSize: '2K' },
        responseModalities: ['TEXT', 'IMAGE'],
      });
    },
  );

  it.each(['nanobanana-2.1', 'gemini-nano-banana-2.1'])(
    'edits %s with all 14 reference images through generateContent',
    async (model) => {
      const runtime = new LobeSMAIAI({ apiKey: 'test-key' });

      const result = await runtime.createImage({
        model,
        params: { imageUrls: Array.from({ length: 14 }, () => referenceImage), prompt: 'Combine' },
      });

      expect(result?.imageUrl).toBe('data:image/png;base64,final');
      const [url, init] = mockFetch.mock.calls[0];
      expect(String(url)).toContain(`/models/${model}:generateContent`);
      const parts = JSON.parse(init.body).contents[0].parts;
      expect(parts.filter((part: { inlineData?: unknown }) => part.inlineData)).toHaveLength(14);
    },
  );

  it('generates with the canonical model ID without an :image suffix', async () => {
    const runtime = new LobeSMAIAI({ apiKey: 'test-key' });

    const result = await runtime.createImage({
      model: 'gemini-nano-banana-2.1',
      params: { prompt: 'Draw an apple', resolution: '4K' },
    });

    expect(result?.imageUrl).toBe('data:image/png;base64,final');
    expect(String(mockFetch.mock.calls[0][0])).toBe(
      'https://api.smai.ai/v1beta/models/gemini-nano-banana-2.1:generateContent',
    );
  });

  it.each(['nanobanana-2.1', 'gemini-nano-banana-2.1'])(
    'rejects %s with more than 14 reference images before calling the gateway',
    async (model) => {
      const runtime = new LobeSMAIAI({ apiKey: 'test-key' });

      await expect(
        runtime.createImage({
          model,
          params: {
            imageUrls: Array.from({ length: 15 }, () => referenceImage),
            prompt: 'Combine',
          },
        }),
      ).rejects.toMatchObject({
        error: { message: expect.stringContaining('Maximum 14 images allowed') },
      });
      expect(mockFetch).not.toHaveBeenCalled();
    },
  );

  it('reports a text-only response as no image generated', async () => {
    mockFetch.mockResolvedValueOnce(
      Response.json({ candidates: [{ content: { parts: [{ text: 'No image available' }] } }] }),
    );
    const runtime = new LobeSMAIAI({ apiKey: 'test-key' });

    await expect(
      runtime.createImage({
        model: 'gemini-nano-banana-2.1',
        params: { prompt: 'Draw an apple' },
      }),
    ).rejects.toMatchObject({ errorType: 'ProviderNoImageGenerated' });
  });
});
