import type { AIChatModelCard } from '../types/aiModel';

// https://internlm.intern-ai.org.cn/api/document

const internlmChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 262_144,
    description:
      'By default, it points to our latest released Intern series model, currently set to intern-s2-preview.',
    displayName: 'Intern',
    id: 'intern-latest',
    pricing: {
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2026-05-22',
    settings: {
      extendParams: ['enableReasoning'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 262_144,
    description:
      'Our newly released 35B-A3B scientific multimodal reasoning model supports a 256K context window. Through task scaling and architectural optimization, it is specifically designed to enhance scientific discovery and general-purpose agent capabilities.',
    displayName: 'Intern-S2-Preview',
    enabled: true,
    id: 'intern-s2-preview',
    pricing: {
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2026-05-22',
    settings: {
      extendParams: ['enableReasoning'],
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
    contextWindowTokens: 262_144,
    description:
      'We have launched our most advanced open-source multimodal reasoning model, currently the top-performing open-source multimodal large language model in terms of overall performance.',
    displayName: 'Intern-S1-Pro',
    enabled: true,
    id: 'intern-s1-pro',
    pricing: {
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2026-02-04',
    settings: {
      extendParams: ['enableReasoning'],
      searchImpl: 'internal',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Our latest model series with excellent reasoning performance, leading open models in its size class. Defaults to the latest InternLM3 series (currently internlm3-8b-instruct).',
    displayName: 'InternLM3',
    enabled: true,
    id: 'internlm3-latest',
    pricing: {
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-07-26',
    settings: {
      extendParams: ['enableReasoning'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Legacy models still maintained with excellent, stable performance after many iterations. Available in 7B and 20B sizes, supporting 1M context and stronger instruction following and tool use. Defaults to the latest InternLM2.5 series (currently internlm2.5-20b-chat).',
    displayName: 'InternLM2.5',
    id: 'internlm2.5-latest',
    pricing: {
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-08-20',
    settings: {
      extendParams: ['enableReasoning'],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Our latest multimodal model with stronger image-text understanding and long-sequence image comprehension, comparable to top closed models. Defaults to the latest InternVL series (currently internvl3-78b).',
    displayName: 'InternVL3',
    enabled: true,
    id: 'internvl3-latest',
    pricing: {
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Our newly released multimodal large model features enhanced image-and-text understanding and long-sequence image comprehension capabilities, achieving performance comparable to leading closed-source models.',
    displayName: 'InternVL3.5-241B-A28B',
    id: 'internvl3.5-241b-a28b',
    pricing: {
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
];

export const allModels = [...internlmChatModels];

export default allModels;
