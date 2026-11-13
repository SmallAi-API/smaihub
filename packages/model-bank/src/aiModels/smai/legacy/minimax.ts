import type { AIChatModelCard } from '../../../types/aiModel';

export const legacyMinimaxChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      video: true,
      vision: true,
    },
    contextWindowTokens: 1_000_000,
    description:
      'Frontier coding model with native multimodal input, 1M context, and strong agent capabilities.',
    displayName: 'MiniMax M3',
    family: 'minimax',
    generation: 'minimax-m3',
    id: 'MiniMax-M3',
    maxOutput: 524_288,
    releasedAt: '2026-06-01',
    settings: {
      extendParams: ['enableReasoning'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 204_800,
    description:
      'First self-evolving model with top-tier coding and agentic performance (~60 tps).',
    displayName: 'MiniMax M2.7',
    id: 'MiniMax-M2.7',
    maxOutput: 131_072,
    releasedAt: '2026-03-18',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 204_800,
    description: 'Same performance as M2.7 with significantly faster inference (~100 tps).',
    displayName: 'MiniMax M2.7 Highspeed',
    id: 'MiniMax-M2.7-highspeed',
    maxOutput: 131_072,
    releasedAt: '2026-03-18',
    type: 'chat',
  },
];
