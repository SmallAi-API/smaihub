import { describe, expect, it } from 'vitest';

import { anthropicChatModels } from './anthropic';
import { bytedanceVideoModels } from './bytedance';
import { deepseekChatModels } from './deepseek';
import { geminiChatModels, geminiImageModels } from './gemini';
import { allModels, newapiASRModels } from './index';
import { moonshotChatModels } from './moonshot';
import {
  openAIASRModels,
  openAIChatModels,
  openAIEmbeddingModels,
  openAIImageModels,
  openAITTSModels,
} from './openai';
import { xaiChatModels } from './xai';
import { zhipuChatModels } from './zhipu';

const suppliers = [
  [
    'OpenAI',
    [
      ...openAIChatModels,
      ...openAIEmbeddingModels,
      ...openAIImageModels,
      ...openAITTSModels,
      ...openAIASRModels,
    ],
    /^(gpt-|text-embedding-|tts-|whisper-)/,
  ],
  ['Anthropic', anthropicChatModels, /^claude-/],
  ['Gemini', [...geminiChatModels, ...geminiImageModels], /^(gemini-|nano-banana-)/],
  ['xAI', xaiChatModels, /^grok-/],
  ['Moonshot', moonshotChatModels, /^kimi-/],
  ['Zhipu', zhipuChatModels, /^glm-/],
  ['DeepSeek', deepseekChatModels, /^deepseek/i],
  ['ByteDance', bytedanceVideoModels, /^doubao-/],
] as const;

describe('SMAI supplier catalogs', () => {
  it.each(suppliers)(
    'keeps enabled %s models in their supplier module',
    (_supplier, models, id) => {
      expect(models.length).toBeGreaterThan(0);
      for (const model of models) {
        expect(model.enabled).toBe(true);
        expect(model.id).toMatch(id);
        expect([...allModels, ...newapiASRModels]).toContain(model);
      }
    },
  );

  it.each([
    'gpt-5.5',
    'claude-fable-5',
    'gemini-3.7-flash',
    'grok-4.1',
    'MiniMax-M3',
    'mimo-v2.5',
    'kimi-k2.5',
    'glm-5.2',
    'Deepseek/Deepseek-V3.2',
  ])('preserves the disabled compatibility card for %s', (id) => {
    const model = allModels.find((entry) => entry.id === id);
    expect(model).toBeDefined();
    expect(model?.enabled).not.toBe(true);
  });
});
