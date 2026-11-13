import type { AIChatModelCard } from '../../types/aiModel';

export const anthropicChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 1_000_000,
    description:
      'Claude Opus 5.5 is built for long-running agentic coding and knowledge work, outperforming Claude Fable 5.1 on Terminal-Bench 4.0 at a lower price than Claude Opus 5.',
    displayName: 'Claude Opus 5.5',
    enabled: true,
    family: 'claude-opus',
    generation: 'claude-5.5',
    id: 'claude-opus-5-5',
    knowledgeCutoff: '2026-06',
    maxOutput: 128_000,
    releasedAt: '2026-09-23',
    // Thinking is always on for Opus 5.5, so `enableAdaptiveThinking` is omitted.
    settings: {
      disabledParams: ['temperature', 'top_p'],
      extendParams: ['disableContextCaching', 'opus47Effort'],
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
    contextWindowTokens: 1_000_000,
    description:
      "Claude Haiku 5.5 is Anthropic's fastest and most cost-efficient model, built for high-volume, latency-sensitive work such as classification, extraction, routing, and subagent tasks, with adaptive thinking and adjustable effort.",
    displayName: 'Claude Haiku 5.5',
    enabled: true,
    family: 'claude-haiku',
    generation: 'claude-5.5',
    id: 'claude-haiku-5-5',
    knowledgeCutoff: '2026-06',
    maxOutput: 128_000,
    // Priced by prompt length: once a prompt (cache reads and writes included) exceeds 100K
    // tokens, every unit of the request is billed at the higher tier.
    // https://platform.claude.com/docs/en/about-claude/pricing#long-context-pricing
    releasedAt: '2026-10-07',
    // Unlike Opus 5.5 / Sonnet 5.5, thinking can still be disabled (at effort `high` or below),
    // so the `enableAdaptiveThinking` toggle stays.
    // https://platform.claude.com/docs/en/models/haiku-5-5/whats-new-haiku-5-5
    settings: {
      disabledParams: ['temperature', 'top_p'],
      extendParams: ['disableContextCaching', 'enableAdaptiveThinking', 'opus47Effort'],
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
    contextWindowTokens: 1_000_000,
    description:
      "Claude Sonnet 5-5 is Anthropic's most capable model, building on Opus 4.8 with improvements across reasoning, agentic coding, and tool use.",
    displayName: 'Claude Sonnet 5.5',
    enabled: true,
    id: 'claude-sonnet-5-5',
    maxOutput: 128_000,
    releasedAt: '2026-09-30',
    settings: {
      disabledParams: ['temperature', 'top_p'],
      extendParams: ['disableContextCaching', 'enableAdaptiveThinking', 'opus47Effort'],
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
    contextWindowTokens: 1_000_000,
    description:
      "Claude Fable 5.2 is Anthropic's latest model for demanding reasoning and long-horizon agentic work, priced below Fable 5.1.",
    displayName: 'Claude Fable 5.2',
    enabled: true,
    family: 'claude-mythos',
    generation: 'mythos-5.2',
    id: 'claude-fable-5-2',
    isOfficial: true,
    knowledgeCutoff: '2026-06',
    maxOutput: 128_000,
    releasedAt: '2026-11-12',
    // Like Fable 5.1, adaptive thinking is always on, so the `enableAdaptiveThinking` toggle is
    // intentionally omitted.
    // https://platform.claude.com/docs/en/models/fable-5-2/overview
    settings: {
      disabledParams: ['temperature', 'top_p'],
      extendParams: ['disableContextCaching', 'opus47Effort'],
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
    contextWindowTokens: 1_000_000,
    description:
      "Claude Fable 5.1 is Anthropic's most capable generally available model. It outperforms Fable 5 on long-running coding and research at the same base price, with cache reads at a quarter of the cost.",
    displayName: 'Claude Fable 5.1',
    enabled: true,
    family: 'claude-mythos',
    generation: 'mythos-5.1',
    id: 'claude-fable-5-1',
    knowledgeCutoff: '2026-06',
    maxOutput: 128_000,
    releasedAt: '2026-09-03',
    // Adaptive thinking is always on and cannot be disabled (400 on `thinking.type: disabled`),
    // so the `enableAdaptiveThinking` toggle from Fable 5 is intentionally omitted.
    // https://platform.claude.com/docs/en/models/fable-5-1/migration-guide
    settings: {
      disabledParams: ['temperature', 'top_p'],
      extendParams: ['disableContextCaching', 'opus47Effort'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
];
