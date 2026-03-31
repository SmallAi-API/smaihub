import type { AIChatModelCard } from '../types/aiModel';

const xiaomimimoChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      structuredOutput: true,
    },
    contextWindowTokens: 1_000_000,
    description:
      'MiMo-V2-Pro is specifically designed for high-intensity agent workflows in real-world scenarios. It features over 1 trillion total parameters (42B activated parameters), adopts an innovative hybrid attention architecture, and supports an ultra-long context length of up to 1 million tokens. Built on a powerful foundational model, we continuously scale computational resources across a broader range of agent scenarios, further expanding the action space of intelligence and achieving significant generalization—from coding to real-world task execution (“claw”).',
    displayName: 'MiMo-V2 Pro',
    enabled: true,
    id: 'mimo-v2-pro',
    maxOutput: 131_072,
    pricing: {
      currency: 'CNY',
      units: [
        {
          name: 'textInput_cacheRead',
          strategy: 'tiered',
          tiers: [
            { rate: 1.4, upTo: 0.256 },
            { rate: 2.8, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
        {
          name: 'textInput',
          strategy: 'tiered',
          tiers: [
            { rate: 7, upTo: 0.256 },
            { rate: 14, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
        {
          name: 'textOutput',
          strategy: 'tiered',
          tiers: [
            { rate: 21, upTo: 0.256 },
            { rate: 42, upTo: 'infinity' },
          ],
          unit: 'millionTokens',
        },
      ],
    },
    releasedAt: '2026-03-18',
    settings: {
      extendParams: ['enableReasoning'],
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
      video: true,
      vision: true,
    },
    contextWindowTokens: 262_144,
    description: 'MiMo-V2-Flash: An efficient model for reasoning, coding, and agent foundations.',
    displayName: 'MiMo-V2 Flash',
    enabled: true,
    id: 'mimo-v2-flash',
    maxOutput: 131_072,
    settings: {
      extendParams: ['enableReasoning'],
    },
    type: 'chat',
  },
];

export const allModels = [...xiaomimimoChatModels];

export default allModels;
