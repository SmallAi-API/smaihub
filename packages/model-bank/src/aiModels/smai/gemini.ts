import type { AIChatModelCard, AIImageModelCard } from '../../types/aiModel';
import { nanoBanana21Parameters } from './parameters';

export const geminiChatModels: AIChatModelCard[] = [
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
    // https://ai.google.dev/gemini-api/docs/models/gemini-4-hydrogen
    contextWindowTokens: 1_048_576,
    description:
      'Gemini 4 Hydrogen brings fast, efficient intelligence to everyday coding, agentic workflows, and multimodal reasoning, with four configurable thinking levels.',
    displayName: 'Gemini 4 Hydrogen',
    enabled: true,
    family: 'gemini',
    generation: 'gemini-4',
    id: 'gemini-4-hydrogen',
    // Synchronous limit; long decode requires background execution or continuation.
    maxOutput: 65_536,
    releasedAt: '2026-11-12',
    settings: {
      disabledParams: ['temperature', 'top_p'],
      extendParams: ['thinkingLevel5', 'urlContext'],
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
    contextWindowTokens: 1_048_576,
    description:
      "Gemini 4 Carbon is Google's strongest model, with state-of-the-art cybersecurity and long-horizon capabilities for sustained agentic coding, multimodal knowledge work, and scientific reasoning.",
    displayName: 'Gemini 4 Carbon',
    enabled: true,
    family: 'gemini',
    generation: 'gemini-4',
    id: 'gemini-4-carbon',
    maxOutput: 65_536,
    // https://openrouter.ai/api/v1/models/google/gemini-4-carbon/endpoints
    releasedAt: '2026-11-11',
    // OpenRouter forwards `thinkingLevel` as `reasoning.effort`. `urlContext` is a Gemini API
    // tool OpenRouter does not proxy, so it is left out.
    settings: {
      disabledParams: ['temperature', 'top_p'],
      extendParams: ['thinkingLevel3'],
      searchImpl: 'params',
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
    contextWindowTokens: 1_048_576,
    description:
      'Gemini 4 Argon is built for complex software engineering, mathematics, scientific reasoning, and autonomous multi-step agent tasks, with multimodal input and text output.',
    displayName: 'Gemini 4 Argon',
    enabled: true,
    family: 'gemini',
    generation: 'gemini-4',
    id: 'gemini-4-argon',
    // Synchronous output limit; background Interactions decoding is not enabled.
    maxOutput: 65_536,
    releasedAt: '2026-10-14',
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
      "Gemini 3.8 Flash is Google's most intelligent Flash model, engineered for long-horizon software engineering, autonomous agents, and complex enterprise workflows.",
    displayName: 'Gemini 3.8 Flash',
    enabled: true,
    family: 'gemini',
    generation: 'gemini-3.8',
    id: 'gemini-3.8-flash',
    knowledgeCutoff: '2026-03',
    maxOutput: 65_536,
    // Introductory pricing, in effect through 2026-12-31. From 2027-01-01 standard rates apply:
    // input 1.5 / output 7.5 / cacheRead 0.15 / cacheWrite lookup { '1h': 1 } (per million tokens).
    // See https://cloud.google.com/vertex-ai/generative-ai/pricing
    releasedAt: '2026-09-02',
    settings: {
      disabledParams: ['temperature', 'top_p'],
      extendParams: ['thinkingLevel3', 'urlContext'],
      searchImpl: 'params',
      searchProvider: 'google',
    },
    type: 'chat',
  },
];

export const geminiImageModels: AIImageModelCard[] = [
  {
    description:
      'Nano Banana 2.1 generates and edits images at 1K, 2K, and 4K, with improved text rendering, character consistency, and support for up to 14 reference images.',
    displayName: 'Nano Banana 2.1',
    enabled: true,
    id: 'gemini-nano-banana-2.1',
    parameters: nanoBanana21Parameters,
    releasedAt: '2026-10-09',
    type: 'image',
  },
];
