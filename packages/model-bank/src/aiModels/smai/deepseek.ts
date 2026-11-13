import type { AIChatModelCard } from '../../types/aiModel';

export const deepseekChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      structuredOutput: true,
    },
    contextWindowTokens: 131_072,
    description:
      'DeepSeek V4.1 Flash is the cost-efficient member of the V4 family with a 1M context window and hybrid thinking. Thinking mode is on by default and can be toggled via the `thinking` parameter; non-thinking mode is optimized for latency-sensitive workflows.',
    displayName: 'DeepSeek V4.1 Flash',
    enabled: true,
    id: 'deepseek-v4.1-flash',
    maxOutput: 384_000,
    releasedAt: '2026-10-17',
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken32k'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'DeepSeek V4 Flash is the cost-efficient member of the V4 family with a 1M context window and hybrid thinking. Thinking mode is on by default and can be toggled via the `thinking` parameter; non-thinking mode is optimized for latency-sensitive workflows.',
    displayName: 'DeepSeek V4 Flash Vision',
    enabled: true,
    id: 'deepseek-v4-flash-vision-exp',
    maxOutput: 384_000,
    releasedAt: '2026-08-27',
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken32k'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
    },
    contextWindowTokens: 1_000_000,
    description:
      'DeepSeek V4 Pro is the flagship of the V4 family, optimized for high-intensity reasoning, agentic workflows, and long-horizon planning. Thinking mode is on by default and can be toggled via the `thinking` parameter.',
    displayName: 'DeepSeek V4 Pro',
    enabled: true,
    id: 'deepseek-v4-pro',
    maxOutput: 384_000,
    releasedAt: '2026-04-24',
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken32k'],
    },
    type: 'chat',
  },
];
