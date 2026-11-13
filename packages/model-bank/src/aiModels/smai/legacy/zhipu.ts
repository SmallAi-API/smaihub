import type { AIChatModelCard } from '../../../types/aiModel';

export const legacyZhipuChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 1_048_576,
    description:
      "GLM-5.2 is Z.ai's latest flagship model designed for long-horizon task scenarios, offering significant improvements in long-horizon task capabilities compared to GLM-5.1. This 753B MoE model supports a stable 1M-token context window, features stronger programming capabilities, and supports multiple thinking effort levels for a flexible balance between performance and latency.",
    displayName: 'GLM-5.2',
    family: 'glm',
    generation: 'glm-5.2',
    id: 'glm-5.2',
    releasedAt: '2026-08-10',
    settings: {
      extendParams: ['deepseekV4ReasoningEffort', 'reasoningBudgetToken'],
    },
    type: 'chat',
  },
];
