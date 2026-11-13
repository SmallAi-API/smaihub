import type { AIChatModelCard } from '../../types/aiModel';

export const xaiChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
      structuredOutput: true,
    },
    contextWindowTokens: 500_000,
    description:
      'Grok 4.7 is more reliable than Grok 4.6 on long-running coding and knowledge work, at the same price and speed, with a 500K context window.',
    displayName: 'Grok 4.7',
    enabled: true,
    id: 'grok-4.7',
    /** @see https://docs.x.ai/developers/models/grok-4.7 */
    releasedAt: '2026-09-21',
    settings: {
      extendParams: ['grok4_7ReasoningEffort'],
      searchImpl: 'params',
    },
    type: 'chat',
    family: 'grok',
    generation: 'grok-4.7',
    knowledgeCutoff: '2026-05',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 500_000,
    description:
      "SpaceXAI's flagship model for agentic tasks and knowledge work — remarkably fast, with coding ability on par with Claude Opus.",
    displayName: 'Grok 4.6',
    enabled: true,
    family: 'grok',
    generation: 'grok-4.6',
    id: 'grok-4.6',
    releasedAt: '2026-08-19',
    settings: {
      extendParams: ['grok4_5ReasoningEffort'],
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
    contextWindowTokens: 500_000,
    description:
      "SpaceXAI's flagship model for agentic tasks and knowledge work — remarkably fast, with coding ability on par with Claude Opus.",
    displayName: 'Grok 4.5',
    enabled: true,
    family: 'grok',
    generation: 'grok-4.5',
    id: 'grok-4.5',
    releasedAt: '2026-07-08',
    settings: {
      extendParams: ['grok4_5ReasoningEffort'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
];
