/* eslint-disable no-restricted-syntax */
import { type ModelParamsSchema } from '../standard-parameters';
import {
  PRESET_VIDEO_ASPECT_RATIOS,
  PRESET_VIDEO_RESOLUTIONS,
  type VideoModelParamsSchema,
} from '../standard-parameters/video';
import {
  type AIChatModelCard,
  type AIEmbeddingModelCard,
  type AIImageModelCard,
  type AIRealtimeModelCard,
  type AISTTModelCard,
  type AITTSModelCard,
  type AIVideoModelCard,
} from '../types/aiModel';

// smai Router Provider - 聚合多个 AI 服务
// 模型通过动态获取，不预定义具体模型
export const gptImage1ParamsSchema: ModelParamsSchema = {
  imageUrls: { default: [], maxCount: 1, maxFileSize: 5 * 1024 * 1024 },
  prompt: { default: '' },
  size: {
    default: 'auto',
    enum: ['auto', '1024x1024', '1536x1024', '1024x1536'],
  },
};
// gpt-image-2 accepts any resolution satisfying: max edge ≤ 3840px, both edges
// multiples of 16px, aspect ratio ≤ 3:1, pixels between 655,360 and 8,294,400.
// Until the schema/UI supports free-form W×H input, we expose the official
// "Popular sizes" list from https://developers.openai.com/docs/guides/image-generation.
export const gptImage2Schema = {
  imageUrls: { default: [], maxCount: 1, maxFileSize: 5 * 1024 * 1024 },
  prompt: { default: '' },
  size: {
    default: 'auto',
    enum: [
      'auto',
      '1024x1024',
      '1536x1024',
      '1024x1536',
      '2048x2048',
      '2048x1152',
      '3840x2160',
      '2160x3840',
    ],
  },
};
export const seedance15ProParams: VideoModelParamsSchema = {
  aspectRatio: {
    default: 'adaptive',
    enum: ['adaptive', ...PRESET_VIDEO_ASPECT_RATIOS],
  },
  cameraFixed: { default: false },
  duration: { default: 5, max: 12, min: 4 },
  endImageUrl: {
    aspectRatio: { max: 2.5, min: 0.4 },
    default: null,
    height: { max: 6000, min: 300 },
    maxFileSize: 30 * 1024 * 1024,
    requiresImageUrl: true,
    width: { max: 6000, min: 300 },
  },
  generateAudio: { default: true },
  imageUrl: {
    aspectRatio: { max: 2.5, min: 0.4 },
    default: null,
    height: { max: 6000, min: 300 },
    maxFileSize: 30 * 1024 * 1024,
    width: { max: 6000, min: 300 },
  },
  prompt: { default: '' },
  resolution: {
    default: '480p',
    enum: PRESET_VIDEO_RESOLUTIONS,
  },
  seed: { default: null },
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

export const seedance20Params: VideoModelParamsSchema = {
  aspectRatio: {
    default: 'adaptive',
    enum: ['adaptive', ...PRESET_VIDEO_ASPECT_RATIOS],
  },
  duration: { default: 5, max: 15, min: 4 },
  endImageUrl: {
    aspectRatio: { max: 2.5, min: 0.4 },
    default: null,
    height: { max: 6000, min: 300 },
    maxFileSize: 30 * 1024 * 1024,
    requiresImageUrl: true,
    width: { max: 6000, min: 300 },
  },
  generateAudio: { default: true },
  imageUrls: {
    aspectRatio: { max: 2.5, min: 0.4 },
    default: [],
    height: { max: 6000, min: 300 },
    maxFileSize: 30 * 1024 * 1024,
    width: { max: 6000, min: 300 },
  },
  prompt: { default: '' },
  resolution: {
    default: '720p',
    enum: ['480p', '720p'],
  },
  seed: { default: null },
};

export const smaiVideoModels: AIVideoModelCard[] = [
  {
    description:
      '豆包大模型团队推出的新一代专业级多模态创作视频模型 Seedance 2.0，支持图像、视频、音频等多模态作为参考输入生成视频，还具备视频编辑、延长等能力，能高精度还原各类细节并稳定角色特征，具备极致拟真的视听稳定性，深度适配商业广告、影视制作与社交媒体营销等各大核心场景',
    displayName: 'Seedance 2.0',
    enabled: true,
    id: 'doubao-seedance-2-0-260128',
    organization: 'ByteDance',
    parameters: seedance20Params,
    releasedAt: '2026-04-08',
    type: 'video',
  },
  {
    description:
      'Seedance 2.0 fast是豆包大模型团队推出的新一代多模态视频创作模型，它继承了Seedance 2.0模型的核心功能和优势，生成速度更快',
    displayName: 'Seedance 2.0 Fast',
    enabled: true,
    id: 'doubao-seedance-2-0-fast-260128',
    organization: 'ByteDance',
    parameters: seedance20Params,
    releasedAt: '2026-04-08',
    type: 'video',
  },
];

const smaiChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      structuredOutput: true,
      vision: true,
    },
    contextWindowTokens: 1_050_000,
    description: 'GPT-5.5 is our newest frontier model for the most complex professional work.',
    displayName: 'GPT-5.5',
    enabled: true,
    id: 'gpt-5.5',
    maxOutput: 128_000,
    releasedAt: '2026-04-23',
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
      'GPT-5.2 Chat — 专为更深入的工作而打造，帮助用户以更高的完成度处理复杂任务，擅长编码、长文档总结、回答上传文件相关问题、逐步推导数学与逻辑问题，以及通过更清晰的结构和更有用的细节支持规划与决策。',
    displayName: 'GPT-5.2 Chat',
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
      'GPT-5.2 Codex — 专为更深入的工作而打造，帮助用户以更高的完成度处理复杂任务，擅长编码、长文档总结、回答上传文件相关问题、逐步推导数学与逻辑问题，以及通过更清晰的结构和更有用的细节支持规划与决策。',
    displayName: 'GPT-5.2 Codex',
    id: 'gpt-5.2-codex',
    maxOutput: 128_000,
    releasedAt: '2026-1-12',
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
    id: 'sora-2-pro-all',
    maxOutput: 64_000,
    releasedAt: '2025-10-12',
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
    enabled: true,
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
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
    displayName: 'GPT-4o',
    id: 'gpt-4o',
    releasedAt: '2024-05-13',
    settings: {
      searchImpl: 'params',
    },
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
  // {
  //   abilities: {
  //     functionCall: true,
  //     reasoning: true,
  //     search: true,
  //     structuredOutput: true,
  //     vision: true,
  //   },
  //   contextWindowTokens: 1_000_000,
  //   description:
  //     "Claude Fable 5 is Anthropic's most capable model — a new tier above Opus for the most demanding reasoning and long-horizon agentic work.",
  //   displayName: 'Claude Fable 5',
  //   enabled: true,
  //   family: 'claude-mythos',
  //   generation: 'mythos-5',
  //   id: 'claude-fable-5',
  //   maxOutput: 128_000,
  //   releasedAt: '2026-06-09',
  //   settings: {
  //     disabledParams: ['temperature', 'top_p'],
  //     extendParams: ['disableContextCaching', 'enableAdaptiveThinking', 'opus47Effort'],
  //     searchImpl: 'params',
  //   },
  //   type: 'chat',
  // },
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
      "Claude Opus 4.8 is Anthropic's most capable model, building on Opus 4.7 with improvements across reasoning, agentic coding, and tool use.",
    displayName: 'Claude Opus 4.8',
    enabled: true,
    id: 'claude-opus-4-8',
    maxOutput: 128_000,
    releasedAt: '2026-05-29',
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
      vision: true,
    },
    contextWindowTokens: 1_000_000,
    description:
      "Claude Opus 4.7 is Anthropic's most capable generally available model for complex reasoning and agentic coding.",
    displayName: 'Claude Opus 4.7',
    enabled: true,
    id: 'claude-opus-4-7',
    maxOutput: 128_000,
    releasedAt: '2026-04-16',
    settings: {
      disabledParams: ['temperature', 'top_p'],
      extendParams: ['disableContextCaching', 'enableAdaptiveThinking', 'opus47Effort'],
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
      'Claude Opus 4.6 is Anthropic’s most intelligent model for building agents and coding.',
    displayName: 'Claude Opus 4.6',
    enabled: true,
    id: 'claude-opus-4-6',
    maxOutput: 128_000,
    releasedAt: '2026-02-05',
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
    releasedAt: '2026-02-23',
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
      video: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      "Gemini's most intelligent model built for speed, combining frontier intelligence with superior search and grounding.",
    displayName: 'Gemini 3.5 Flash',
    enabled: true,
    id: 'gemini-3.5-flash',
    maxOutput: 65_536,
    releasedAt: '2026-05-20',
    settings: {
      extendParams: ['thinkingLevel', 'urlContext'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
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
    releasedAt: '2026-02-23',
    settings: {
      extendParams: ['thinkingLevel3', 'urlContext'],
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
      extendParams: ['imageAspectRatio2', 'imageResolution2', 'thinkingLevel4'],
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
    displayName: 'Grok 4.2 Beta',
    enabled: true,
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
    enabled: true,
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
      search: true,
      structuredOutput: true,
    },
    contextWindowTokens: 1_000_000,
    description:
      "MiMo-V2.5-Pro is Xiaomi's most capable flagship model to date, delivering significant improvements in general agentic capabilities, complex software engineering, and long-horizon tasks. It retains the 1T total / 42B active hybrid-attention architecture with a 1M context window, and can sustain complex long-horizon tasks spanning more than a thousand tool calls. Performance on demanding agentic benchmarks (ClawEval, GDPVal, SWE-bench Pro) is comparable to Claude Opus 4.6.",
    displayName: 'MiMo-V2.5 Pro',
    enabled: true,
    id: 'mimo-v2.5-pro',
    maxOutput: 131_072,
    releasedAt: '2026-05-27',
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
    contextWindowTokens: 1_000_000,
    description:
      'MiMo-V2.5 is a native omni-modal Agent foundation model that understands images, video, audio, and text in a unified architecture, with a 1M context window. It delivers Pro-level agentic performance at roughly half the inference cost of MiMo-V2.5-Pro, with improved multimodal perception over MiMo-V2-Omni. Its built-in agentic capabilities (browsing, understanding, reasoning, execution) and faster inference make it well-suited to latency-sensitive and multi-step agent frameworks such as OpenClaw.',
    displayName: 'MiMo-V2.5',
    enabled: true,
    id: 'mimo-v2.5',
    maxOutput: 131_072,
    releasedAt: '2026-05-27',
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
    },
    contextWindowTokens: 204_800,
    description: 'Same performance as M2.7 with significantly faster inference (~100 tps).',
    displayName: 'MiniMax M2.7 Highspeed',
    enabled: true,
    id: 'MiniMax-M2.7-highspeed',
    maxOutput: 131_072,
    releasedAt: '2026-03-18',
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
    contextWindowTokens: 262_144,
    description:
      'Kimi K2.5 is Kimi\'s most versatile model to date, featuring a native multimodal architecture that supports both vision and text inputs, "thinking" and "non-thinking" modes, and both conversational and agent tasks.',
    displayName: 'Kimi K2.5',
    enabled: true,
    id: 'kimi-k2.5',
    maxOutput: 32_768,
    releasedAt: '2026-02-23',
    settings: {
      extendParams: ['enableReasoning'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      structuredOutput: true,
    },
    contextWindowTokens: 131_072,
    description:
      'DeepSeek V4 Flash is the cost-efficient member of the V4 family with a 1M context window and hybrid thinking. Thinking mode is on by default and can be toggled via the `thinking` parameter; non-thinking mode is optimized for latency-sensitive workflows.',
    displayName: 'DeepSeek V4 Flash',
    enabled: true,
    id: 'deepseek-v4-flash',
    maxOutput: 384_000,
    releasedAt: '2026-04-24',
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken32k'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
    },
    contextWindowTokens: 1_000_000,
    description:
      'DeepSeek V4 Pro is the flagship of the V4 family, optimized for high-intensity reasoning, agentic workflows, and long-horizon planning. Thinking mode is on by default and can be toggled via the `thinking` parameter.',
    displayName: 'DeepSeek V4 Pro',
    enabled: true,
    id: 'deepseek-v4-pro',
    maxOutput: 384_000,
    releasedAt: '2026-04-24',
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken32k'],
    },
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
      'DeepSeek-V3.1 是深度求索全新推出的混合推理模型，支持思考与非思考2种推理模式，较 DeepSeek-R1-0528 思考效率更高。经 Post-Training 优化，Agent 工具使用与智能体任务表现大幅提升。',
    displayName: 'DeepSeek V3.1',
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
    id: 'deepseek-ai/DeepSeek-R1',
    maxOutput: 8192,
    releasedAt: '2025-05-28',
    type: 'chat',
  },
];

export const smaiEmbeddingModels: AIEmbeddingModelCard[] = [
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
export const smaiTTSModels: AITTSModelCard[] = [
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
  {
    description:
      'Xiaomi MiMo-V2-TTS 是小米自主研发的语音合成大模型。它基于自研 Audio Tokenizer 和多码本语音-文本联合建模架构，经过上亿小时语音数据的大规模预训练与多维度强化学习，实现了高度可控的多粒度语音风格控制。MiMo-V2-TTS 支持从整体风格定调到局部情绪表达的精准调节，能在同一句话内完成语气转折和情感递变；真实还原人类说话的自然韵律；在唱歌时，也能准确表达音高和节奏，自然且富有表现力。',
    displayName: 'MiMo-V2.5-TTS',
    enabled: true,
    id: 'mimo-v2.5-tts',
    releasedAt: '2026-5-27',
    type: 'tts',
  },
];

// 语音识别模型
export const smaiSTTModels: AISTTModelCard[] = [
  {
    description: '通用语音识别模型，支持多语言语音识别、语音翻译和语言识别。',
    displayName: 'Whisper',
    enabled: true,
    id: 'whisper-1',
    releasedAt: '2024-03-08',
    type: 'stt',
  },
];

// 图像生成模型
export const smaiImageModels: AIImageModelCard[] = [
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
    description:
      "OpenAI's next-generation multimodal image model with native reasoning, up to 4K resolution, near-perfect text rendering, and high-fidelity multilingual support.",
    displayName: 'GPT Image 2',
    enabled: true,
    id: 'gpt-image-2',
    parameters: gptImage2Schema,
    releasedAt: '2026-04-22',
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

// 实时模型
export const smaiRealtimeModels: AIRealtimeModelCard[] = [
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
  ...smaiChatModels,
  ...smaiEmbeddingModels,
  ...smaiTTSModels,
  ...smaiSTTModels,
  ...smaiImageModels,
  ...smaiRealtimeModels,
  ...smaiVideoModels,
];

export default allModels;
