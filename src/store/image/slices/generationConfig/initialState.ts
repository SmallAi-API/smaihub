import type { ModelParamsSchema, RuntimeImageGenParams } from 'model-bank';
import { extractDefaultValues, ModelProvider } from 'model-bank';
import { nanoBanana2Parameters } from 'model-bank/imageParameters';

import { DEFAULT_IMAGE_CONFIG } from '@/const/settings';

export const DEFAULT_AI_IMAGE_PROVIDER = ModelProvider.SMAI;
export const DEFAULT_AI_IMAGE_MODEL = 'gemini-3.1-flash-image-preview:image';

export interface GenerationConfigState {
  parameters: RuntimeImageGenParams;
  parametersSchema: ModelParamsSchema;

  provider: string;
  model: string;
  imageNum: number;

  isAspectRatioLocked: boolean;
  activeAspectRatio: string | null; // string - 虚拟比例; null - 原生比例

  /**
   * 标记配置是否已初始化（包括从记忆中恢复）
   */
  isInit: boolean;
}

export const DEFAULT_IMAGE_GENERATION_PARAMETERS: RuntimeImageGenParams =
  extractDefaultValues(nanoBanana2Parameters);

export const initialGenerationConfigState: GenerationConfigState = {
  model: DEFAULT_AI_IMAGE_MODEL,
  provider: DEFAULT_AI_IMAGE_PROVIDER,
  imageNum: DEFAULT_IMAGE_CONFIG.defaultImageNum,
  parameters: DEFAULT_IMAGE_GENERATION_PARAMETERS,
  parametersSchema: nanoBanana2Parameters,
  isAspectRatioLocked: false,
  activeAspectRatio: null,
  isInit: false,
};
