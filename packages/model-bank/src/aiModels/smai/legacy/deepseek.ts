/* eslint-disable eslint-core/no-restricted-syntax -- Preserve existing Chinese model descriptions. */
import type { AIChatModelCard } from '../../../types/aiModel';

export const legacyDeepseekChatModels: AIChatModelCard[] = [
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
