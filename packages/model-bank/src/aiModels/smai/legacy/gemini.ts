/* eslint-disable eslint-core/no-restricted-syntax -- Preserve existing Chinese model descriptions. */
import type { AIChatModelCard, AIImageModelCard } from '../../../types/aiModel';
import { nanoBanana2Parameters, nanoBananaProParameters } from '../parameters';

export const legacyGeminiChatModels: AIChatModelCard[] = [
  {
    abilities: {
      audio: true,
      functionCall: true,
      reasoning: true,
      search: true,
      structuredOutput: true,
      video: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 3.7 Flash is the next iteration in the Gemini 3 series of highly-capable, natively multimodal, reasoning models, with support for computer use and file search.',
    displayName: 'Gemini 3.7 Flash',
    family: 'gemini',
    generation: 'gemini-3.7',
    id: 'gemini-3.7-flash',
    knowledgeCutoff: '2026-03',
    maxOutput: 65_536,
    // Introductory pricing, in effect through 2026-12-31. From 2027-01-01 standard rates apply:
    // input 1.5 / output 7.5 / cacheRead 0.15 / cacheWrite lookup { '1h': 1 } (per million tokens).
    // See https://ai.google.dev/gemini-api/docs/pricing
    releasedAt: '2026-08-19',
    settings: {
      disabledParams: ['temperature', 'top_p'],
      extendParams: ['thinkingLevel3', 'urlContext'],
      searchImpl: 'params',
      searchProvider: 'google',
    },
    type: 'chat',
  },
  {
    abilities: {
      audio: true,
      functionCall: true,
      reasoning: true,
      search: true,
      structuredOutput: true,
      video: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 3.6 Flash balances speed with intelligence for agentic and multimodal tasks, with lower output cost than 3.5 Flash.',
    displayName: 'Gemini 3.6 Flash',
    family: 'gemini',
    generation: 'gemini-3.6',
    id: 'gemini-3.6-flash',
    knowledgeCutoff: '2026-03',
    maxOutput: 65_536,
    releasedAt: '2026-07-21',
    settings: {
      disabledParams: ['temperature', 'top_p'],
      extendParams: ['thinkingLevel', 'urlContext'],
      searchImpl: 'params',
      searchProvider: 'google',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      video: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      "Gemini's most intelligent model built for speed, combining frontier intelligence with superior search and grounding.",
    displayName: 'Gemini 3.5 Flash',
    id: 'gemini-3.5-flash',
    maxOutput: 65_536,
    releasedAt: '2026-05-20',
    settings: {
      extendParams: ['thinkingLevel', 'urlContext'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
      video: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 3.1 Pro Preview provides better thinking, improved token efficiency, and a reliable experience optimized for software engineering behavior.',
    displayName: 'Gemini 3.1 Pro Preview',
    id: 'gemini-3.1-pro-preview',
    maxOutput: 65_536,
    releasedAt: '2026-02-23',
    settings: {
      extendParams: ['thinkingLevel3', 'urlContext'],
    },
    type: 'chat',
  },
  {
    abilities: {
      imageOutput: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 131_072 + 32_768,
    description:
      'Gemini 3.1 Flash Image (Nano Banana 2) delivers Pro-level image quality at Flash speed with multimodal chat support.',
    displayName: 'Nano Banana 2',
    id: 'gemini-3.1-flash-image-preview',
    maxOutput: 32_768,
    releasedAt: '2026-02-27',
    settings: {
      extendParams: ['imageAspectRatio2', 'imageResolution2', 'thinkingLevel4'],
      searchImpl: 'params',
      searchProvider: 'google',
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
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 3 Pro 是 全球最佳的多模态理解模型，也是 Google 迄今为止最强大的智能体和氛围编程模型，提供更丰富的视觉效果和更深层次的交互性，所有这些都建立在最先进的推理能力基础之上。',
    displayName: 'Gemini 3.0 Pro Preview',
    id: 'gemini-3-pro-preview',
    maxOutput: 65_536,
    releasedAt: '2025-11-19',
    settings: {
      extendParams: ['thinkingLevel', 'urlContext'],
      searchImpl: 'params',
      searchProvider: 'google',
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
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 3 Pro 是 全球最佳的多模态理解模型，也是 Google 迄今为止最强大的智能体和氛围编程模型，提供更丰富的视觉效果和更深层次的交互性，所有这些都建立在最先进的推理能力基础之上。',
    displayName: 'Gemini 3.0 Pro Preview Thinking',
    id: 'gemini-3-pro-preview-thinking',
    maxOutput: 65_536,
    releasedAt: '2025-11-19',
    settings: {
      extendParams: ['thinkingLevel', 'urlContext'],
      searchImpl: 'params',
      searchProvider: 'google',
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
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 3 Pro 是全球最佳的多模态理解模型，也是 Google 迄今为止最强大的智能体和氛围编程模型，提供更丰富的视觉效果和更深层次的交互性，所有这些都建立在最先进的推理能力基础之上。',
    displayName: 'Gemini 3.0 Flash Preview',
    id: 'gemini-3-flash-preview',
    maxOutput: 65_536,
    releasedAt: '2025-12-18',
    settings: {
      extendParams: ['thinkingLevel', 'urlContext'],
      searchImpl: 'params',
      searchProvider: 'google',
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
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 3 Pro 是全球最佳的多模态理解模型，也是 Google 迄今为止最强大的智能体和氛围编程模型，提供更丰富的视觉效果和更深层次的交互性，所有这些都建立在最先进的推理能力基础之上。',
    displayName: 'Gemini 3.0 Flash Preview Thinking',
    id: 'gemini-3-flash-preview-thinking',
    maxOutput: 65_536,
    releasedAt: '2025-12-18',
    settings: {
      extendParams: ['thinkingLevel', 'urlContext'],
      searchImpl: 'params',
      searchProvider: 'google',
    },
    type: 'chat',
  },
  {
    abilities: {
      imageOutput: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 131_072 + 32_768,
    description:
      'Gemini 3 Pro Image（Nano Banana Pro）是 Google 的图像生成模型，同时支持多模态对话。',
    displayName: '🍌 Nano Banana Pro',
    id: 'nano-banana-pro-preview',
    maxOutput: 32_768,
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
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 2.5 Pro 是 Google 最先进的思维模型，能够对代码、数学和STEM领域的复杂问题进行推理，以及使用长上下文分析大型数据集、代码库和文档。',
    displayName: 'Gemini 2.5 Pro',
    id: 'gemini-2.5-pro',
    maxOutput: 65_536,
    releasedAt: '2025-06-17',
    settings: {
      extendParams: ['thinkingBudget', 'urlContext'],
      searchImpl: 'params',
      searchProvider: 'google',
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'gemini-2.5-pro-deepsearch 是 Google 最先进的思维模型，能够对代码、数学和STEM领域的复杂问题进行推理，以及使用长上下文分析大型数据集、代码库和文档。',
    displayName: 'Gemini 2.5 Pro Deepsearch',
    id: 'gemini-2.5-pro-deepsearch',
    maxOutput: 65_536,
    releasedAt: '2025-06-17',
    settings: {
      extendParams: ['thinkingBudget'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 2.5 Pro Preview 是 Google 最先进的思维模型，能够对代码、数学和STEM领域的复杂问题进行推理，以及使用长上下文分析大型数据集、代码库和文档。',
    displayName: 'Gemini 2.5 Pro Preview 06-05',
    id: 'gemini-2.5-pro-preview-06-05',
    maxOutput: 65_536,
    releasedAt: '2025-05-06',
    settings: {
      extendParams: ['thinkingBudget', 'urlContext'],
      searchImpl: 'params',
      searchProvider: 'google',
    },
    type: 'chat',
  },
  {
    abilities: {
      imageOutput: true,
      vision: true,
    },
    contextWindowTokens: 32_768 + 8192,
    description:
      'Nano Banana 是 Google 最新、最快、最高效的原生多模态模型，它允许您通过对话生成和编辑图像。',
    displayName: 'Nano Banana',
    id: 'gemini-2.5-flash-image',
    maxOutput: 8192,

    releasedAt: '2025-08-26',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 2.5 Pro Preview 是 Google 最先进的思维模型，能够对代码、数学和STEM领域的复杂问题进行推理，以及使用长上下文分析大型数据集、代码库和文档。',
    displayName: 'Gemini 2.5 Pro Preview 06-05 Thinking',
    id: 'gemini-2.5-pro-preview-06-05-thinking',
    maxOutput: 65_536,
    releasedAt: '2025-05-06',
    settings: {
      extendParams: ['thinkingBudget', 'urlContext'],
      searchImpl: 'params',
      searchProvider: 'google',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 2.5 Pro Preview 是 Google 最先进的思维模型，能够对代码、数学和STEM领域的复杂问题进行推理，以及使用长上下文分析大型数据集、代码库和文档。',
    displayName: 'Gemini 2.5 Pro Preview 05-06',
    id: 'gemini-2.5-pro-preview-05-06',
    maxOutput: 65_536,
    releasedAt: '2025-05-06',
    settings: {
      extendParams: ['thinkingBudget'],
    },
    type: 'chat',
  },
  {
    abilities: {
      imageOutput: true,
      vision: true,
    },
    contextWindowTokens: 32_768 + 8192,
    description:
      'Gemini 2.5 Flash Image Preview 是 Google 最新、最快、最高效的原生多模态模型，它允许您通过对话生成和编辑图像。',
    displayName: 'Gemini 2.5 Flash Image Preview',

    id: 'gemini-2.5-flash-image-preview',
    maxOutput: 8192,
    releasedAt: '2025-08-27',
    type: 'chat',
  },
  {
    abilities: {
      imageOutput: true,
      vision: true,
    },
    contextWindowTokens: 32_768 + 8192,
    description:
      'Gemini 2.5 Flash Image Preview 是 Google 最新、最快、最高效的原生多模态模型，它允许您通过对话生成和编辑图像。',
    displayName: 'Gemini 2.5 Flash Image Preview all',

    id: 'gemini-2.5-flash-image-preview-all',
    maxOutput: 8192,

    releasedAt: '2025-08-27',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description: 'Gemini 2.5 Flash 是 Google 性价比最高的模型，提供全面的功能。',
    displayName: 'Gemini 2.5 Flash',

    id: 'gemini-2.5-flash',
    maxOutput: 65_536,
    releasedAt: '2025-06-17',
    settings: {
      extendParams: ['thinkingBudget'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description: 'Gemini 2.5 Flash Preview 是 Google 性价比最高的模型，提供全面的功能。',
    displayName: 'Gemini 2.5 Flash Preview 05-20',

    id: 'gemini-2.5-flash-preview-05-20',
    maxOutput: 65_536,
    releasedAt: '2025-05-20',
    settings: {
      extendParams: ['thinkingBudget'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description: 'Gemini 2.5 Flash-Lite 是 Google 最小、性价比最高的模型，专为大规模使用而设计。',
    displayName: 'Gemini 2.5 Flash-Lite',

    id: 'gemini-2.5-flash-lite',
    maxOutput: 65_536,
    releasedAt: '2025-07-22',
    settings: {
      extendParams: ['thinkingBudget'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 2.5 Flash-Lite Preview 是 Google 最小、性价比最高的模型，专为大规模使用而设计。',
    displayName: 'Gemini 2.5 Flash-Lite Preview 06-17',

    id: 'gemini-2.5-flash-lite-preview-06-17',
    maxOutput: 65_536,
    releasedAt: '2025-06-11',
    settings: {
      extendParams: ['thinkingBudget'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 8192,
    description:
      'Gemini 2.0 Flash 提供下一代功能和改进，包括卓越的速度、原生工具使用、多模态生成和1M令牌上下文窗口。',
    displayName: 'Gemini 2.0 Flash',

    id: 'gemini-2.0-flash',
    maxOutput: 8192,
    releasedAt: '2025-02-05',
    type: 'chat',
  },
];

export const legacyGeminiImageModels: AIImageModelCard[] = [
  {
    description:
      'Gemini 3.1 Flash Image（Nano Banana Pro 2）是 Google 在2026年2月份推出的图像生成模型。',
    displayName: 'Nano Banana 2',
    id: 'gemini-3.1-flash-image-preview:image',
    parameters: nanoBanana2Parameters,
    releasedAt: '2026-02-27',
    type: 'image',
  },
  {
    description:
      'Gemini 3 Pro Image（Nano Banana Pro）是 Google 的图像生成模型，同时支持多模态对话。',
    displayName: '🍌 Nano Banana Pro',
    id: 'gemini-3-pro-image-preview:image',
    parameters: nanoBananaProParameters,
    releasedAt: '2025-11-20',
    type: 'image',
  },
];
