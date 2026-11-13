import type { AIChatModelCard } from '../../types/aiModel';

export const zhipuChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      structuredOutput: true,
    },
    contextWindowTokens: 1_048_576,
    description:
      'Zhipu’s latest flagship model. Built on the same base as GLM-5.2, it scales post-training with tens of times more long-horizon task environments and substantially longer training cycles. Coding experience improves by about 50% over the previous generation, ranking first among open-source models on Terminal Bench 3.0. It also shows strong cybersecurity capability, approaching Mythos 5 on white-box code review and vulnerability discovery.',
    displayName: 'GLM-5.3',
    enabled: true,
    family: 'glm',
    generation: 'glm-5.3',
    id: 'glm-5.3',
    maxOutput: 131_072,
    releasedAt: '2026-08-19',
    settings: {
      extendParams: ['glm5_3ReasoningEffort'],
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
    },
    contextWindowTokens: 1_048_576,
    description:
      'Zhipu’s latest flagship model. Built on the same base as GLM-5.2, it scales post-training with tens of times more long-horizon task environments and substantially longer training cycles. Coding experience improves by about 50% over the previous generation, ranking first among open-source models on Terminal Bench 3.0. It also shows strong cybersecurity capability, approaching Mythos 5 on white-box code review and vulnerability discovery.',
    displayName: 'GLM-5.3 Flash',
    enabled: true,
    family: 'glm',
    generation: 'glm-5.3-flash',
    id: 'glm-5.3-flash',
    maxOutput: 131_072,
    releasedAt: '2026-08-27',
    settings: {
      extendParams: ['glm5_3ReasoningEffort'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
];
