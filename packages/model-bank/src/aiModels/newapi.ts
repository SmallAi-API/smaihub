/* eslint-disable no-restricted-syntax */
import { type ModelParamsSchema } from '../standard-parameters';
import type {
  AIASRModelCard,
  AIChatModelCard,
  AIEmbeddingModelCard,
  AIImageModelCard,
  AIRealtimeModelCard,
  AITTSModelCard,
} from '../types/aiModel';

// NewAPI Router Provider - 聚合多个 AI 服务
// 模型通过动态获取，不预定义具体模型
export const gptImage1ParamsSchema: ModelParamsSchema = {
  imageUrls: { default: [] },
  prompt: { default: '' },
  size: {
    default: 'auto',
    enum: ['auto', '1024x1024', '1536x1024', '1024x1536'],
  },
};
export const NANO_BANANA_ASPECT_RATIOS = [
  'auto',
  '1:1', // 1024x1024 / 2048x2048 / 4096x4096
  '2:3', // 848x1264 / 1696x2528 / 3392x5056
  '3:2', // 1264x848 / 2528x1696 / 5056x3392
  '3:4', // 896x1200 / 1792x2400 / 3584x4800
  '4:3', // 1200x896 / 2400x1792 / 4800x3584
  '4:5', // 928x1152 / 1856x2304 / 3712x4608
  '5:4', // 1152x928 / 2304x1856 / 4608x3712
  '9:16', // 768x1376 / 1536x2752 / 3072x5504
  '16:9', // 1376x768 / 2752x1536 / 5504x3072
  '21:9', // 1584x672 / 3168x1344 / 6336x2688
];

export const NANO_BANANA_2_ASPECT_RATIOS = [
  ...NANO_BANANA_ASPECT_RATIOS,
  '1:4',
  '4:1',
  '1:8',
  '8:1',
];

export const nanoBananaProParameters: ModelParamsSchema = {
  aspectRatio: {
    default: 'auto',
    enum: NANO_BANANA_ASPECT_RATIOS,
  },
  imageUrls: {
    default: [],
  },
  prompt: { default: '' },
  resolution: {
    default: '1K',
    enum: ['1K', '2K', '4K'],
  },
};

export const nanoBanana2Parameters: ModelParamsSchema = {
  aspectRatio: {
    default: 'auto',
    enum: NANO_BANANA_2_ASPECT_RATIOS,
  },
  imageUrls: {
    default: [],
  },
  prompt: { default: '' },
  resolution: {
    default: '1K',
    enum: ['512', '1K', '2K', '4K'],
  },
};

export const qwenImageParamsSchema: ModelParamsSchema = {
  cfg: { default: 2.5, max: 20, min: 0, step: 0.1 },
  // 实测 fal 宽高 最大就支持到 1536
  // 默认值取自 https://chat.qwen.ai/ 官网的默认值
  height: { default: 1328, max: 1536, min: 512, step: 1 },
  prompt: { default: '' },
  seed: { default: null },
  steps: { default: 30, max: 50, min: 2, step: 1 },
  width: { default: 1328, max: 1536, min: 512, step: 1 },
};

const newapiChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 1_050_000,
    description:
      'GPT-5.4 is the frontier model for complex professional work with highest reasoning capability.',
    displayName: 'GPT-5.4',
    enabled: true,
    id: 'gpt-5.4',
    maxOutput: 128_000,
    releasedAt: '2026-03-05',
    settings: {
      extendParams: ['gpt5_2ReasoningEffort', 'textVerbosity'],
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
    contextWindowTokens: 400_000,
    description:
      'GPT-5.4 mini 在同类模型中展现出了强劲的端到端性能。在我们的评估中，它在多项输出任务和引文召回 (citation recall) 上的表现超越了 Claude Haiku 4.5 或与其持平，且成本大幅降低。此外，它的端对端通过率 (pass rate) 高于体量更大的 GPT-5.4 模型，来源溯源 (source attribution) 能力也更强。',
    displayName: 'GPT-5.4 Mini',
    enabled: true,
    id: 'gpt-5.4-mini',
    maxOutput: 128_000,
    releasedAt: '2026-03-18',
    settings: {
      extendParams: ['gpt5_2ReasoningEffort', 'textVerbosity'],
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
    contextWindowTokens: 400_000,
    description:
      'GPT-5.4 nano 专为对速度和成本要求极高的任务而设计，例如分类、数据提取、排序和子代理。',
    displayName: 'GPT-5.4 Nano',
    enabled: true,
    id: 'gpt-5.4-nano',
    maxOutput: 128_000,
    releasedAt: '2026-03-18',
    settings: {
      extendParams: ['gpt5_2ReasoningEffort', 'textVerbosity'],
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
    contextWindowTokens: 400_000,
    description:
      'GPT-5.3 Codex — 专为更深入的工作而打造，帮助用户以更高的完成度处理复杂任务，擅长编码、长文档总结、回答上传文件相关问题、逐步推导数学与逻辑问题，以及通过更清晰的结构和更有用的细节支持规划与决策。',
    displayName: 'GPT-5.3 Codex',
    enabled: true,
    id: 'gpt-5.3-codex',
    maxOutput: 128_000,
    releasedAt: '2026-02-06',
    settings: {
      extendParams: ['gpt5_2ReasoningEffort', 'textVerbosity'],
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
    contextWindowTokens: 400_000,
    description:
      'GPT-5.2 — 专为更深入的工作而打造，帮助用户以更高的完成度处理复杂任务，擅长编码、长文档总结、回答上传文件相关问题、逐步推导数学与逻辑问题，以及通过更清晰的结构和更有用的细节支持规划与决策。',
    displayName: 'GPT-5.2',
    enabled: true,
    id: 'gpt-5.2',
    maxOutput: 128_000,
    releasedAt: '2025-12-12',
    settings: {
      extendParams: ['gpt5_2ReasoningEffort', 'textVerbosity'],
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
    contextWindowTokens: 400_000,
    description:
      'GPT-5.2 Pro— 专为更深入的工作而打造，帮助用户以更高的完成度处理复杂任务，擅长编码、长文档总结、回答上传文件相关问题、逐步推导数学与逻辑问题，以及通过更清晰的结构和更有用的细节支持规划与决策。',
    displayName: 'GPT-5.2 Pro',
    enabled: true,
    id: 'gpt-5.2-pro',
    maxOutput: 128_000,
    releasedAt: '2025-12-18',
    settings: {
      extendParams: ['gpt5_2ReasoningEffort', 'textVerbosity'],
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
    contextWindowTokens: 400_000,
    description:
      'GPT-5.2 Chat — 专为更深入的工作而打造，帮助用户以更高的完成度处理复杂任务，擅长编码、长文档总结、回答上传文件相关问题、逐步推导数学与逻辑问题，以及通过更清晰的结构和更有用的细节支持规划与决策。',
    displayName: 'GPT-5.2 Chat',
    enabled: true,
    id: 'gpt-5.2-chat-latest',
    maxOutput: 128_000,
    releasedAt: '2025-12-12',
    settings: {
      extendParams: ['gpt5_2ReasoningEffort', 'textVerbosity'],
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
    contextWindowTokens: 400_000,
    description:
      'GPT-5.1 — 针对编码和 agent 任务优化的旗舰模型，支持可配置的推理强度与更长上下文。',
    displayName: 'GPT-5.1',
    enabled: true,
    id: 'gpt-5.1',
    maxOutput: 128_000,
    releasedAt: '2025-11-13',
    settings: {
      extendParams: ['gpt5_1ReasoningEffort', 'textVerbosity'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 400_000,
    description:
      'GPT-5.1 Codex：针对 agentic 编码任务优化的 GPT-5.1 版本，可在 Responses API 中用于更复杂的代码/代理工作流',
    displayName: 'GPT-5.1 Codex',
    enabled: true,
    id: 'gpt-5.1-codex',
    maxOutput: 128_000,
    releasedAt: '2025-11-13',
    settings: {
      extendParams: ['gpt5_1ReasoningEffort'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 400_000,
    description:
      'GPT-5.1 — 针对编码和 agent 任务优化的旗舰模型，支持可配置的推理强度与更长上下文。',
    displayName: 'GPT-5.1 Chat',
    enabled: true,
    id: 'gpt-5.1-chat-latest',
    maxOutput: 128_000,
    releasedAt: '2025-11-13',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 400_000,
    description:
      'GPT-5.1 Codex High：针对 agentic 编码任务优化的 GPT-5.1 版本，可在 Responses API 中用于更复杂的代码/代理工作流',
    displayName: 'GPT-5.1 Codex High',
    enabled: true,
    id: 'gpt-5.1-codex-high',
    maxOutput: 128_000,
    releasedAt: '2025-11-13',
    settings: {
      extendParams: ['gpt5_1ReasoningEffort'],
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
    contextWindowTokens: 400_000,
    description:
      '跨领域编码和代理任务的最佳模型。GPT-5 在准确性、速度、推理、上下文识别、结构化思维和问题解决方面实现了飞跃。',
    displayName: 'GPT-5',
    enabled: true,
    id: 'gpt-5',
    maxOutput: 128_000,
    releasedAt: '2025-08-07',
    settings: {
      extendParams: ['gpt5ReasoningEffort', 'textVerbosity'],
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
    contextWindowTokens: 400_000,
    description: 'GPT-5 pro 使用更多计算来更深入地思考，并持续提供更好的答案。',
    displayName: 'GPT-5 pro',

    id: 'gpt-5-pro',
    maxOutput: 272_000,
    releasedAt: '2025-10-06',
    settings: {
      extendParams: ['textVerbosity'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 400_000,
    description:
      'ChatGPT 中使用的 GPT-5 模型。结合了强大的语言理解与生成能力，适合对话式交互应用。',
    displayName: 'GPT-5 Chat',

    id: 'gpt-5-chat-latest',
    maxOutput: 128_000,
    releasedAt: '2025-08-07',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 400_000,
    description:
      '跨领域编码和代理任务的最佳模型。GPT-5 在准确性、速度、推理、上下文识别、结构化思维和问题解决方面实现了飞跃。',
    displayName: 'GPT-5 Codex',

    id: 'gpt-5-codex',
    maxOutput: 128_000,
    releasedAt: '2025-08-07',
    settings: {
      extendParams: ['gpt5ReasoningEffort'],
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
    contextWindowTokens: 400_000,
    description:
      '跨领域编码和代理任务的最佳模型。GPT-5 在准确性、速度、推理、上下文识别、结构化思维和问题解决方面实现了飞跃。',
    displayName: 'GPT-5 Codex High',

    id: 'gpt-5-codex-high',
    maxOutput: 128_000,
    releasedAt: '2025-08-07',
    settings: {
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
    contextWindowTokens: 400_000,
    description:
      '跨领域编码和代理任务的最佳模型。GPT-5 在准确性、速度、推理、上下文识别、结构化思维和问题解决方面实现了飞跃。',
    displayName: 'GPT-5 Codex Medium',

    id: 'gpt-5-codex-medium',
    maxOutput: 128_000,
    releasedAt: '2025-08-07',
    settings: {
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
    contextWindowTokens: 400_000,
    description:
      '跨领域编码和代理任务的最佳模型。GPT-5 在准确性、速度、推理、上下文识别、结构化思维和问题解决方面实现了飞跃。',
    displayName: 'GPT-5 Codex Low',

    id: 'gpt-5-codex-low',
    maxOutput: 128_000,
    releasedAt: '2025-08-07',
    settings: {
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
    contextWindowTokens: 400_000,
    description:
      '更快、更经济高效的 GPT-5 版本，适用于明确定义的任务。在保持高质量输出的同时，提供更快的响应速度。',
    displayName: 'GPT-5 mini',
    enabled: true,
    id: 'gpt-5-mini',
    maxOutput: 128_000,
    releasedAt: '2025-08-07',
    settings: {
      extendParams: ['gpt5ReasoningEffort', 'textVerbosity'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 400_000,
    description: '最快、最经济高效的 GPT-5 版本。非常适合需要快速响应且成本敏感的应用场景。',
    displayName: 'GPT-5 nano',
    id: 'gpt-5-nano',
    maxOutput: 128_000,
    releasedAt: '2025-08-07',
    settings: {
      extendParams: ['gpt5ReasoningEffort', 'textVerbosity'],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 64_000,
    description: 'OpenAi 最新的生成视频模型，自带环境音效，对白同步！',
    displayName: 'Sora 2',
    enabled: true,
    id: 'sora-2-all',
    maxOutput: 64_000,
    releasedAt: '2025-10-12',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 64_000,
    description: 'OpenAi 最新的生成视频模型，自带环境音效，对白同步！',
    displayName: 'Sora 2 Pro',
    enabled: true,
    id: 'sora-2-pro-all',
    maxOutput: 64_000,
    releasedAt: '2025-10-12',
    type: 'chat',
  },
  {
    contextWindowTokens: 64_000,
    description: 'OpenAi 实时语音通话，与GPT4进行在线打电话。',
    displayName: 'GPT 实时语音对话',
    enabled: true,
    id: 'advanced-voice',
    maxOutput: 64_000,
    releasedAt: '2025-10-20',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'o4-mini 是我们最新的小型 o 系列模型。 它专为快速有效的推理而优化，在编码和视觉任务中表现出极高的效率和性能。',
    displayName: 'o4-mini',

    id: 'o4-mini',
    maxOutput: 100_000,
    releasedAt: '2025-04-17',
    settings: {
      extendParams: ['reasoningEffort'],
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
    contextWindowTokens: 200_000,
    description:
      'o4-mini-deep-research 是我们更快速、更实惠的深度研究模型——非常适合处理复杂的多步骤研究任务。它可以从互联网上搜索和综合信息，也可以通过 MCP 连接器访问并利用你的自有数据。',
    displayName: 'o4-mini Deep Research',

    id: 'o4-mini-deep-research',
    maxOutput: 100_000,
    releasedAt: '2025-06-26',
    settings: {
      extendParams: ['reasoningEffort'],
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
    contextWindowTokens: 200_000,
    description:
      'o3-pro 模型使用更多的计算来更深入地思考并始终提供更好的答案，仅支持 Responses API 下使用。',
    displayName: 'o3-pro',
    id: 'o3-pro',
    maxOutput: 100_000,
    releasedAt: '2025-06-10',
    settings: {
      extendParams: ['reasoningEffort'],
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
    contextWindowTokens: 200_000,
    description:
      'o3 是一款全能强大的模型，在多个领域表现出色。它为数学、科学、编程和视觉推理任务树立了新标杆。它也擅长技术写作和指令遵循。用户可利用它分析文本、代码和图像，解决多步骤的复杂问题。',
    displayName: 'o3',

    id: 'o3',
    maxOutput: 100_000,
    releasedAt: '2025-04-16',
    settings: {
      extendParams: ['reasoningEffort'],
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
    contextWindowTokens: 200_000,
    description:
      'o3-deep-research 是我们最先进的深度研究模型，专为处理复杂的多步骤研究任务而设计。它可以从互联网上搜索和综合信息，也可以通过 MCP 连接器访问并利用你的自有数据。',
    displayName: 'o3 Deep Research',
    id: 'o3-deep-research',
    maxOutput: 100_000,
    releasedAt: '2025-06-26',
    settings: {
      extendParams: ['reasoningEffort'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 200_000,
    description:
      'o3-mini 是我们最新的小型推理模型，在与 o1-mini 相同的成本和延迟目标下提供高智能。',
    displayName: 'o3-mini',

    id: 'o3-mini',
    maxOutput: 100_000,
    releasedAt: '2025-01-31',
    settings: {
      extendParams: ['reasoningEffort'],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 128_000,
    description:
      'o1-mini是一款针对编程、数学和科学应用场景而设计的快速、经济高效的推理模型。该模型具有128K上下文和2023年10月的知识截止日期。',
    displayName: 'o1-mini',

    id: 'o1-mini', // deprecated on 2025-10-27
    maxOutput: 65_536,
    releasedAt: '2024-09-12',
    settings: {
      extendParams: ['reasoningEffort'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'o1是OpenAI新的推理模型，支持图文输入并输出文本，适用于需要广泛通用知识的复杂任务。该模型具有200K上下文和2023年10月的知识截止日期。',
    displayName: 'o1',
    id: 'o1',
    maxOutput: 100_000,
    releasedAt: '2024-12-17',
    settings: {
      extendParams: ['reasoningEffort'],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 128_000,
    description:
      'o1是OpenAI新的推理模型，适用于需要广泛通用知识的复杂任务。该模型具有128K上下文和2023年10月的知识截止日期。',
    displayName: 'o1-preview',
    id: 'o1-preview',
    maxOutput: 32_768,
    releasedAt: '2024-09-12',
    settings: {
      extendParams: ['reasoningEffort'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description: 'GPT-4.1 是我们用于复杂任务的旗舰模型。它非常适合跨领域解决问题。',
    displayName: 'GPT-4.1',

    id: 'gpt-4.1',
    maxOutput: 32_768,
    releasedAt: '2025-04-14',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description:
      'GPT-4.1 mini 提供了智能、速度和成本之间的平衡，使其成为许多用例中有吸引力的模型。',
    displayName: 'GPT-4.1 mini',

    id: 'gpt-4.1-mini',
    maxOutput: 32_768,
    releasedAt: '2025-04-14',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description: 'GPT-4.1 nano 是最快，最具成本效益的GPT-4.1模型。',
    displayName: 'GPT-4.1 nano',

    id: 'gpt-4.1-nano',
    maxOutput: 32_768,
    releasedAt: '2025-04-14',
    type: 'chat',
  },

  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'GPT-4o mini是OpenAI在GPT-4 Omni之后推出的最新模型，支持图文输入并输出文本。作为他们最先进的小型模型，它比其他近期的前沿模型便宜很多，并且比GPT-3.5 Turbo便宜超过60%。它保持了最先进的智能，同时具有显著的性价比。GPT-4o mini在MMLU测试中获得了 82% 的得分，目前在聊天偏好上排名高于 GPT-4。',
    displayName: 'GPT-4o mini',

    id: 'gpt-4o-mini',
    maxOutput: 16_384,
    releasedAt: '2024-07-18',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      search: true,
    },
    contextWindowTokens: 128_000,
    description:
      'GPT-4o mini 搜索预览版是一个专门训练用于理解和执行网页搜索查询的模型，使用的是 Chat Completions API。除了令牌费用之外，网页搜索查询还会按每次工具调用收取费用。',
    displayName: 'GPT-4o mini Search Preview',
    id: 'gpt-4o-mini-search-preview',
    maxOutput: 16_384,
    releasedAt: '2025-03-11',
    settings: {
      searchImpl: 'internal',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      //search: true,
    },
    contextWindowTokens: 128_000,
    description: 'GPT-4o mini Audio 模型，支持音频输入输出',
    displayName: 'GPT-4o mini Audio',
    id: 'gpt-4o-mini-audio-preview',
    maxOutput: 16_384,
    releasedAt: '2024-12-17',
    /*
    settings: {
      searchImpl: 'params',
    },
    */
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description: 'gpt-audio-mini 模型，支持音频输入输出',
    displayName: 'GPT Audio Mini',
    id: 'gpt-audio-mini',
    maxOutput: 16_384,
    releasedAt: '2025-10-12',
    /*
    settings: {
      searchImpl: 'params',
    },
    */
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
    displayName: 'GPT-4o',
    enabled: true,
    id: 'gpt-4o',
    releasedAt: '2024-05-13',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      search: true,
    },
    contextWindowTokens: 128_000,
    description:
      'GPT-4o 搜索预览版是一个专门训练用于理解和执行网页搜索查询的模型，使用的是 Chat Completions API。除了令牌费用之外，网页搜索查询还会按每次工具调用收取费用。',
    displayName: 'GPT-4o Search Preview',
    id: 'gpt-4o-search-preview',
    maxOutput: 16_384,
    releasedAt: '2025-03-11',
    settings: {
      searchImpl: 'internal',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
    displayName: 'GPT-4o 1120',
    id: 'gpt-4o-2024-11-20',
    releasedAt: '2024-11-20',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
    displayName: 'GPT-4o 0513',
    id: 'gpt-4o-2024-05-13',
    releasedAt: '2024-05-13',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      //search: true,
    },
    contextWindowTokens: 128_000,
    description: 'GPT-4o Audio 模型，支持音频输入输出',
    displayName: 'GPT-4o Audio',
    id: 'gpt-4o-audio-preview',
    maxOutput: 16_384,
    releasedAt: '2024-12-17',
    /*
    settings: {
      searchImpl: 'params',
    },
    */
    type: 'chat',
  },

  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 16_384,
    description:
      'GPT 3.5 Turbo，适用于各种文本生成和理解任务，Currently points to gpt-3.5-turbo-0125',
    displayName: 'GPT-3.5 Turbo',
    id: 'gpt-3.5-turbo',
    releasedAt: '2024-12-17',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 16_384,
    description:
      'GPT 3.5 Turbo，适用于各种文本生成和理解任务，Currently points to gpt-3.5-turbo-0125',
    displayName: 'GPT-3.5 Turbo 0125',
    id: 'gpt-3.5-turbo-0125',
    releasedAt: '2024-01-25',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 16_384,
    description:
      'GPT 3.5 Turbo，适用于各种文本生成和理解任务，Currently points to gpt-3.5-turbo-0125',
    displayName: 'GPT-3.5 Turbo 1106',
    id: 'gpt-3.5-turbo-1106',
    releasedAt: '2023-11-06',
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description: 'GPT 3.5 Turbo，适用于各种文本生成和理解任务，对指令遵循的优化',
    displayName: 'GPT-3.5 Turbo Instruct',
    id: 'gpt-3.5-turbo-instruct',
    releasedAt: '2024-12-17',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'GPT-OSS 120B 是一款拥有 1200 亿参数的顶尖语言模型，内置浏览器搜索和代码执行功能，并具备推理能力。',
    displayName: 'GPT OSS 120B',
    id: 'gpt-oss-120b',
    releasedAt: '2025-08-06',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'GPT-OSS 20B 是一款拥有 200 亿参数的顶尖语言模型，内置浏览器搜索和代码执行功能，并具备推理能力。',
    displayName: 'GPT OSS 20B',
    id: 'gpt-oss-20b',
    releasedAt: '2025-08-06',
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
    contextWindowTokens: 200_000,
    description:
      'Claude Opus 4.6 is Anthropic’s most intelligent model for building agents and coding.',
    displayName: 'Claude Opus 4.6',
    enabled: true,
    id: 'claude-opus-4-6',
    maxOutput: 128_000,
    releasedAt: '2026-02-24',
    settings: {
      extendParams: ['disableContextCaching', 'enableAdaptiveThinking', 'effort'],
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
    contextWindowTokens: 200_000,
    description: 'Claude Sonnet 4.6 is Anthropic’s best combination of speed and intelligence.',
    displayName: 'Claude Sonnet 4.6',
    enabled: true,
    id: 'claude-sonnet-4-6',
    maxOutput: 64_000,
    releasedAt: '2026-02-24',
    settings: {
      extendParams: [
        'disableContextCaching',
        'enableAdaptiveThinking',
        'enableReasoning',
        'reasoningBudgetToken',
        'effort',
      ],
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
    contextWindowTokens: 200_000,
    description:
      'Claude Opus 4.5 是 Anthropic 的旗舰模型，结合了卓越的智能与可扩展性能，适合需要最高质量回应和推理能力的复杂任务。',
    displayName: 'Claude Opus 4.5',
    id: 'claude-opus-4-5-20251101',
    maxOutput: 64_000,
    releasedAt: '2025-11-24',
    settings: {
      extendParams: ['disableContextCaching', 'enableReasoning', 'reasoningBudgetToken'],
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
    contextWindowTokens: 200_000,
    description:
      'Claude Opus 4.5 是 Anthropic 的旗舰模型，结合了卓越的智能与可扩展性能，适合需要最高质量回应和推理能力的复杂任务。',
    displayName: 'Claude Opus 4.5 Thinking',
    id: 'claude-opus-4-5-20251101-thinking',
    maxOutput: 64_000,
    releasedAt: '2025-11-24',
    settings: {
      extendParams: ['disableContextCaching', 'enableReasoning', 'reasoningBudgetToken'],
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
    contextWindowTokens: 200_000,
    description: 'Claude Sonnet 4.5 是 Anthropic 迄今为止最智能的模型。',
    displayName: 'Claude Sonnet 4.5',
    id: 'claude-sonnet-4-5-20250929',
    maxOutput: 64_000,
    releasedAt: '2025-09-30',
    settings: {
      extendParams: ['disableContextCaching', 'enableReasoning', 'reasoningBudgetToken'],
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
    contextWindowTokens: 200_000,
    description: 'Claude Sonnet 4.5 是 Anthropic 迄今为止最智能的模型。',
    displayName: 'Claude Sonnet 4.5 Thinking',
    id: 'claude-sonnet-4-5-20250929-thinking',
    maxOutput: 64_000,
    releasedAt: '2025-09-30',
    settings: {
      extendParams: ['disableContextCaching', 'enableReasoning', 'reasoningBudgetToken'],
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
    contextWindowTokens: 200_000,
    description:
      'Claude Haiku 4.5 是 Anthropic 最快且最智能的 Haiku 模型，具有闪电般的速度和扩展思考能力。',
    displayName: 'Claude Haiku 4.5',
    enabled: true,
    id: 'claude-haiku-4-5-20251001',
    maxOutput: 64_000,
    releasedAt: '2025-10-16',
    settings: {
      extendParams: ['disableContextCaching', 'enableReasoning', 'reasoningBudgetToken'],
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
    contextWindowTokens: 200_000,
    description:
      'Claude Opus 4.1 是 Anthropic 最新的用于处理高度复杂任务的最强大模型。它在性能、智能、流畅性和理解力方面表现卓越。',
    displayName: 'Claude Opus 4.1',

    id: 'claude-opus-4-1-20250805',
    maxOutput: 32_000,
    releasedAt: '2025-08-05',
    settings: {
      extendParams: ['disableContextCaching', 'enableReasoning', 'reasoningBudgetToken'],
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
    contextWindowTokens: 200_000,
    description:
      'Claude Opus 4 是 Anthropic 用于处理高度复杂任务的最强大模型。它在性能、智能、流畅性和理解力方面表现卓越。',
    displayName: 'Claude Opus 4',

    id: 'claude-opus-4-20250514',
    maxOutput: 32_000,
    releasedAt: '2025-05-23',
    settings: {
      extendParams: ['disableContextCaching', 'enableReasoning', 'reasoningBudgetToken'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude Sonnet 4 可以产生近乎即时的响应或延长的逐步思考，用户可以清晰地看到这些过程。API 用户还可以对模型思考的时间进行细致的控制',
    displayName: 'Claude Sonnet 4',

    id: 'claude-sonnet-4-20250514',
    maxOutput: 64_000,
    releasedAt: '2025-05-23',
    settings: {
      extendParams: ['disableContextCaching', 'enableReasoning', 'reasoningBudgetToken'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3.7 Sonnet 是 Anthropic 迄今为止最智能的模型，也是市场上首个混合推理模型。Claude 3.7 Sonnet 可以产生近乎即时的响应或延长的逐步思考，用户可以清晰地看到这些过程。Sonnet 特别擅长编程、数据科学、视觉处理、代理任务。',
    displayName: 'Claude 3.7 Sonnet',

    id: 'claude-3-7-sonnet-20250219',
    maxOutput: 64_000,
    releasedAt: '2025-02-24',
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3.5 Sonnet 提供了超越 Opus 的能力和比 Sonnet 更快的速度，同时保持与 Sonnet 相同的价格。Sonnet 特别擅长编程、数据科学、视觉处理、代理任务。',
    displayName: 'Claude 3.5 Sonnet ',
    id: 'claude-3-5-sonnet-20241022',
    maxOutput: 8192,
    releasedAt: '2024-10-22',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3.5 Sonnet 提供了超越 Opus 的能力和比 Sonnet 更快的速度，同时保持与 Sonnet 相同的价格。Sonnet 特别擅长编程、数据科学、视觉处理、代理任务。',
    displayName: 'Claude 3.5 Sonnet',
    id: 'claude-3-5-sonnet-20240620',
    maxOutput: 8192,
    releasedAt: '2024-06-20',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3.5 Haiku 是 Anthropic 最快的下一代模型。与 Claude 3 Haiku 相比，Claude 3.5 Haiku 在各项技能上都有所提升，并在许多智力基准测试中超越了上一代最大的模型 Claude 3 Opus。',
    displayName: 'Claude 3.5 Haiku',
    enabled: true,
    id: 'claude-3-5-haiku-20241022',
    maxOutput: 8192,
    releasedAt: '2024-11-19',
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
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 3.1 Pro Preview provides better thinking, improved token efficiency, and a reliable experience optimized for software engineering behavior.',
    displayName: 'Gemini 3.1 Pro Preview',
    enabled: true,
    id: 'gemini-3.1-pro-preview',
    maxOutput: 65_536,
    releasedAt: '2026-02-24',
    settings: {
      extendParams: ['thinkingLevel3', 'urlContext'],
      searchImpl: 'params',
      searchProvider: 'google',
    },
    type: 'chat',
  },
  {
    abilities: {
      imageOutput: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 131_072 + 32_768,
    description:
      'Gemini 3.1 Flash Image (Nano Banana 2) delivers Pro-level image quality at Flash speed with multimodal chat support.',
    displayName: 'Nano Banana 2',
    enabled: true,
    id: 'gemini-3.1-flash-image-preview',
    maxOutput: 32_768,
    releasedAt: '2026-02-27',
    settings: {
      extendParams: ['imageAspectRatio', 'imageResolution2', 'thinkingLevel4'],
      searchImpl: 'params',
      searchProvider: 'google',
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
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 3 Pro 是 全球最佳的多模态理解模型，也是 Google 迄今为止最强大的智能体和氛围编程模型，提供更丰富的视觉效果和更深层次的交互性，所有这些都建立在最先进的推理能力基础之上。',
    displayName: 'Gemini 3.0 Pro Preview',
    id: 'gemini-3-pro-preview',
    maxOutput: 65_536,
    releasedAt: '2025-11-19',
    settings: {
      extendParams: ['thinkingLevel', 'urlContext'],
      searchImpl: 'params',
      searchProvider: 'google',
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
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 3 Pro 是 全球最佳的多模态理解模型，也是 Google 迄今为止最强大的智能体和氛围编程模型，提供更丰富的视觉效果和更深层次的交互性，所有这些都建立在最先进的推理能力基础之上。',
    displayName: 'Gemini 3.0 Pro Preview Thinking',
    id: 'gemini-3-pro-preview-thinking',
    maxOutput: 65_536,
    releasedAt: '2025-11-19',
    settings: {
      extendParams: ['thinkingLevel', 'urlContext'],
      searchImpl: 'params',
      searchProvider: 'google',
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
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 3 Pro 是全球最佳的多模态理解模型，也是 Google 迄今为止最强大的智能体和氛围编程模型，提供更丰富的视觉效果和更深层次的交互性，所有这些都建立在最先进的推理能力基础之上。',
    displayName: 'Gemini 3.0 Flash Preview',
    enabled: true,
    id: 'gemini-3-flash-preview',
    maxOutput: 65_536,
    releasedAt: '2025-12-18',
    settings: {
      extendParams: ['thinkingLevel', 'urlContext'],
      searchImpl: 'params',
      searchProvider: 'google',
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
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 3 Pro 是全球最佳的多模态理解模型，也是 Google 迄今为止最强大的智能体和氛围编程模型，提供更丰富的视觉效果和更深层次的交互性，所有这些都建立在最先进的推理能力基础之上。',
    displayName: 'Gemini 3.0 Flash Preview Thinking',
    id: 'gemini-3-flash-preview-thinking',
    maxOutput: 65_536,
    releasedAt: '2025-12-18',
    settings: {
      extendParams: ['thinkingLevel', 'urlContext'],
      searchImpl: 'params',
      searchProvider: 'google',
    },
    type: 'chat',
  },
  {
    abilities: {
      imageOutput: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 131_072 + 32_768,
    description:
      'Gemini 3 Pro Image（Nano Banana Pro）是 Google 的图像生成模型，同时支持多模态对话。',
    displayName: '🍌 Nano Banana Pro',
    id: 'nano-banana-pro-preview',
    maxOutput: 32_768,
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
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 2.5 Pro 是 Google 最先进的思维模型，能够对代码、数学和STEM领域的复杂问题进行推理，以及使用长上下文分析大型数据集、代码库和文档。',
    displayName: 'Gemini 2.5 Pro',
    enabled: true,
    id: 'gemini-2.5-pro',
    maxOutput: 65_536,
    releasedAt: '2025-06-17',
    settings: {
      extendParams: ['thinkingBudget', 'urlContext'],
      searchImpl: 'params',
      searchProvider: 'google',
    },
    type: 'chat',
  },

  {
    abilities: {
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'gemini-2.5-pro-deepsearch 是 Google 最先进的思维模型，能够对代码、数学和STEM领域的复杂问题进行推理，以及使用长上下文分析大型数据集、代码库和文档。',
    displayName: 'Gemini 2.5 Pro Deepsearch',
    enabled: true,
    id: 'gemini-2.5-pro-deepsearch',
    maxOutput: 65_536,
    releasedAt: '2025-06-17',
    settings: {
      extendParams: ['thinkingBudget'],
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
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 2.5 Pro Preview 是 Google 最先进的思维模型，能够对代码、数学和STEM领域的复杂问题进行推理，以及使用长上下文分析大型数据集、代码库和文档。',
    displayName: 'Gemini 2.5 Pro Preview 06-05',
    enabled: true,
    id: 'gemini-2.5-pro-preview-06-05',
    maxOutput: 65_536,
    releasedAt: '2025-05-06',
    settings: {
      extendParams: ['thinkingBudget', 'urlContext'],
      searchImpl: 'params',
      searchProvider: 'google',
    },
    type: 'chat',
  },
  {
    abilities: {
      imageOutput: true,
      vision: true,
    },
    contextWindowTokens: 32_768 + 8192,
    description:
      'Nano Banana 是 Google 最新、最快、最高效的原生多模态模型，它允许您通过对话生成和编辑图像。',
    displayName: 'Nano Banana',
    enabled: true,
    id: 'gemini-2.5-flash-image',
    maxOutput: 8192,

    releasedAt: '2025-08-26',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 2.5 Pro Preview 是 Google 最先进的思维模型，能够对代码、数学和STEM领域的复杂问题进行推理，以及使用长上下文分析大型数据集、代码库和文档。',
    displayName: 'Gemini 2.5 Pro Preview 06-05 Thinking',
    enabled: true,
    id: 'gemini-2.5-pro-preview-06-05-thinking',
    maxOutput: 65_536,
    releasedAt: '2025-05-06',
    settings: {
      extendParams: ['thinkingBudget', 'urlContext'],
      searchImpl: 'params',
      searchProvider: 'google',
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
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 2.5 Pro Preview 是 Google 最先进的思维模型，能够对代码、数学和STEM领域的复杂问题进行推理，以及使用长上下文分析大型数据集、代码库和文档。',
    displayName: 'Gemini 2.5 Pro Preview 05-06',
    enabled: true,
    id: 'gemini-2.5-pro-preview-05-06',
    maxOutput: 65_536,
    releasedAt: '2025-05-06',
    settings: {
      extendParams: ['thinkingBudget'],
    },
    type: 'chat',
  },
  {
    abilities: {
      imageOutput: true,
      vision: true,
    },
    contextWindowTokens: 32_768 + 8192,
    description:
      'Gemini 2.5 Flash Image Preview 是 Google 最新、最快、最高效的原生多模态模型，它允许您通过对话生成和编辑图像。',
    displayName: 'Gemini 2.5 Flash Image Preview',

    id: 'gemini-2.5-flash-image-preview',
    maxOutput: 8192,
    releasedAt: '2025-08-27',
    type: 'chat',
  },
  {
    abilities: {
      imageOutput: true,
      vision: true,
    },
    contextWindowTokens: 32_768 + 8192,
    description:
      'Gemini 2.5 Flash Image Preview 是 Google 最新、最快、最高效的原生多模态模型，它允许您通过对话生成和编辑图像。',
    displayName: 'Gemini 2.5 Flash Image Preview all',

    id: 'gemini-2.5-flash-image-preview-all',
    maxOutput: 8192,

    releasedAt: '2025-08-27',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description: 'Gemini 2.5 Flash 是 Google 性价比最高的模型，提供全面的功能。',
    displayName: 'Gemini 2.5 Flash',

    id: 'gemini-2.5-flash',
    maxOutput: 65_536,
    releasedAt: '2025-06-17',
    settings: {
      extendParams: ['thinkingBudget'],
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
    contextWindowTokens: 1_048_576 + 65_536,
    description: 'Gemini 2.5 Flash Preview 是 Google 性价比最高的模型，提供全面的功能。',
    displayName: 'Gemini 2.5 Flash Preview 05-20',

    id: 'gemini-2.5-flash-preview-05-20',
    maxOutput: 65_536,
    releasedAt: '2025-05-20',
    settings: {
      extendParams: ['thinkingBudget'],
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
    contextWindowTokens: 1_048_576 + 65_536,
    description: 'Gemini 2.5 Flash-Lite 是 Google 最小、性价比最高的模型，专为大规模使用而设计。',
    displayName: 'Gemini 2.5 Flash-Lite',

    id: 'gemini-2.5-flash-lite',
    maxOutput: 65_536,
    releasedAt: '2025-07-22',
    settings: {
      extendParams: ['thinkingBudget'],
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
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 2.5 Flash-Lite Preview 是 Google 最小、性价比最高的模型，专为大规模使用而设计。',
    displayName: 'Gemini 2.5 Flash-Lite Preview 06-17',

    id: 'gemini-2.5-flash-lite-preview-06-17',
    maxOutput: 65_536,
    releasedAt: '2025-06-11',
    settings: {
      extendParams: ['thinkingBudget'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 8192,
    description:
      'Gemini 2.0 Flash 提供下一代功能和改进，包括卓越的速度、原生工具使用、多模态生成和1M令牌上下文窗口。',
    displayName: 'Gemini 2.0 Flash',

    id: 'gemini-2.0-flash',
    maxOutput: 8192,
    releasedAt: '2025-02-05',
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
    enabled: true,
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
    enabled: true,
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
    enabled: true,
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
    enabled: true,
    id: 'grok-4-0709',
    releasedAt: '2025-07-09',
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
      vision: true,
    },
    contextWindowTokens: 256_000,
    description:
      '我们最新最强大的旗舰模型，在自然语言处理、数学计算和推理方面表现卓越 —— 是一款完美的全能型选手。',
    displayName: 'Grok 4 all',
    enabled: true,
    id: 'grok-4-all',
    releasedAt: '2025-07-09',
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
      vision: true,
    },
    contextWindowTokens: 256_000,
    description:
      '我们最新最强大的旗舰模型，在自然语言处理、数学计算和推理方面表现卓越 —— 是一款完美的全能型选手。',
    displayName: 'Grok 4 vip',
    enabled: true,
    id: 'grok-4-vip',
    releasedAt: '2025-07-09',
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
      vision: true,
    },
    contextWindowTokens: 400_000,
    description:
      '我们最新最强大的旗舰模型，在自然语言处理、数学计算和推理方面表现卓越 —— 是一款完美的全能型选手。',
    displayName: 'Grok 4 Fast Thinking',
    enabled: true,
    id: 'grok-4-fast-reasoning',
    releasedAt: '2025-09-23',
    settings: {
      // reasoning_effort is not supported by grok-4. Specifying reasoning_effort parameter will get an error response.
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 400_000,
    description:
      '我们最新最强大的旗舰模型，在自然语言处理、数学计算和推理方面表现卓越 —— 是一款完美的全能型选手。',
    displayName: 'Grok 4 Fast NoThinking',
    enabled: true,
    id: 'grok-4-fast-non-reasoning',
    releasedAt: '2025-09-23',
    settings: {
      // reasoning_effort is not supported by grok-4. Specifying reasoning_effort parameter will get an error response.
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
    },
    contextWindowTokens: 131_072,
    description:
      '旗舰级模型，擅长数据提取、编程和文本摘要等企业级应用，拥有金融、医疗、法律和科学等领域的深厚知识。',
    displayName: 'Grok 3',
    id: 'grok-3',
    releasedAt: '2025-04-03',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
    },
    contextWindowTokens: 131_072,
    description:
      '旗舰级模型，擅长数据提取、编程和文本摘要等企业级应用，拥有金融、医疗、法律和科学等领域的深厚知识。',
    displayName: 'Grok 3 Fast mode',
    id: 'grok-3-fast',
    releasedAt: '2025-04-03',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
    },
    contextWindowTokens: 131_072,
    description:
      '轻量级模型，回话前会先思考。运行快速、智能，适用于不需要深层领域知识的逻辑任务，并能获取原始的思维轨迹。',
    displayName: 'Grok 3 Mini',
    id: 'grok-3-mini',
    releasedAt: '2025-04-03',
    settings: {
      extendParams: ['reasoningEffort'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
    },
    contextWindowTokens: 131_072,
    description:
      '轻量级模型，回话前会先思考。运行快速、智能，适用于不需要深层领域知识的逻辑任务，并能获取原始的思维轨迹。',
    displayName: 'Grok 3 Mini (Fast mode)',
    id: 'grok-3-mini-fast',
    releasedAt: '2025-04-03',
    settings: {
      extendParams: ['reasoningEffort'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 128_000,
    description:
      '智谱最新旗舰模型，支持思考模式切换，综合能力达到开源模型的 SOTA 水平，上下文长度可达128K。',
    displayName: 'GLM-4.5v',
    enabled: true,
    id: 'glm-4.5v',
    maxOutput: 32_768,
    releasedAt: '2025-08-13',
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
    contextWindowTokens: 128_000,
    description:
      '智谱最新旗舰模型，支持思考模式切换，综合能力达到开源模型的 SOTA 水平，上下文长度可达128K。',
    displayName: 'GLM-4.5',
    enabled: true,
    id: 'glm-4.5',
    maxOutput: 32_768,
    releasedAt: '2025-08-01',
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
    },
    contextWindowTokens: 128_000,
    description: 'GLM-4.5 的轻量版，兼顾性能与性价比，可灵活切换混合思考模型。',
    displayName: 'GLM-4.5-Air',
    enabled: true,
    id: 'glm-4.5-air',
    maxOutput: 32_768,
    releasedAt: '2025-08-01',
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
    contextWindowTokens: 128_000,
    description: 'GLM-4.5 的免费版，推理、代码、智能体等任务表现出色。',
    displayName: 'GLM-4.5-Flash',
    enabled: true,
    id: 'glm-4.5-flash',
    maxOutput: 32_768,
    releasedAt: '2025-08-01',
    settings: {
      extendParams: ['enableReasoning'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 262_144,
    description:
      'kimi-k2-0905-preview 模型上下文长度为 256k，具备更强的 Agentic Coding 能力、更突出的前端代码的美观度和实用性、以及更好的上下文理解能力。',
    displayName: 'Kimi K2 0905',
    enabled: true,
    id: 'kimi-k2-0905-preview',
    releasedAt: '2025-09-05',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 262_144,
    description:
      'kimi-k2 是一款具备超强代码和 Agent 能力的 MoE 架构基础模型，总参数 1T，激活参数 32B。在通用知识推理、编程、数学、Agent 等主要类别的基准性能测试中，K2 模型的性能超过其他主流开源模型。',
    displayName: 'Kimi K2 0905 Turbo',
    enabled: true,
    id: 'kimi-k2-turbo-preview',
    releasedAt: '2025-09-05',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      'kimi-k2 是一款具备超强代码和 Agent 能力的 MoE 架构基础模型，总参数 1T，激活参数 32B。在通用知识推理、编程、数学、Agent 等主要类别的基准性能测试中，K2 模型的性能超过其他主流开源模型。',
    displayName: 'Kimi K2 Instruct',
    enabled: true,
    id: 'moonshotai/Kimi-K2-Instruct',
    maxOutput: 16_384,
    releasedAt: '2025-07-11',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
    },
    config: {
      deploymentName: 'qwen3-max-preview',
    },
    contextWindowTokens: 262_144,
    description:
      '通义千问3系列Max模型Preview版本，相较2.5系列整体通用能力有大幅度提升，中英文通用文本理解能力、复杂指令遵循能力、主观开放任务能力、多语言能力、工具调用能力均显著增强；模型知识幻觉更少。',
    displayName: 'Qwen3 Max Preview',
    enabled: true,
    id: 'qwen3-max-preview',
    maxOutput: 32_768,
    organization: 'Qwen',
    releasedAt: '2025-09-05',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 1_048_576,
    description:
      '通义千问代码模型。最新的 Qwen3-Coder 系列模型是基于 Qwen3 的代码生成模型，具有强大的Coding Agent能力，擅长工具调用和环境交互，能够实现自主编程，代码能力卓越的同时兼具通用能力。',
    displayName: 'Qwen3 Coder',
    enabled: true,
    id: 'qwen/qwen3-coder',
    maxOutput: 65_536,
    releasedAt: '2025-07-22',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 262_144,
    description:
      'Qwen3-Coder-30B-A3B-Instruct 这是一个拥有 305 亿总参数和 33 亿激活参数的混合专家（MoE）模型。该模型在多个方面进行了关键增强，包括显著提升了指令遵循、逻辑推理、文本理解、数学、科学、编码和工具使用等通用能力。同时，它在多语言的长尾知识覆盖范围上取得了实质性进展，并能更好地与用户在主观和开放式任务中的偏好对齐，从而能够生成更有帮助的回复和更高质量的文本。此外，该模型的长文本理解能力也增强到了 256K。此模型仅支持非思考模式，其输出中不会生成 `<think></think>` 标签。',
    displayName: 'Qwen3 Coder 30B A3B Instruct',
    enabled: true,
    id: 'Qwen/Qwen3-Coder-30B-A3B-Instruct',
    releasedAt: '2025-07-29',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 262_144,
    description:
      '通义千问代码模型开源版。最新的 qwen3-coder-480b-a35b-instruct 是基于 Qwen3 的代码生成模型，具有强大的Coding Agent能力，擅长工具调用和环境交互，能够实现自主编程、代码能力卓越的同时兼具通用能力。',
    displayName: 'Qwen3 Coder 480B A35B',
    enabled: true,
    id: 'Qwen/Qwen3-Coder-480B-A35B-Instruct',
    maxOutput: 65_536,
    releasedAt: '2024-01-25',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 262_144,
    description:
      'qwen3-coder-480b-a35b-instruct-Turbo版本 是基于 Qwen3 的代码生成模型，具有强大的Coding Agent能力，擅长工具调用和环境交互，能够实现自主编程、代码能力卓越的同时兼具通用能力。',
    displayName: 'Qwen3 Coder 480B A35B Turbo',
    enabled: true,
    id: 'Qwen/Qwen3-Coder-480B-A35B-Instruct-Turbo',
    maxOutput: 65_536,
    releasedAt: '2024-01-25',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'DeepSeek-V3.2 模型，。作为迈向新一代架构的中间步骤，V3.2 在 V3.1-Terminus 的基础上引入了 DeepSeek Sparse Attention（一种稀疏注意力机制），针对长文本的训练和推理效率进行了探索性的优化和验证。',
    displayName: 'DeepSeek V3.2',
    enabled: true,
    id: 'Deepseek/Deepseek-V3.2',
    maxOutput: 32_768,
    releasedAt: '2025-12-03',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'DeepSeek-V3.2 模型，。作为迈向新一代架构的中间步骤，V3.2 在 V3.1-Terminus 的基础上引入了 DeepSeek Sparse Attention（一种稀疏注意力机制），针对长文本的训练和推理效率进行了探索性的优化和验证。',
    displayName: 'DeepSeek V3.2 Speciale',
    enabled: true,
    id: 'Deepseek/Deepseek-V3.2-Speciale',
    maxOutput: 32_768,
    releasedAt: '2025-12-03',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'DeepSeek-V3.1 是深度求索全新推出的混合推理模型，支持思考与非思考2种推理模式，较 DeepSeek-R1-0528 思考效率更高。经 Post-Training 优化，Agent 工具使用与智能体任务表现大幅提升。',
    displayName: 'DeepSeek V3.1',
    enabled: true,
    id: 'deepseek-ai/DeepSeek-V3.1',
    releasedAt: '2025-08-21',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek 推出的推理模型。在输出最终回答之前，模型会先输出一段思维链内容，以提升最终答案的准确性。',
    displayName: 'DeepSeek R1',
    enabled: true,
    id: 'deepseek-ai/DeepSeek-R1',
    maxOutput: 8192,
    releasedAt: '2025-05-28',

    type: 'chat',
  },

  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 256_000,
    description:
      'Doubao-Seed-1.6-thinking模型思考能力大幅强化， 对比Doubao-1.5-thinking-pro，在Coding、Math、 逻辑推理等基础能力上进一步提升， 支持视觉理解。 支持 256k 上下文窗口，输出长度支持最大 16k tokens。',
    displayName: 'Doubao Seed 1.6 Thinking',
    enabled: true,
    id: 'Doubao-Seed-1.6-thinking',
    maxOutput: 16_000,
    releasedAt: '2024-01-25',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 256_000,
    description:
      'Doubao-Seed-1.6全新多模态深度思考模型，同时支持auto/thinking/non-thinking三种思考模式。 non-thinking模式下，模型效果对比Doubao-1.5-pro/250115大幅提升。支持 256k 上下文窗口，输出长度支持最大 16k tokens。',
    displayName: 'Doubao Seed 1.6',
    enabled: true,
    id: 'Doubao-Seed-1.6',
    maxOutput: 16_000,
    releasedAt: '2024-01-25',
    settings: {
      extendParams: ['thinking'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 256_000,
    description:
      'Doubao-Seed-1.6-flash推理速度极致的多模态深度思考模型，TPOT仅需10ms； 同时支持文本和视觉理解，文本理解能力超过上一代lite，视觉理解比肩友商pro系列模型。支持 256k 上下文窗口，输出长度支持最大 16k tokens。',
    displayName: 'Doubao Seed 1.6 Flash',
    enabled: true,
    id: 'Doubao-Seed-1.6-flash',
    maxOutput: 16_000,
    releasedAt: '2024-01-25',
    settings: {
      extendParams: ['enableReasoning'],
    },
    type: 'chat',
  },
];

export const newapiEmbeddingModels: AIEmbeddingModelCard[] = [
  {
    contextWindowTokens: 8192,
    description: '最强大的向量化模型，适用于英文和非英文任务',
    displayName: 'Text Embedding 3 Large',
    id: 'text-embedding-3-large',
    maxDimension: 3072,
    releasedAt: '2024-01-25',
    type: 'embedding',
  },
  {
    contextWindowTokens: 8192,
    description: '高效且经济的新一代 Embedding 模型，适用于知识检索、RAG 应用等场景',
    displayName: 'Text Embedding 3 Small',
    enabled: true,
    id: 'text-embedding-3-small',
    maxDimension: 1536,
    releasedAt: '2024-01-25',
    type: 'embedding',
  },
];

// 语音合成模型
export const newapiTTSModels: AITTSModelCard[] = [
  {
    description: '最新的文本转语音模型，针对实时场景优化速度',
    displayName: 'TTS-1',
    enabled: true,
    id: 'tts-1',
    releasedAt: '2024-12-17',
    type: 'tts',
  },
  {
    description: '最新的文本转语音模型，针对质量进行优化',
    displayName: 'TTS-1 HD',
    enabled: true,
    id: 'tts-1-hd',
    releasedAt: '2024-12-17',
    type: 'tts',
  },
];

// 语音识别模型
export const newapiASRModels: AIASRModelCard[] = [
  {
    description: '通用语音识别模型，支持多语言语音识别、语音翻译和语言识别。',
    displayName: 'Whisper',
    enabled: true,
    id: 'whisper-1',
    type: 'asr',
  },
];

// 图像生成模型
export const newapiImageModels: AIImageModelCard[] = [
  // https://platform.openai.com/docs/models/gpt-image-1
  {
    description:
      'Gemini 3.1 Flash Image（Nano Banana Pro 2）是 Google 在2026年2月份推出的图像生成模型。',
    displayName: 'Nano Banana 2',
    enabled: true,
    id: 'gemini-3.1-flash-image-preview:image',
    parameters: nanoBanana2Parameters,
    releasedAt: '2026-02-27',
    type: 'image',
  },
  {
    description:
      'Gemini 3 Pro Image（Nano Banana Pro）是 Google 的图像生成模型，同时支持多模态对话。',
    displayName: '🍌 Nano Banana Pro',
    enabled: true,
    id: 'gemini-3-pro-image-preview:image',
    parameters: nanoBananaProParameters,
    releasedAt: '2025-11-20',
    type: 'image',
  },
  {
    description: 'ChatGPT Image 1.5 原生多模态图片生成模型',
    displayName: 'GPT Image 1.5',
    enabled: true,
    id: 'gpt-image-1.5',
    parameters: gptImage1ParamsSchema,
    releasedAt: '2025-12-17',
    type: 'image',
  },
  {
    description: 'ChatGPT 原生多模态图片生成模型',
    displayName: 'GPT Image 1',
    enabled: true,
    id: 'gpt-image-1',
    parameters: gptImage1ParamsSchema,
    releasedAt: '2025-5-17',
    type: 'image',
  },
  {
    description: '成本更低的 GPT Image 1 版本，原生支持文本与图像输入并生成图像输出。',
    displayName: 'GPT Image 1 Mini',
    enabled: true,
    id: 'gpt-image-1-mini',
    parameters: gptImage1ParamsSchema,
    releasedAt: '2025-10-06',
    resolutions: ['1024x1024', '1024x1536', '1536x1024'],
    type: 'image',
  },
  {
    description:
      'Qwen 团队带来的强大生图模型，具有令人印象深刻的中文文字生成能力和多样图片视觉风格。',
    displayName: 'Qwen Image',
    enabled: true,
    id: 'qwen-image',
    parameters: qwenImageParamsSchema,
    releasedAt: '2025-08-04',
    type: 'image',
  },
  {
    description:
      '最新的 DALL·E 模型，于2023年11月发布。支持更真实、准确的图像生成，具有更强的细节表现力',
    displayName: 'DALL·E 3',
    id: 'dall-e-3',
    parameters: {
      prompt: { default: '' },
      size: {
        default: '1024x1024',
        enum: ['1024x1024', '1792x1024', '1024x1792'],
      },
    },
    releasedAt: '2024-12-17',
    resolutions: ['1024x1024', '1024x1792', '1792x1024'],
    type: 'image',
  },
  {
    description: '第二代 DALL·E 模型，支持更真实、准确的图像生成，分辨率是第一代的4倍',
    displayName: 'DALL·E 2',
    id: 'dall-e-2',
    parameters: {
      imageUrl: { default: null },
      prompt: { default: '' },
      size: {
        default: '1024x1024',
        enum: ['256x256', '512x512', '1024x1024'],
      },
    },
    releasedAt: '2024-12-17',
    resolutions: ['256x256', '512x512', '1024x1024'],
    type: 'image',
  },
];

// GPT-4o 和 GPT-4o-mini 实时模型
export const newapiRealtimeModels: AIRealtimeModelCard[] = [
  {
    contextWindowTokens: 16_000,
    description: '最新实时语音版本，支持音频和文本实时输入输出',
    displayName: 'GPT Realtime Mini',
    id: 'gpt-realtime-mini',
    maxOutput: 4096,
    releasedAt: '2025-10-12',
    type: 'realtime',
  },
  {
    contextWindowTokens: 16_000,
    description: 'GPT-4o 实时版本，支持音频和文本实时输入输出',
    displayName: 'GPT-4o Realtime 241217',
    id: 'gpt-4o-realtime-preview',
    maxOutput: 4096,
    releasedAt: '2024-12-17',
    type: 'realtime',
  },
  {
    contextWindowTokens: 32_000,
    description: 'GPT-4o 实时版本，支持音频和文本实时输入输出',
    displayName: 'GPT-4o Realtime 250603',
    id: 'gpt-4o-realtime-preview-2025-06-03',
    maxOutput: 4096,
    releasedAt: '2025-06-03',
    type: 'realtime',
  },
  {
    contextWindowTokens: 16_000,
    description: 'GPT-4o 实时版本，支持音频和文本实时输入输出',
    displayName: 'GPT-4o Realtime 241001',
    id: 'gpt-4o-realtime-preview-2024-10-01', // deprecated on 2025-09-10
    maxOutput: 4096,
    releasedAt: '2024-10-01',
    type: 'realtime',
  },
  {
    contextWindowTokens: 128_000,
    description: 'GPT-4o-mini 实时版本，支持音频和文本实时输入输出',
    displayName: 'GPT-4o Mini Realtime',
    id: 'gpt-4o-mini-realtime-preview',
    maxOutput: 4096,
    releasedAt: '2024-12-17',
    type: 'realtime',
  },
];

export const allModels = [
  ...newapiChatModels,
  ...newapiEmbeddingModels,
  ...newapiTTSModels,
  ...newapiImageModels,
  ...newapiRealtimeModels,
];

export default allModels;
