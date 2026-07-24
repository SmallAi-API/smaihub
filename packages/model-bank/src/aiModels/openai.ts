/* eslint-disable no-restricted-syntax */
import { gptImage1Schema, gptImage2Schema } from '../const/imageParameters';
import type {
  AIASRModelCard,
  AIChatModelCard,
  AIEmbeddingModelCard,
  AIImageModelCard,
  AIRealtimeModelCard,
  AITTSModelCard,
} from '../types/aiModel';

export const openaiChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 400_000,
    description: 'Latest Instant model used in ChatGPT.',
    displayName: 'Chat Latest',
    id: 'chat-latest',
    knowledgeCutoff: '2025-08',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 30, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2026-05-05',
    settings: {
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
      "GPT-5.6 Sol is OpenAI's latest flagship and most capable model, the top choice in the GPT family for coding and agentic work.",
    displayName: 'GPT-5.6 Sol',
    enabled: true,
    family: 'gpt',
    generation: 'gpt-5.6',
    id: 'gpt-5.6-sol',
    knowledgeCutoff: '2026-02',
    maxOutput: 128_000,
    pricing: {
      units: [
        {
          name: 'textInput',
          strategy: 'tiered',
          tiers: [
            { rate: 5, upTo: 272_000 },
            { rate: 10, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
        {
          name: 'textInput_cacheRead',
          strategy: 'tiered',
          tiers: [
            { rate: 0.5, upTo: 272_000 },
            { rate: 1, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
        {
          name: 'textInput_cacheWrite',
          strategy: 'tiered',
          tiers: [
            { rate: 6.25, upTo: 272_000 },
            { rate: 12.5, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
        {
          name: 'textOutput',
          strategy: 'tiered',
          tiers: [
            { rate: 30, upTo: 272_000 },
            { rate: 45, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
      ],
    },
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
    pricing: {
      units: [
        {
          name: 'textInput',
          strategy: 'tiered',
          tiers: [
            { rate: 2.5, upTo: 272_000 },
            { rate: 5, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
        {
          name: 'textInput_cacheRead',
          strategy: 'tiered',
          tiers: [
            { rate: 0.25, upTo: 272_000 },
            { rate: 0.5, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
        {
          name: 'textInput_cacheWrite',
          strategy: 'tiered',
          tiers: [
            { rate: 3.125, upTo: 272_000 },
            { rate: 6.25, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
        {
          name: 'textOutput',
          strategy: 'tiered',
          tiers: [
            { rate: 15, upTo: 272_000 },
            { rate: 22.5, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
      ],
    },
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
    pricing: {
      units: [
        {
          name: 'textInput',
          strategy: 'tiered',
          tiers: [
            { rate: 1, upTo: 272_000 },
            { rate: 2, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
        {
          name: 'textInput_cacheRead',
          strategy: 'tiered',
          tiers: [
            { rate: 0.1, upTo: 272_000 },
            { rate: 0.2, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
        {
          name: 'textInput_cacheWrite',
          strategy: 'tiered',
          tiers: [
            { rate: 1.25, upTo: 272_000 },
            { rate: 2.5, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
        {
          name: 'textOutput',
          strategy: 'tiered',
          tiers: [
            { rate: 6, upTo: 272_000 },
            { rate: 9, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
      ],
    },
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
      "GPT-5.5 is OpenAI's previous-generation frontier model for complex professional work.",
    displayName: 'GPT-5.5',
    enabled: true,
    family: 'gpt',
    generation: 'gpt-5.5',
    id: 'gpt-5.5',
    knowledgeCutoff: '2025-12',
    maxOutput: 128_000,
    pricing: {
      units: [
        {
          name: 'textInput',
          strategy: 'tiered',
          tiers: [
            { rate: 5, upTo: 272_000 },
            { rate: 10, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
        {
          name: 'textInput_cacheRead',
          strategy: 'tiered',
          tiers: [
            { rate: 0.5, upTo: 272_000 },
            { rate: 1, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
        {
          name: 'textOutput',
          strategy: 'tiered',
          tiers: [
            { rate: 30, upTo: 272_000 },
            { rate: 45, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
      ],
    },
    releasedAt: '2026-04-23',
    settings: {
      extendParams: ['gpt5_2ReasoningEffort', 'textVerbosity'],
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
      'GPT-5.5 pro uses more compute to think harder and provide consistently better answers.',
    displayName: 'GPT-5.5 Pro',
    family: 'gpt',
    generation: 'gpt-5.5',
    id: 'gpt-5.5-pro',
    knowledgeCutoff: '2025-12',
    maxOutput: 128_000,
    pricing: {
      units: [
        {
          name: 'textInput',
          rate: 30,
          strategy: 'fixed',
          unit: 'millionTokens',
        },
        {
          name: 'textOutput',
          rate: 180,
          strategy: 'fixed',
          unit: 'millionTokens',
        },
      ],
    },
    releasedAt: '2026-04-23',
    settings: {
      extendParams: ['gpt5_2ProReasoningEffort', 'textVerbosity'],
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
      'GPT-5.4 is the frontier model for complex professional work with highest reasoning capability.',
    displayName: 'GPT-5.4',
    enabled: true,
    family: 'gpt',
    generation: 'gpt-5.4',
    id: 'gpt-5.4',
    knowledgeCutoff: '2025-08',
    maxOutput: 128_000,
    pricing: {
      units: [
        {
          name: 'textInput',
          strategy: 'tiered',
          tiers: [
            { rate: 2.5, upTo: 272_000 },
            { rate: 5, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
        {
          name: 'textInput_cacheRead',
          strategy: 'tiered',
          tiers: [
            { rate: 0.25, upTo: 272_000 },
            { rate: 0.5, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
        {
          name: 'textOutput',
          strategy: 'tiered',
          tiers: [
            { rate: 15, upTo: 272_000 },
            { rate: 22.5, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
      ],
    },
    releasedAt: '2026-03-05',
    settings: {
      extendParams: ['gpt5_2ReasoningEffort', 'textVerbosity'],
      searchImpl: 'params',
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
    contextWindowTokens: 1_050_000,
    description:
      'GPT-5.4 Pro uses more compute to think harder and provide consistently better answers, available in the Responses API only.',
    displayName: 'GPT-5.4 Pro',
    family: 'gpt',
    generation: 'gpt-5.4',
    id: 'gpt-5.4-pro',
    knowledgeCutoff: '2025-08',
    maxOutput: 128_000,
    pricing: {
      units: [
        {
          name: 'textInput',
          strategy: 'tiered',
          tiers: [
            { rate: 30, upTo: 272_000 },
            { rate: 60, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
        {
          name: 'textOutput',
          strategy: 'tiered',
          tiers: [
            { rate: 180, upTo: 272_000 },
            { rate: 270, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
      ],
    },
    releasedAt: '2026-03-05',
    settings: {
      extendParams: ['gpt5_2ProReasoningEffort', 'textVerbosity'],
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
    contextWindowTokens: 400_000,
    description:
      "GPT-5.4 mini is OpenAI's strongest mini model for coding, computer use, and subagents.",
    displayName: 'GPT-5.4 mini',
    enabled: true,
    family: 'gpt',
    generation: 'gpt-5.4',
    id: 'gpt-5.4-mini',
    knowledgeCutoff: '2025-08',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.75, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.075, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2026-03-18',
    settings: {
      extendParams: ['gpt5_2ReasoningEffort', 'textVerbosity'],
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
    contextWindowTokens: 400_000,
    description:
      "GPT-5.4 nano is OpenAI's cheapest GPT-5.4-class model for simple high-volume tasks.",
    displayName: 'GPT-5.4 nano',
    family: 'gpt',
    generation: 'gpt-5.4',
    id: 'gpt-5.4-nano',
    knowledgeCutoff: '2025-08',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.02, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2026-03-18',
    settings: {
      extendParams: ['gpt5_2ReasoningEffort', 'textVerbosity'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
      structuredOutput: true,
    },
    contextWindowTokens: 128_000,
    description:
      'GPT-5.3 Chat is the latest ChatGPT model used in ChatGPT with improved conversation experiences.',
    displayName: 'GPT-5.3 Chat',
    family: 'gpt',
    generation: 'gpt-5.3',
    id: 'gpt-5.3-chat-latest',
    knowledgeCutoff: '2025-08',
    maxOutput: 16_384,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.75, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.175, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 14, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2026-03-04',
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
    contextWindowTokens: 400_000,
    description:
      'GPT-5.3-Codex is the most capable agentic coding model to date, optimized for agentic coding tasks in Codex or similar environments.',
    displayName: 'GPT-5.3 Codex',
    family: 'gpt',
    generation: 'gpt-5.3',
    id: 'gpt-5.3-codex',
    knowledgeCutoff: '2025-08',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.75, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.175, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 14, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2026-02-05',
    settings: {
      extendParams: ['codexMaxReasoningEffort'],
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
    contextWindowTokens: 400_000,
    description:
      'GPT-5.2 is a flagship model for coding and agentic workflows with stronger reasoning and long-context performance.',
    displayName: 'GPT-5.2',
    family: 'gpt',
    generation: 'gpt-5.2',
    id: 'gpt-5.2',
    knowledgeCutoff: '2025-08',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.75, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.175, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 14, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-12-11',
    settings: {
      extendParams: ['gpt5_2ReasoningEffort', 'textVerbosity'],
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
    contextWindowTokens: 400_000,
    description:
      'GPT-5.2-Codex is an upgraded GPT-5.2 variant optimized for long-horizon, agentic coding tasks.',
    displayName: 'GPT-5.2 Codex',
    family: 'gpt',
    generation: 'gpt-5.2',
    id: 'gpt-5.2-codex',
    knowledgeCutoff: '2025-08',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.75, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.175, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 14, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-12-18',
    settings: {
      extendParams: ['codexMaxReasoningEffort'],
      searchImpl: 'params',
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
    contextWindowTokens: 400_000,
    description:
      'GPT-5.2 pro: a smarter, more precise GPT-5.2 variant (Responses API only), suited for hard problems and longer multi-turn reasoning.',
    displayName: 'GPT-5.2 pro',
    family: 'gpt',
    generation: 'gpt-5.2',
    id: 'gpt-5.2-pro',
    knowledgeCutoff: '2025-08',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 21, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 168, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-12-11',
    settings: {
      extendParams: ['gpt5_2ProReasoningEffort'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'GPT-5.2 Chat is the ChatGPT variant (chat-latest) for the latest conversation improvements.',
    displayName: 'GPT-5.2 Chat',
    family: 'gpt',
    generation: 'gpt-5.2',
    id: 'gpt-5.2-chat-latest',
    knowledgeCutoff: '2025-08',
    maxOutput: 16_384,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.75, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.175, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 14, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-12-11',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 400_000,
    description:
      'GPT-5.1 — a flagship model optimized for coding and agent tasks with configurable reasoning effort and longer context.',
    displayName: 'GPT-5.1',
    family: 'gpt',
    generation: 'gpt-5.1',
    id: 'gpt-5.1',
    knowledgeCutoff: '2024-09',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-11-28',
    settings: {
      extendParams: ['gpt5_1ReasoningEffort', 'textVerbosity'],
      searchImpl: 'params',
    },
    type: 'chat',
  },

  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 400_000,
    description:
      'GPT-5.1 — 针对编码和 agent 任务优化的旗舰模型，支持可配置的推理强度与更长上下文。',
    displayName: 'GPT-5.1 Chat',
    family: 'gpt',
    generation: 'gpt-5.1',
    id: 'gpt-5.1-chat-latest',
    knowledgeCutoff: '2024-09',
    maxOutput: 16_384,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.125, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-11-13',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 400_000,
    description:
      "GPT-5.1 Codex Max: OpenAI's most intelligent coding model, optimized for long-horizon agentic coding tasks, supports reasoning tokens.",
    displayName: 'GPT-5.1 Codex Max',
    family: 'gpt',
    generation: 'gpt-5.1',
    id: 'gpt-5.1-codex-max',
    knowledgeCutoff: '2024-09',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.125, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-12-04',
    settings: {
      extendParams: ['codexMaxReasoningEffort'],
      searchImpl: 'params',
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
    contextWindowTokens: 400_000,
    description:
      'GPT-5.1 Codex: a GPT-5.1 variant optimized for agentic coding tasks, for complex code/agent workflows in the Responses API.',
    displayName: 'GPT-5.1 Codex',
    family: 'gpt',
    generation: 'gpt-5.1',
    id: 'gpt-5.1-codex',
    knowledgeCutoff: '2024-09',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.125, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-11-13',
    settings: {
      extendParams: ['reasoningEffort'],
      searchImpl: 'params',
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
    contextWindowTokens: 400_000,
    description:
      'GPT-5.1 Codex mini: a smaller, lower-cost Codex variant optimized for agentic coding tasks.',
    displayName: 'GPT-5.1 Codex mini',
    family: 'gpt',
    generation: 'gpt-5.1',
    id: 'gpt-5.1-codex-mini',
    knowledgeCutoff: '2024-09',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.025, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-11-13',
    settings: {
      extendParams: ['reasoningEffort'],
      searchImpl: 'params',
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
    contextWindowTokens: 400_000,
    description:
      'GPT-5 pro uses more compute to think deeper and consistently deliver better answers.',
    displayName: 'GPT-5 pro',
    family: 'gpt',
    generation: 'gpt-5',
    id: 'gpt-5-pro',
    knowledgeCutoff: '2024-09',
    maxOutput: 272_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 120, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-10-06',
    settings: {
      extendParams: ['textVerbosity'],
      searchImpl: 'params',
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
    contextWindowTokens: 400_000,
    description:
      'GPT-5 Codex is a GPT-5 variant optimized for agentic coding tasks in Codex-like environments.',
    displayName: 'GPT-5 Codex',
    family: 'gpt',
    generation: 'gpt-5',
    id: 'gpt-5-codex',
    knowledgeCutoff: '2024-09',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-11-28',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 400_000,
    description:
      'GPT-5.1 Thinking all：针对 agentic 编码任务优化的 GPT-5.1 版本，可在 Responses API 中用于更复杂的代码/代理工作流',
    displayName: 'GPT-5.1 Thinking all',
    enabled: true,
    id: 'gpt-5.1-thinking-all',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-11-28',
    settings: {
      extendParams: ['gpt5_1ReasoningEffort'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 400_000,
    description:
      'GPT-5.1 Codex：针对 agentic 编码任务优化的 GPT-5.1 版本，可在 Responses API 中用于更复杂的代码/代理工作流',
    displayName: 'GPT-5.1 Codex',
    enabled: true,
    id: 'gpt-5.1-codex',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-11-28',
    settings: {
      extendParams: ['gpt5_1ReasoningEffort'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 400_000,
    description:
      'GPT-5.1 Codex Mini：针对 agentic 编码任务优化的 GPT-5.1 版本，可在 Responses API 中用于更复杂的代码/代理工作流',
    displayName: 'GPT-5.1 Codex Mini',
    enabled: true,
    id: 'gpt-5.1-codex-mini',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-11-28',
    settings: {
      extendParams: ['gpt5_1ReasoningEffort'],
      searchImpl: 'params',
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
    contextWindowTokens: 400_000,
    description:
      '跨领域编码和代理任务的最佳模型。GPT-5 在准确性、速度、推理、上下文识别、结构化思维和问题解决方面实现了飞跃。',
    displayName: 'GPT-5',
    family: 'gpt',
    generation: 'gpt-5',
    id: 'gpt-5',
    knowledgeCutoff: '2024-09',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-08-07',
    settings: {
      extendParams: ['gpt5ReasoningEffort', 'textVerbosity'],
      searchImpl: 'params',
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
    contextWindowTokens: 400_000,
    description:
      'GPT‑5 All为官方网页版，是我们迄今为止发布的最强大的编码模型。它在编码基准测试和实际应用场景中均优于 o3，并且经过专门优化，在 Cursor、Windsurf 和 Codex CLI 等智能体编码产品中表现尤为出色。GPT‑5 给我们的 Alpha 测试者留下了深刻印象，在他们多次内部私密评估中创下了多项纪录。',
    displayName: 'GPT-5 All',
    enabled: true,
    id: 'gpt-5-all',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-08-08',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 400_000,
    description:
      'GPT‑5 Thinking-all为官方网页版强制返回思考模型，是我们迄今为止发布的最强大的编码模型。它在编码基准测试和实际应用场景中均优于 o3，并且经过专门优化，在 Cursor、Windsurf 和 Codex CLI 等智能体编码产品中表现尤为出色。GPT‑5 给我们的 Alpha 测试者留下了深刻印象，在他们多次内部私密评估中创下了多项纪录。',
    displayName: 'GPT-5 Thinking-all',
    enabled: true,
    id: 'gpt-5-thinking-all',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-08-08',
    settings: {
      searchImpl: 'params',
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
    contextWindowTokens: 400_000,
    description:
      '更快、更经济高效的 GPT-5 版本，适用于明确定义的任务。在保持高质量输出的同时，提供更快的响应速度。',
    displayName: 'GPT-5 mini',
    family: 'gpt',
    generation: 'gpt-5',
    id: 'gpt-5-mini',
    knowledgeCutoff: '2024-05',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.225, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-08-07',
    settings: {
      extendParams: ['gpt5ReasoningEffort', 'textVerbosity'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 400_000,
    description: '最快、最经济高效的 GPT-5 版本。非常适合需要快速响应且成本敏感的应用场景。',
    displayName: 'GPT-5 nano',
    family: 'gpt',
    generation: 'gpt-5',
    id: 'gpt-5-nano',
    knowledgeCutoff: '2024-05',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.045, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.36, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-08-07',
    settings: {
      extendParams: ['gpt5ReasoningEffort', 'textVerbosity'],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 400_000,
    description:
      'ChatGPT 中使用的 GPT-5 模型。结合了强大的语言理解与生成能力，适合对话式交互应用。',
    displayName: 'GPT-5 Chat',
    family: 'gpt',
    generation: 'gpt-5',
    id: 'gpt-5-chat-latest',
    knowledgeCutoff: '2024-09',
    maxOutput: 128_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-08-07',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'o4-mini 是我们最新的小型 o 系列模型。 它专为快速有效的推理而优化，在编码和视觉任务中表现出极高的效率和性能。',
    displayName: 'o4-mini',
    family: 'o-series',
    generation: 'o4',
    id: 'o4-mini',
    knowledgeCutoff: '2024-06',
    maxOutput: 100_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.99, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3.96, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-17',
    settings: {
      extendParams: ['reasoningEffort'],
      searchImpl: 'params',
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
    contextWindowTokens: 200_000,
    description:
      'o4-mini-deep-research 是我们更快速、更实惠的深度研究模型——非常适合处理复杂的多步骤研究任务。它可以从互联网上搜索和综合信息，也可以通过 MCP 连接器访问并利用你的自有数据。',
    displayName: 'o4-mini Deep Research',
    family: 'o-series',
    generation: 'o4',
    id: 'o4-mini-deep-research',
    knowledgeCutoff: '2024-06',
    maxOutput: 100_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 7.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-06-26',
    settings: {
      extendParams: ['reasoningEffort'],
      searchImpl: 'params',
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
    contextWindowTokens: 200_000,
    description:
      'o3-pro 模型使用更多的计算来更深入地思考并始终提供更好的答案，仅支持 Responses API 下使用。',
    displayName: 'o3-pro',
    family: 'o-series',
    generation: 'o3',
    id: 'o3-pro',
    knowledgeCutoff: '2024-06',
    maxOutput: 100_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 18, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 72, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-06-10',
    settings: {
      extendParams: ['reasoningEffort'],
      searchImpl: 'params',
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
    contextWindowTokens: 200_000,
    description:
      'o3 是一款全能强大的模型，在多个领域表现出色。它为数学、科学、编程和视觉推理任务树立了新标杆。它也擅长技术写作和指令遵循。用户可利用它分析文本、代码和图像，解决多步骤的复杂问题。',
    displayName: 'o3',
    family: 'o-series',
    generation: 'o3',
    id: 'o3',
    knowledgeCutoff: '2024-06',
    maxOutput: 100_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 7.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-16',
    settings: {
      extendParams: ['reasoningEffort'],
      searchImpl: 'params',
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
    contextWindowTokens: 200_000,
    description:
      'o3-deep-research 是我们最先进的深度研究模型，专为处理复杂的多步骤研究任务而设计。它可以从互联网上搜索和综合信息，也可以通过 MCP 连接器访问并利用你的自有数据。',
    displayName: 'o3 Deep Research',
    family: 'o-series',
    generation: 'o3',
    id: 'o3-deep-research',
    knowledgeCutoff: '2024-06',
    maxOutput: 100_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 36, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-06-26',
    settings: {
      extendParams: ['reasoningEffort'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 200_000,
    description:
      'o3-mini 是我们最新的小型推理模型，在与 o1-mini 相同的成本和延迟目标下提供高智能。',
    displayName: 'o3-mini',
    family: 'o-series',
    generation: 'o3',
    id: 'o3-mini',
    knowledgeCutoff: '2023-10',
    maxOutput: 100_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.99, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3.96, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-01-31',
    settings: {
      extendParams: ['reasoningEffort'],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 128_000,
    description:
      'The o1 series is trained with reinforcement learning to think before answering and handle complex reasoning. o1-pro uses more compute for deeper thinking and consistently higher-quality answers.',
    displayName: 'o1-pro',
    family: 'o-series',
    generation: 'o1',
    id: 'o1-pro',
    knowledgeCutoff: '2023-10',
    maxOutput: 100_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.99, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3.96, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-09-12',
    settings: {
      extendParams: ['reasoningEffort'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'o1是OpenAI新的推理模型，支持图文输入并输出文本，适用于需要广泛通用知识的复杂任务。该模型具有200K上下文和2023年10月的知识截止日期。',
    displayName: 'o1',
    family: 'o-series',
    generation: 'o1',
    id: 'o1',
    knowledgeCutoff: '2023-10',
    maxOutput: 100_000,
    pricing: {
      units: [
        { name: 'textInput', rate: 13.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 54, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-12-17',
    settings: {
      extendParams: ['reasoningEffort'],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 128_000,
    description:
      'o1是OpenAI新的推理模型，适用于需要广泛通用知识的复杂任务。该模型具有128K上下文和2023年10月的知识截止日期。',
    displayName: 'o1-preview',
    id: 'o1-preview',
    maxOutput: 32_768,
    pricing: {
      units: [
        { name: 'textInput', rate: 13.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 54, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-09-12',
    settings: {
      extendParams: ['reasoningEffort'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description: 'GPT-4.1 是我们用于复杂任务的旗舰模型。它非常适合跨领域解决问题。',
    displayName: 'GPT-4.1',
    family: 'gpt',
    generation: 'gpt-4.1',
    id: 'gpt-4.1',
    knowledgeCutoff: '2024-06',
    maxOutput: 32_768,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 7.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-14',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description:
      'GPT-4.1 mini 提供了智能、速度和成本之间的平衡，使其成为许多用例中有吸引力的模型。',
    displayName: 'GPT-4.1 mini',
    family: 'gpt',
    generation: 'gpt-4.1',
    id: 'gpt-4.1-mini',
    knowledgeCutoff: '2024-06',
    maxOutput: 32_768,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.36, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.44, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-14',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description: 'GPT-4.1 nano 是最快，最具成本效益的GPT-4.1模型。',
    displayName: 'GPT-4.1 nano',
    family: 'gpt',
    generation: 'gpt-4.1',
    id: 'gpt-4.1-nano',
    knowledgeCutoff: '2024-06',
    maxOutput: 32_768,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.09, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.36, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },

  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'GPT-4o mini是OpenAI在GPT-4 Omni之后推出的最新模型，支持图文输入并输出文本。作为他们最先进的小型模型，它比其他近期的前沿模型便宜很多，并且比GPT-3.5 Turbo便宜超过60%。它保持了最先进的智能，同时具有显著的性价比。GPT-4o mini在MMLU测试中获得了 82% 的得分，目前在聊天偏好上排名高于 GPT-4。',
    displayName: 'GPT-4o mini',
    family: 'gpt',
    generation: 'gpt-4o',
    id: 'gpt-4o-mini',
    knowledgeCutoff: '2023-10',
    maxOutput: 16_384,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.135, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.54, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-07-18',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      search: true,
    },
    contextWindowTokens: 128_000,
    description:
      'GPT-4o mini 搜索预览版是一个专门训练用于理解和执行网页搜索查询的模型，使用的是 Chat Completions API。除了令牌费用之外，网页搜索查询还会按每次工具调用收取费用。',
    displayName: 'GPT-4o mini Search Preview',
    family: 'gpt',
    generation: 'gpt-4o',
    id: 'gpt-4o-mini-search-preview',
    knowledgeCutoff: '2023-10',
    maxOutput: 16_384,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.135, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.54, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-03-11',
    settings: {
      searchImpl: 'internal',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      //search: true,
    },
    contextWindowTokens: 128_000,
    description: 'GPT-4o mini Audio 模型，支持音频输入输出',
    displayName: 'GPT-4o mini Audio',
    id: 'gpt-4o-mini-audio-preview',
    maxOutput: 16_384,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.35, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 5.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-12-17',
    /*
    settings: {
      searchImpl: 'params',
    },
    */
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
    displayName: 'GPT-4o',
    family: 'gpt',
    generation: 'gpt-4o',
    id: 'gpt-4o',
    knowledgeCutoff: '2023-10',
    pricing: {
      units: [
        { name: 'textInput', rate: 2.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-05-13',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      search: true,
    },
    contextWindowTokens: 128_000,
    description:
      'GPT-4o 搜索预览版是一个专门训练用于理解和执行网页搜索查询的模型，使用的是 Chat Completions API。除了令牌费用之外，网页搜索查询还会按每次工具调用收取费用。',
    displayName: 'GPT-4o Search Preview',
    family: 'gpt',
    generation: 'gpt-4o',
    id: 'gpt-4o-search-preview',
    knowledgeCutoff: '2023-10',
    maxOutput: 16_384,
    pricing: {
      units: [
        { name: 'textInput', rate: 2.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-03-11',
    settings: {
      searchImpl: 'internal',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
    displayName: 'GPT-4o 1120',
    family: 'gpt',
    generation: 'gpt-4o',
    id: 'gpt-4o-2024-11-20',
    knowledgeCutoff: '2023-10',
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 2.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-11-20',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
    displayName: 'GPT-4o 0513',
    family: 'gpt',
    generation: 'gpt-4o',
    id: 'gpt-4o-2024-05-13',
    knowledgeCutoff: '2023-10',
    pricing: {
      units: [
        { name: 'textInput', rate: 4.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 13.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-05-13',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      //search: true,
    },
    contextWindowTokens: 128_000,
    description:
      'GPT Audio is a general chat model for audio input/output, supported in the Chat Completions API.',
    displayName: 'GPT Audio',
    family: 'gpt',
    generation: 'gpt-audio',
    id: 'gpt-audio',
    knowledgeCutoff: '2023-10',
    maxOutput: 16_384,
    pricing: {
      units: [
        { name: 'textInput', rate: 2.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-12-17',
    /*
    settings: {
      searchImpl: 'params',
    },
    */
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'The latest GPT-4 Turbo adds vision. Visual requests support JSON mode and function calling. It is a cost-effective multimodal model that balances accuracy and efficiency for real-time applications.',
    displayName: 'GPT-4 Turbo',
    family: 'gpt',
    generation: 'gpt-4',
    id: 'gpt-4-turbo',
    knowledgeCutoff: '2023-12',
    pricing: {
      units: [
        { name: 'textInput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 30, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'The latest GPT-4 Turbo adds vision. Visual requests support JSON mode and function calling. It is a cost-effective multimodal model that balances accuracy and efficiency for real-time applications.',
    displayName: 'GPT-4 Turbo Vision 0409',
    family: 'gpt',
    generation: 'gpt-4',
    id: 'gpt-4-turbo-2024-04-09',
    knowledgeCutoff: '2023-12',
    pricing: {
      units: [
        { name: 'textInput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 30, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-04-09',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 8192,
    description:
      'GPT-4 provides a larger context window to handle longer inputs, suitable for broad information synthesis and data analysis.',
    displayName: 'GPT-4',
    family: 'gpt',
    generation: 'gpt-4',
    id: 'gpt-4',
    knowledgeCutoff: '2021-09',
    pricing: {
      units: [
        { name: 'textInput', rate: 30, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 60, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 8192,
    description:
      'GPT-4 provides a larger context window to handle longer inputs, suitable for broad information synthesis and data analysis.',
    displayName: 'GPT-4 0613',
    family: 'gpt',
    generation: 'gpt-4',
    id: 'gpt-4-0613',
    knowledgeCutoff: '2021-09',
    pricing: {
      units: [
        { name: 'textInput', rate: 30, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 60, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2023-06-13',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 16_384,
    description:
      'GPT 3.5 Turbo，适用于各种文本生成和理解任务，Currently points to gpt-3.5-turbo-0125',
    displayName: 'GPT-3.5 Turbo',
    family: 'gpt',
    generation: 'gpt-3.5',
    id: 'gpt-3.5-turbo',
    knowledgeCutoff: '2021-09',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.45, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.35, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 16_384,
    description:
      'GPT 3.5 Turbo，适用于各种文本生成和理解任务，Currently points to gpt-3.5-turbo-0125',
    displayName: 'GPT-3.5 Turbo 0125',
    family: 'gpt',
    generation: 'gpt-3.5',
    id: 'gpt-3.5-turbo-0125',
    knowledgeCutoff: '2021-09',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-01-25',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 16_384,
    description:
      'GPT 3.5 Turbo，适用于各种文本生成和理解任务，Currently points to gpt-3.5-turbo-0125',
    displayName: 'GPT-3.5 Turbo 1106',
    family: 'gpt',
    generation: 'gpt-3.5',
    id: 'gpt-3.5-turbo-1106',
    knowledgeCutoff: '2021-09',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.9, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2023-11-06',
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description: 'GPT 3.5 Turbo，适用于各种文本生成和理解任务，对指令遵循的优化',
    displayName: 'GPT-3.5 Turbo Instruct',
    family: 'gpt',
    generation: 'gpt-3.5',
    id: 'gpt-3.5-turbo-instruct',
    knowledgeCutoff: '2021-09',
    pricing: {
      units: [
        { name: 'textInput', rate: 1.35, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'computer-use-preview is a specialized model for the "computer use tool," trained to understand and execute computer-related tasks.',
    displayName: 'Computer Use Preview',
    family: 'gpt',
    id: 'computer-use-preview',
    knowledgeCutoff: '2023-10',
    maxOutput: 1024,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.99, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3.96, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-08-06',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'GPT-OSS 20B 是一款拥有 200 亿参数的顶尖语言模型，内置浏览器搜索和代码执行功能，并具备推理能力。',
    displayName: 'GPT OSS 20B',
    enabled: true,
    id: 'gpt-oss-20b',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.18, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.72, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-08-06',
    type: 'chat',
  },
];

export const openaiEmbeddingModels: AIEmbeddingModelCard[] = [
  {
    contextWindowTokens: 8192,
    description: '最强大的向量化模型，适用于英文和非英文任务',
    displayName: 'Text Embedding 3 Large',
    id: 'text-embedding-3-large',
    maxDimension: 3072,
    pricing: {
      currency: 'USD',
      units: [
        { name: 'textInput', rate: 0.117, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.117, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-01-25',
    type: 'embedding',
  },
  {
    contextWindowTokens: 8192,
    description: '高效且经济的新一代 Embedding 模型，适用于知识检索、RAG 应用等场景',
    displayName: 'Text Embedding 3 Small',
    enabled: true,
    id: 'text-embedding-3-small',
    maxDimension: 1536,
    pricing: {
      currency: 'USD',
      units: [
        { name: 'textInput', rate: 0.018, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.018, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-01-25',
    type: 'embedding',
  },
];

// 语音合成模型
export const openaiTTSModels: AITTSModelCard[] = [
  {
    description: '最新的文本转语音模型，针对实时场景优化速度',
    displayName: 'TTS-1',
    enabled: true,
    id: 'tts-1',
    pricing: {
      units: [
        { name: 'textInput', rate: 13.5, strategy: 'fixed', unit: 'millionCharacters' },
        { name: 'textOutput', rate: 13.5, strategy: 'fixed', unit: 'millionCharacters' },
      ],
    },
    type: 'tts',
  },
  {
    description: '最新的文本转语音模型，针对质量进行优化',
    displayName: 'TTS-1 HD',
    enabled: true,
    id: 'tts-1-hd',
    pricing: {
      units: [
        { name: 'textInput', rate: 27, strategy: 'fixed', unit: 'millionCharacters' },
        { name: 'textOutput', rate: 27, strategy: 'fixed', unit: 'millionCharacters' },
      ],
    },
    type: 'tts',
  },
];

// Speech recognition models
export const openaiASRModels: AIASRModelCard[] = [
  {
    description: '通用语音识别模型，支持多语言语音识别、语音翻译和语言识别。',
    displayName: 'Whisper',
    enabled: true,
    id: 'whisper-1',
    pricing: {
      units: [
        {
          name: 'audioInput',
          rate: 0.0001, // $0.006 per minute => $0.0001 per second
          strategy: 'fixed',
          unit: 'second',
        },
      ],
    },
    type: 'asr',
  },
  {
    contextWindowTokens: 16_000,
    description:
      'GPT-4o Transcribe is a speech-to-text model that transcribes audio with GPT-4o, improving word error rate, language ID, and accuracy over the original Whisper model.',
    displayName: 'GPT-4o Transcribe',
    id: 'gpt-4o-transcribe',
    maxOutput: 2000,
    pricing: {
      units: [
        { name: 'textInput', rate: 2.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'audioInput', rate: 6, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'asr',
  },
  {
    contextWindowTokens: 16_000,
    description:
      'GPT-4o Mini Transcribe is a speech-to-text model that transcribes audio with GPT-4o, improving word error rate, language ID, and accuracy over the original Whisper model.',
    displayName: 'GPT-4o Mini Transcribe',
    id: 'gpt-4o-mini-transcribe',
    maxOutput: 2000,
    pricing: {
      units: [
        { name: 'textInput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'audioInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'asr',
  },
];

// 图像生成模型
export const openaiImageModels: AIImageModelCard[] = [
  {
    description:
      "OpenAI's next-generation multimodal image model with native reasoning, up to 4K resolution, near-perfect text rendering, and high-fidelity multilingual support.",
    displayName: 'GPT Image 2',
    enabled: true,
    id: 'gpt-image-2',
    parameters: gptImage2Schema,
    pricing: {
      // Medium quality at 1024x1024: ~1767 output tokens * $30/M = $0.053 per image.
      // Source: https://developers.openai.com/api/docs/guides/image-generation#calculating-costs
      approximatePricePerImage: 0.053,
      units: [
        { name: 'textInput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'imageInput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'imageInput_cacheRead', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'imageOutput', rate: 30, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2026-04-21',
    type: 'image',
  },
  {
    description:
      'An enhanced GPT Image 1 model with 4× faster generation, more precise editing, and improved text rendering.',
    displayName: 'GPT Image 1.5',
    id: 'gpt-image-1.5',
    parameters: gptImage1Schema,
    pricing: {
      approximatePricePerImage: 0.034,
      units: [
        { name: 'textInput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'imageInput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'imageInput_cacheRead', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'imageOutput', rate: 32, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-12-16',
    type: 'image',
  },
  // https://platform.openai.com/docs/models/gpt-image-1
  {
    description: 'ChatGPT 原生多模态图片生成模型',
    displayName: 'GPT Image 1',
    id: 'gpt-image-1',
    parameters: gptImage1Schema,
    pricing: {
      approximatePricePerImage: 0.042,
      units: [
        { name: 'textInput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'imageInput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'imageInput_cacheRead', rate: 2.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'imageOutput', rate: 40, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'image',
  },
  {
    description:
      'A lower-cost GPT Image 1 variant with native text and image input and image output.',
    displayName: 'GPT Image 1 Mini',
    id: 'gpt-image-1-mini',
    parameters: gptImage1Schema,
    pricing: {
      approximatePricePerImage: 0.011,
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput_cacheRead', rate: 0.2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'imageInput', rate: 2.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'imageInput_cacheRead', rate: 0.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'imageOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-10-06',
    type: 'image',
  },
  {
    description:
      'The latest DALL·E model, released in November 2023, supports more realistic, accurate image generation with stronger detail.',
    displayName: 'DALL·E 3',
    id: 'dall-e-3',
    parameters: {
      prompt: { default: '' },
      quality: {
        default: 'standard',
        enum: ['standard', 'hd'],
      },
      size: {
        default: '1024x1024',
        enum: ['1024x1024', '1792x1024', '1024x1792'],
      },
    },
    pricing: {
      units: [
        {
          lookup: {
            prices: {
              hd_1024x1024: 0.08,
              hd_1024x1792: 0.12,
              hd_1792x1024: 0.12,
              standard_1024x1024: 0.04,
              standard_1024x1792: 0.08,
              standard_1792x1024: 0.08,
            },
            pricingParams: ['quality', 'size'],
          },
          name: 'imageGeneration',
          strategy: 'lookup',
          unit: 'image',
        },
      ],
    },
    resolutions: ['1024x1024', '1024x1792', '1792x1024'],
    type: 'image',
  },
  {
    description: '第二代 DALL·E 模型，支持更真实、准确的图像生成，分辨率是第一代的4倍',
    displayName: 'DALL·E 2',
    id: 'dall-e-2',
    parameters: {
      imageUrl: { default: null },
      prompt: { default: '' },
      size: {
        default: '1024x1024',
        enum: ['256x256', '512x512', '1024x1024'],
      },
    },
    pricing: {
      units: [
        {
          lookup: {
            prices: {
              '1024x1024': 0.02,
              '256x256': 0.016,
              '512x512': 0.018,
            },
            pricingParams: ['size'],
          },
          name: 'imageGeneration',
          strategy: 'lookup',
          unit: 'image',
        },
      ],
    },
    resolutions: ['256x256', '512x512', '1024x1024'],
    type: 'image',
  },
];

// GPT-4o 和 GPT-4o-mini 实时模型
export const openaiRealtimeModels: AIRealtimeModelCard[] = [
  {
    contextWindowTokens: 16_000,
    description: 'GPT-4o 实时版本，支持音频和文本实时输入输出',
    displayName: 'GPT-4o Realtime 241217',
    id: 'gpt-4o-realtime-preview',
    maxOutput: 4096,

    releasedAt: '2024-12-17',
    type: 'realtime',
  },
  {
    contextWindowTokens: 32_000,
    description: 'GPT-4o 实时版本，支持音频和文本实时输入输出',
    displayName: 'GPT-4o Realtime 250603',
    id: 'gpt-4o-realtime-preview-2025-06-03',
    maxOutput: 4096,

    releasedAt: '2025-06-03',
    type: 'realtime',
  },
  {
    contextWindowTokens: 16_000,
    description: 'GPT-4o 实时版本，支持音频和文本实时输入输出',
    displayName: 'GPT-4o Realtime 241001',
    id: 'gpt-4o-realtime-preview-2024-10-01', // deprecated on 2025-09-10
    maxOutput: 4096,

    releasedAt: '2024-10-01',
    type: 'realtime',
  },
  {
    contextWindowTokens: 128_000,
    description: 'GPT-4o-mini 实时版本，支持音频和文本实时输入输出',
    displayName: 'GPT-4o Mini Realtime',
    id: 'gpt-4o-mini-realtime-preview',
    maxOutput: 4096,

    releasedAt: '2024-12-17',
    type: 'realtime',
  },
];

export const allModels = [
  ...openaiChatModels,
  ...openaiEmbeddingModels,
  ...openaiTTSModels,
  ...openaiASRModels,
  ...openaiImageModels,
  ...openaiRealtimeModels,
];

export default allModels;
