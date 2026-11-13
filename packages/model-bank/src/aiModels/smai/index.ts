import type {
  AIASRModelCard,
  AIChatModelCard,
  AIEmbeddingModelCard,
  AIImageModelCard,
  AIRealtimeModelCard,
  AITTSModelCard,
  AIVideoModelCard,
} from '../../types/aiModel';
import { anthropicChatModels } from './anthropic';
import { bytedanceVideoModels } from './bytedance';
import { deepseekChatModels } from './deepseek';
import { geminiChatModels, geminiImageModels } from './gemini';
import { legacyAnthropicChatModels } from './legacy/anthropic';
import { legacyDeepseekChatModels } from './legacy/deepseek';
import { legacyGeminiChatModels, legacyGeminiImageModels } from './legacy/gemini';
import { legacyMinimaxChatModels } from './legacy/minimax';
import { legacyMoonshotChatModels } from './legacy/moonshot';
import {
  legacyOpenAIChatModels,
  legacyOpenAIEmbeddingModels,
  legacyOpenAIImageModels,
  legacyOpenAIRealtimeModels,
} from './legacy/openai';
import { legacyXaiChatModels } from './legacy/xai';
import { legacyXiaomiChatModels } from './legacy/xiaomi';
import { legacyZhipuChatModels } from './legacy/zhipu';
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

export {
  gptImage1ParamsSchema,
  NANO_BANANA_2_ASPECT_RATIOS,
  NANO_BANANA_ASPECT_RATIOS,
  nanoBanana2Parameters,
  nanoBanana21Parameters,
  nanoBananaProParameters,
  qwenImageParamsSchema,
  seedance15ProParams,
  seedance20Params,
} from './parameters';

export const smaiVideoModels: AIVideoModelCard[] = [...bytedanceVideoModels];

const smaiChatModels: AIChatModelCard[] = [
  ...openAIChatModels,
  ...legacyOpenAIChatModels,
  ...anthropicChatModels,
  ...legacyAnthropicChatModels,
  ...geminiChatModels,
  ...legacyGeminiChatModels,
  ...xaiChatModels,
  ...legacyXaiChatModels,
  ...legacyMinimaxChatModels,
  ...legacyXiaomiChatModels,
  ...moonshotChatModels,
  ...zhipuChatModels,
  ...legacyZhipuChatModels,
  ...legacyMoonshotChatModels,
  ...deepseekChatModels,
  ...legacyDeepseekChatModels,
];

export const smaiEmbeddingModels: AIEmbeddingModelCard[] = [
  ...legacyOpenAIEmbeddingModels,
  ...openAIEmbeddingModels,
];

export const smaiTTSModels: AITTSModelCard[] = [...openAITTSModels];

export const newapiASRModels: AIASRModelCard[] = [...openAIASRModels];

export const smaiImageModels: AIImageModelCard[] = [
  ...openAIImageModels,
  ...geminiImageModels,
  ...legacyOpenAIImageModels,
  ...legacyGeminiImageModels,
];

export const smaiRealtimeModels: AIRealtimeModelCard[] = [...legacyOpenAIRealtimeModels];

export const allModels = [
  ...smaiChatModels,
  ...smaiEmbeddingModels,
  ...smaiTTSModels,
  ...smaiImageModels,
  ...smaiRealtimeModels,
  ...smaiVideoModels,
];

export default allModels;
