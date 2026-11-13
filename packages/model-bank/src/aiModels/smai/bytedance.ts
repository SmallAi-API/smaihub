/* eslint-disable eslint-core/no-restricted-syntax -- Preserve existing Chinese model descriptions. */
import type { AIVideoModelCard } from '../../types/aiModel';
import { seedance20Params } from './parameters';

export const bytedanceVideoModels: AIVideoModelCard[] = [
  {
    description:
      '豆包大模型团队推出的新一代专业级多模态创作视频模型 Seedance 2.0，支持图像、视频、音频等多模态作为参考输入生成视频，还具备视频编辑、延长等能力，能高精度还原各类细节并稳定角色特征，具备极致拟真的视听稳定性，深度适配商业广告、影视制作与社交媒体营销等各大核心场景',
    displayName: 'Seedance 2.0',
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
    id: 'doubao-seedance-2-0-fast-260128',
    organization: 'ByteDance',
    parameters: seedance20Params,
    releasedAt: '2026-04-08',
    type: 'video',
  },
];
