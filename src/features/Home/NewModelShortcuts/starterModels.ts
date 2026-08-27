import type { HomeNewModelItem } from '@/business/client/hooks/useHomeNewModels';

// Chat
export const NEW_GPT_MODEL = 'gpt-5.6-sol';
export const NEW_GPT_MODEL_NAME = 'GPT 5.6 Sol';
export const NEW_CLAUDE_MODEL = 'claude-opus-5';
export const NEW_CLAUDE_MODEL_NAME = 'Claude Opus 5';
export const NEW_GLM_MODEL = 'glm-5.3-flash';
export const NEW_GLM_MODEL_NAME = 'GLM-5.3 Flash';
export const NEW_DEEPSEEK_MODEL = 'deepseek-v4-flash-vision-exp';
export const NEW_DEEPSEEK_MODEL_NAME = 'DeepSeek V4 Flash Vision';

export const BUSINESS_CHAT_PROVIDER = 'smai';
export const OSS_GLM_PROVIDER = 'smai';
export const OSS_GPT_PROVIDER = 'smai';
export const OSS_CLAUDE_PROVIDER = 'smai';
export const OSS_DEEPSEEK_PROVIDER = 'smai';
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
    model: NEW_GPT_MODEL,
    provider: BUSINESS_CHAT_PROVIDER,
    title: NEW_GPT_MODEL_NAME,
    type: 'chat',
  },
  {
    model: NEW_CLAUDE_MODEL,
    provider: BUSINESS_CHAT_PROVIDER,
    title: NEW_CLAUDE_MODEL_NAME,
    type: 'chat',
  },
  {
    model: NEW_DEEPSEEK_MODEL,
    provider: BUSINESS_CHAT_PROVIDER,
    title: NEW_DEEPSEEK_MODEL_NAME,
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
    model: NEW_GPT_MODEL,
    provider: OSS_GPT_PROVIDER,
    title: NEW_GPT_MODEL_NAME,
    type: 'chat',
  },
  {
    model: NEW_CLAUDE_MODEL,
    provider: OSS_CLAUDE_PROVIDER,
    title: NEW_CLAUDE_MODEL_NAME,
    type: 'chat',
  },
  {
    model: NEW_DEEPSEEK_MODEL,
    provider: OSS_DEEPSEEK_PROVIDER,
    title: NEW_DEEPSEEK_MODEL_NAME,
    type: 'chat',
  },
  {
    model: NEW_IMAGE_MODEL,
    title: NEW_IMAGE_MODEL_NAME,
    type: 'image',
  },
] as const satisfies HomeNewModelItem[];
