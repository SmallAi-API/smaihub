/* eslint-disable eslint-core/no-restricted-syntax -- Preserve existing Chinese model descriptions. */
import type { AIChatModelCard } from '../../../types/aiModel';

export const legacyXaiChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 256_000,
    description:
      'Grok 最新最强大的旗舰模型，在自然语言处理、数学计算和推理方面表现卓越，是一款完美的全能型选手。',
    displayName: 'Grok 4.2 Beta',
    id: 'grok-4.20-beta-0309-reasoning',
    releasedAt: '2025-11-18',
    settings: {
      // reasoning_effort is not supported by grok-4. Specifying reasoning_effort parameter will get an error response.
      // extendParams: ['reasoningEffort'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 256_000,
    description:
      'Grok 最新最强大的旗舰模型，在自然语言处理、数学计算和推理方面表现卓越，是一款完美的全能型选手。',
    displayName: 'Grok 4.1',
    id: 'grok-4.1',
    releasedAt: '2025-11-18',
    settings: {
      // reasoning_effort is not supported by grok-4. Specifying reasoning_effort parameter will get an error response.
      // extendParams: ['reasoningEffort'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 256_000,
    description: 'Grok 前沿多模态模型，专门针对高性能代理工具调用进行优化。',
    displayName: 'Grok 4.1 Fast',
    id: 'grok-4-1-fast-non-reasoning',
    releasedAt: '2025-11-18',
    settings: {
      // reasoning_effort is not supported by grok-4. Specifying reasoning_effort parameter will get an error response.
      // extendParams: ['reasoningEffort'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 256_000,
    description: 'Grok 前沿多模态模型，专门针对高性能代理工具调用进行优化。',
    displayName: 'Grok 4.1 Fast Thinking',
    id: 'grok-4-1-fast-reasoning',
    releasedAt: '2025-11-18',
    settings: {
      // reasoning_effort is not supported by grok-4. Specifying reasoning_effort parameter will get an error response.
      // extendParams: ['reasoningEffort'],
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
    contextWindowTokens: 256_000,
    description:
      '我们最新最强大的旗舰模型，在自然语言处理、数学计算和推理方面表现卓越 —— 是一款完美的全能型选手。',
    displayName: 'Grok 4',
    id: 'grok-4-0709',
    releasedAt: '2025-07-09',
    settings: {
      // reasoning_effort is not supported by grok-4. Specifying reasoning_effort parameter will get an error response.
      // extendParams: ['reasoningEffort'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
];
