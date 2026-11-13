/* eslint-disable eslint-core/no-restricted-syntax -- Preserve existing Chinese model descriptions. */
import { gptImage25Schema, gptImage26Schema } from '../../const/imageParameters';
import type {
  AIASRModelCard,
  AIChatModelCard,
  AIEmbeddingModelCard,
  AIImageModelCard,
  AITTSModelCard,
} from '../../types/aiModel';

export const openAIChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 1_050_000,
    description:
      'GPT-6.1 Sol delivers near-Astra performance for complex coding, computer use, and professional work at a lower cost.',
    displayName: 'GPT-6.1 Sol',
    enabled: true,
    family: 'gpt',
    generation: 'gpt-6.1',
    id: 'gpt-6.1-sol',
    knowledgeCutoff: '2026-04',
    maxOutput: 128_000,
    releasedAt: '2026-09-29',
    settings: {
      extendParams: ['gpt6ReasoningEffort', 'textVerbosity'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 1_050_000,
    description:
      "OpenAI's most intelligent and aligned model, state of the art on computer use and 3D work.",
    displayName: 'GPT-6 Astra',
    enabled: true,
    family: 'gpt',
    generation: 'gpt-6-astra',
    id: 'gpt-6-astra',
    knowledgeCutoff: '2026-09',
    maxOutput: 128_000,
    releasedAt: '2026-09-05',
    settings: {
      extendParams: ['reasoningMode', 'gpt6ReasoningEffort', 'textVerbosity'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 1_050_000,
    description: 'GPT-6 Sol is built for complex coding and agentic workflows.',
    displayName: 'GPT-6 Sol',
    enabled: true,
    family: 'gpt',
    generation: 'gpt-6',
    id: 'gpt-6-sol',
    knowledgeCutoff: '2026-04',
    maxOutput: 128_000,
    releasedAt: '2026-09-23',
    settings: { extendParams: ['gpt5_6ReasoningEffort', 'textVerbosity'], searchImpl: 'params' },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 1_050_000,
    description: 'GPT-6 Luna is OpenAI’s most efficient model for focused, high-volume tasks.',
    displayName: 'GPT-6 Luna',
    enabled: true,
    family: 'gpt',
    generation: 'gpt-6',
    id: 'gpt-6-luna',
    knowledgeCutoff: '2026-05',
    maxOutput: 128_000,
    /** @see https://developers.openai.com/api/docs/models/gpt-6-luna */
    releasedAt: '2026-09-22',
    settings: {
      extendParams: ['gpt5_6ReasoningEffort', 'textVerbosity'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 1_050_000,
    description:
      "GPT-5.6 Sol is OpenAI's frontier model for complex reasoning, coding, and long-horizon agentic work. The gpt-5.6 alias routes to Sol.",
    displayName: 'GPT-5.6 Sol',
    enabled: true,
    family: 'gpt',
    generation: 'gpt-5.6',
    id: 'gpt-5.6-sol',
    knowledgeCutoff: '2026-02',
    maxOutput: 128_000,
    releasedAt: '2026-07-09',
    settings: {
      extendParams: ['reasoningMode', 'gpt5_6ReasoningEffort', 'textVerbosity'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 1_050_000,
    description:
      'GPT-5.6 Terra balances intelligence and cost for everyday professional work, competitive with GPT-5.5 at about half the price.',
    displayName: 'GPT-5.6 Terra',
    enabled: true,
    family: 'gpt',
    generation: 'gpt-5.6',
    id: 'gpt-5.6-terra',
    knowledgeCutoff: '2026-02',
    maxOutput: 128_000,
    releasedAt: '2026-07-09',
    settings: {
      extendParams: ['reasoningMode', 'gpt5_6ReasoningEffort', 'textVerbosity'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 1_050_000,
    description:
      'GPT-5.6 Luna is optimized for cost-sensitive, high-volume workloads with the lowest price in the GPT-5.6 family.',
    displayName: 'GPT-5.6 Luna',
    enabled: true,
    family: 'gpt',
    generation: 'gpt-5.6',
    id: 'gpt-5.6-luna',
    knowledgeCutoff: '2026-02',
    maxOutput: 128_000,
    releasedAt: '2026-07-09',
    settings: {
      extendParams: ['reasoningMode', 'gpt5_6ReasoningEffort', 'textVerbosity'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
];

export const openAIEmbeddingModels: AIEmbeddingModelCard[] = [
  {
    contextWindowTokens: 8192,
    description: '高效且经济的新一代 Embedding 模型，适用于知识检索、RAG 应用等场景',
    displayName: 'Text Embedding 3 Small',
    enabled: true,
    id: 'text-embedding-3-small',
    maxDimension: 1536,
    releasedAt: '2024-01-25',
    type: 'embedding',
  },
];

export const openAITTSModels: AITTSModelCard[] = [
  {
    description: '最新的文本转语音模型，针对实时场景优化速度',
    displayName: 'TTS-1',
    enabled: true,
    id: 'tts-1',
    releasedAt: '2024-12-17',
    type: 'tts',
  },
  {
    description: '最新的文本转语音模型，针对质量进行优化',
    displayName: 'TTS-1 HD',
    enabled: true,
    id: 'tts-1-hd',
    releasedAt: '2024-12-17',
    type: 'tts',
  },
];

export const openAIASRModels: AIASRModelCard[] = [
  {
    description: '通用语音识别模型，支持多语言语音识别、语音翻译和语言识别。',
    displayName: 'Whisper',
    enabled: true,
    id: 'whisper-1',
    type: 'asr',
  },
];

export const openAIImageModels: AIImageModelCard[] = [
  {
    description:
      "OpenAI's fastest GPT Image 2.6 model, for high-quality everyday image generation.",
    displayName: 'GPT Image 2.6 Flare',
    enabled: true,
    id: 'gpt-image-2.6-flare',
    parameters: gptImage26Schema,
    releasedAt: '2026-11-05',
    type: 'image',
  },
  {
    description:
      'The GPT Image 2.6 model for workflows where editing precision matters most, generating and editing images from text and image inputs.',
    displayName: 'GPT Image 2.6 Sunburst',
    enabled: true,
    id: 'gpt-image-2.6-sunburst',
    parameters: gptImage26Schema,
    releasedAt: '2026-11-05',
    type: 'image',
  },
  {
    description:
      "OpenAI's fastest GPT Image 2.5 model, for high-quality everyday image generation.",
    displayName: 'GPT Image 2.5 Flare',
    enabled: true,
    id: 'gpt-image-2.5-flare',
    parameters: gptImage25Schema,
    releasedAt: '2026-10-09',
    type: 'image',
  },
  // https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst
  {
    description:
      'The GPT Image 2.5 model for workflows where editing precision matters most, generating and editing images from text and image inputs.',
    displayName: 'GPT Image 2.5 Sunburst',
    enabled: true,
    id: 'gpt-image-2.5-sunburst',
    parameters: gptImage25Schema,
    releasedAt: '2026-10-09',
    type: 'image',
  },
];
