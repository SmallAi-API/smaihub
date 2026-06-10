import type { AIChatModelCard } from '../types/aiModel';

const cerebrasModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    displayName: 'GPT OSS 120B',
    enabled: true,
    family: 'gpt-oss',
    generation: 'gpt-oss',
    id: 'gpt-oss-120b',
    knowledgeCutoff: '2024-06',
    maxOutput: 40_960,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.6, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'Llama 3.3 70B: a mid-to-large Llama model balancing reasoning and throughput.',
    displayName: 'Llama 3.3 70B',
    id: 'llama-3.3-70b',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.85, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      "GLM-4.7 is Zhipu's new generation flagship model with 355B total parameters and 32B active parameters, fully upgraded in general dialogue, reasoning, and agent capabilities. GLM-4.7 enhances Interleaved Thinking and introduces Preserved Thinking and Turn-level Thinking.",
    displayName: 'GLM-4.7',
    family: 'glm',
    generation: 'glm-4.7',
    id: 'zai-glm-4.7',
    maxOutput: 40_960,
    pricing: {
      units: [
        { name: 'textInput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
];

export const allModels = [...cerebrasModels];

export default allModels;
