// @vitest-environment node
import type { GenerateContentResponse } from '@google/genai';
import { GoogleGenAI } from '@google/genai';
import type { LobeAgentChatConfig } from '@lobechat/types';
import { google } from 'model-bank';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { convertGoogleAIUsage } from '../../core/usageConverters/google-ai';
import {
  applyModelExtendParams,
  resolveDefaultThinkingLevelForModel,
} from '../../utils/modelExtendParams';
import { LobeGoogleAI } from './index';
import { isGemini4Argon } from './modelId';
import { resolveGoogleThinkingConfig } from './thinkingResolver';

afterEach(() => vi.restoreAllMocks());

describe('Gemini 4 Argon', () => {
  it.each(['gemini-4-argon', 'google/gemini-4-argon', 'models/gemini-4-argon'])(
    'defaults %s to medium and ignores legacy thinking budgets',
    (model) => {
      expect(isGemini4Argon(model)).toBe(true);
      expect(resolveGoogleThinkingConfig(model, { thinkingBudget: 0 })).toEqual({
        includeThoughts: true,
        thinkingBudget: undefined,
        thinkingLevel: 'medium',
      });
    },
  );

  it.each([undefined, '', 'gemini-3.8-flash', 'gemini-4-other'])(
    'does not misidentify %s',
    (model) => {
      expect(isGemini4Argon(model)).toBe(false);
    },
  );

  it.each(['low', 'medium', 'high'] as const)('honors the %s model setting', (thinkingLevel) => {
    const params = applyModelExtendParams({
      chatConfig: { thinkingLevel3: thinkingLevel } as LobeAgentChatConfig,
      extendParams: ['thinkingLevel3'],
      model: 'gemini-4-argon',
    });
    expect(params.thinkingLevel).toBe(thinkingLevel);
    expect(resolveGoogleThinkingConfig('gemini-4-argon', { thinkingLevel }).thinkingLevel).toBe(
      thinkingLevel,
    );
  });

  it('uses medium in both the settings UI default and the outbound chat configuration', () => {
    expect(resolveDefaultThinkingLevelForModel('gemini-4-argon', 'thinkingLevel3')).toBe('medium');
    expect(
      applyModelExtendParams({
        chatConfig: {} as LobeAgentChatConfig,
        extendParams: ['thinkingLevel3'],
        model: 'gemini-4-argon',
      }).thinkingLevel,
    ).toBe('medium');
    expect(
      resolveGoogleThinkingConfig('gemini-4-argon', { thinkingLevel: 'minimal' }).thinkingLevel,
    ).toBe('medium');
  });

  it.each([undefined, 1024, 131_072])(
    'streams text with a synchronous output budget of %s',
    async (max_tokens) => {
      const client = new GoogleGenAI({ apiKey: 'test-key' });
      const request = vi.spyOn(client.models, 'generateContentStream').mockResolvedValue(
        (async function* () {
          yield {
            candidates: [
              {
                content: { parts: [{ text: 'Argon response' }], role: 'model' },
              },
            ],
          } as GenerateContentResponse;
          yield { candidates: [{ finishReason: 'STOP' }] } as GenerateContentResponse;
        })(),
      );
      const runtime = new LobeGoogleAI({ apiKey: 'test-key', client });
      const response = await runtime.chat({
        max_tokens,
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'gemini-4-argon',
        temperature: 0.5,
        top_p: 0.9,
      });
      expect(await response.text()).toContain('Argon response');
      const config = request.mock.calls[0][0].config;
      expect(config?.thinkingConfig).toMatchObject({ thinkingLevel: 'medium' });
      expect(config?.maxOutputTokens).toBe(Math.min(max_tokens ?? 65_536, 65_536));
      expect(config).not.toHaveProperty('temperature');
      expect(config).not.toHaveProperty('topP');
      expect(config?.thinkingConfig?.thinkingBudget).toBeUndefined();
    },
  );

  it('preserves the unified context window when fetching models', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        models: [
          {
            displayName: 'Gemini 4 Argon',
            inputTokenLimit: 1_048_576,
            name: 'models/gemini-4-argon',
            outputTokenLimit: 1_048_576,
          },
        ],
      }),
    );
    const runtime = new LobeGoogleAI({ apiKey: 'test-key' });
    expect(await runtime.models()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          contextWindowTokens: 1_048_576,
          id: 'gemini-4-argon',
          maxOutput: 65_536,
        }),
      ]),
    );
  });

  it('bills thinking as output and applies the implicit cache discount', () => {
    const pricing = google.find((model) => model.id === 'gemini-4-argon')?.pricing;
    const usage = convertGoogleAIUsage(
      {
        candidatesTokenCount: 15_000,
        promptTokenCount: 100_000,
        thoughtsTokenCount: 5_000,
      },
      pricing,
    );
    expect(usage.totalOutputTokens).toBe(20_000);
    expect(usage.cost).toBeCloseTo(0.4);
    expect(
      convertGoogleAIUsage(
        {
          cachedContentTokenCount: 100_000,
          candidatesTokenCount: 15_000,
          promptTokenCount: 100_000,
          thoughtsTokenCount: 5_000,
        },
        pricing,
      ).cost,
    ).toBeCloseTo(0.21);
  });
});
