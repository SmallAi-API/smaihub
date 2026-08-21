import type { HomeNewModelItem } from '@/business/client/hooks/useHomeNewModels';

// Chat
export const NEW_GLM_MODEL = 'glm-5.3';
export const NEW_GLM_MODEL_NAME = 'GLM-5.3';
export const NEW_GEMINI_MODEL = 'gemini-3.7-flash';
export const NEW_GEMINI_MODEL_NAME = 'Gemini 3.7 Flash';

export const BUSINESS_CHAT_PROVIDER = 'smai';
export const OSS_GLM_PROVIDER = 'smai';
export const OSS_GEMINI_PROVIDER = 'smai';

// Image
export const NEW_IMAGE_MODEL = 'gpt-image-2';
export const NEW_IMAGE_MODEL_NAME = 'GPT Image 2';

export const BUSINESS_HOME_NEW_MODELS = [
  {
    model: NEW_GLM_MODEL,
    provider: BUSINESS_CHAT_PROVIDER,
    title: NEW_GLM_MODEL_NAME,
    type: 'chat',
  },
  {
    model: NEW_GEMINI_MODEL,
    provider: BUSINESS_CHAT_PROVIDER,
    title: NEW_GEMINI_MODEL_NAME,
    type: 'chat',
  },
  {
    model: NEW_IMAGE_MODEL,
    title: NEW_IMAGE_MODEL_NAME,
    type: 'image',
  },
] as const satisfies HomeNewModelItem[];

export const OSS_HOME_NEW_MODELS = [
  {
    model: NEW_GLM_MODEL,
    provider: OSS_GLM_PROVIDER,
    title: NEW_GLM_MODEL_NAME,
    type: 'chat',
  },
  {
    model: NEW_GEMINI_MODEL,
    provider: OSS_GEMINI_PROVIDER,
    title: NEW_GEMINI_MODEL_NAME,
    type: 'chat',
  },
  {
    model: NEW_IMAGE_MODEL,
    title: NEW_IMAGE_MODEL_NAME,
    type: 'image',
  },
] as const satisfies HomeNewModelItem[];
