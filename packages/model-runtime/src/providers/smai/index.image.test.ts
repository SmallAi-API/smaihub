// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LobeSMAIAI } from './index';

describe('SMAI GPT Image 2.6 image routing', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: [{ b64_json: 'R0lGODlh' }], output_format: 'gif' }), {
        headers: { 'content-type': 'application/json' },
      }),
    );
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  describe.each(['gpt-image-2.6-flare', 'gpt-image-2.6-sunburst'])('%s', (model) => {
    it.each([
      { baseURL: undefined, endpoint: 'https://api.smai.ai/v1/images/generations' },
      {
        baseURL: 'https://gateway.example/v1',
        endpoint: 'https://gateway.example/v1/images/generations',
      },
    ])('preserves GIF auto-sizing through $endpoint', async ({ baseURL, endpoint }) => {
      const runtime = new LobeSMAIAI({ apiKey: 'test-key', baseURL });
      const result = await runtime.createImage({
        model,
        params: {
          frameCount: 9,
          frameDurationMs: 200,
          outputFormat: 'gif',
          prompt: 'a waving cat',
          size: 'auto',
        },
      });

      expect(result.imageUrl).toBe('data:image/gif;base64,R0lGODlh');
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(String(url)).toBe(endpoint);
      expect(init?.method).toBe('POST');
      expect(JSON.parse(init!.body as string)).toEqual({
        frame_count: 9,
        frame_duration_ms: 200,
        model,
        output_format: 'gif',
        prompt: 'a waving cat',
        size: 'auto',
      });
    });

    it('drops dormant animation settings when generating PNG', async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ data: [{ b64_json: 'png' }] }), {
          headers: { 'content-type': 'application/json' },
        }),
      );
      const runtime = new LobeSMAIAI({ apiKey: 'test-key' });
      const result = await runtime.createImage({
        model,
        params: {
          frameCount: 9,
          frameDurationMs: 200,
          outputFormat: 'png',
          prompt: 'a cat',
          size: 'auto',
        },
      });

      expect(result.imageUrl).toBe('data:image/png;base64,png');
      expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string)).toEqual({
        model,
        output_format: 'png',
        prompt: 'a cat',
      });
    });

    it('rejects GIF with references without downloading or submitting an edit', async () => {
      const runtime = new LobeSMAIAI({ apiKey: 'test-key' });

      await expect(
        runtime.createImage({
          model,
          params: {
            imageUrls: ['https://example.com/cat.png'],
            outputFormat: 'gif',
            prompt: 'wave',
          },
        }),
      ).rejects.toThrow('Animated GIF output does not support reference images');
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
