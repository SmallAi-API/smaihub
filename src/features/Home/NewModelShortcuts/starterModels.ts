import type { HomeNewModelItem } from '@/business/client/hooks/useHomeNewModels';

// Chat
export const NEW_GPT_MODEL = 'gpt-6.1-sol';
export const NEW_GPT_MODEL_NAME = 'GPT-6.1 Sol';
export const NEW_CLAUDE_MODEL = 'claude-fable-5-2';
export const NEW_CLAUDE_MODEL_NAME = 'Claude Fable 5.2';
export const NEW_GEMINI_MODEL = 'gemini-4-carbon';
export const NEW_GEMINI_MODEL_NAME = 'Gemini 4 Carbon';
export const NEW_DEEPSEEK_MODEL = 'deepseek-v4.1-flash';
export const NEW_DEEPSEEK_MODEL_NAME = 'DeepSeek V4.1 Flash';

export const BUSINESS_CHAT_PROVIDER = 'smai';
export const OSS_GEMINI_PROVIDER = 'smai';
export const OSS_GPT_PROVIDER = 'smai';
export const OSS_CLAUDE_PROVIDER = 'smai';
export const OSS_DEEPSEEK_PROVIDER = 'smai';
// Image
export const NEW_IMAGE_MODEL = 'gpt-image-2.6-flare';
export const NEW_IMAGE_MODEL_NAME = 'GPT Image 2.6';

export const BUSINESS_HOME_NEW_MODELS = [
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
    model: NEW_GEMINI_MODEL,
    provider: BUSINESS_CHAT_PROVIDER,
    title: NEW_GEMINI_MODEL_NAME,
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
    model: NEW_GEMINI_MODEL,
    provider: OSS_GEMINI_PROVIDER,
    title: NEW_GEMINI_MODEL_NAME,
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
