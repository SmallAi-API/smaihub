import type { HomeNewModelItem } from '@/business/client/hooks/useHomeNewModels';

// Chat
export const NEW_CLAUDE_MODEL = 'claude-sonnet-5';
export const NEW_CLAUDE_MODEL_NAME = 'Claude Sonnet 5';
export const NEW_GPT_MODEL = 'gpt-5.5';
export const NEW_GPT_MODEL_NAME = 'GPT 5.5';

export const BUSINESS_CHAT_PROVIDER = 'smai';
export const OSS_CLAUDE_PROVIDER = 'smai';
export const OSS_GPT_PROVIDER = 'smai';

// Image
export const NEW_IMAGE_MODEL = 'gpt-image-2';
export const NEW_IMAGE_MODEL_NAME = 'GPT Image 2';

// Video
export const NEW_VIDEO_MODEL = 'dreamina-seedance-2-0-260128';
export const NEW_VIDEO_MODEL_NAME = 'Seedance 2.0';

export const BUSINESS_HOME_NEW_MODELS = [
  {
    model: NEW_CLAUDE_MODEL,
    provider: BUSINESS_CHAT_PROVIDER,
    title: NEW_CLAUDE_MODEL_NAME,
    type: 'chat',
  },
  {
    model: NEW_GPT_MODEL,
    provider: BUSINESS_CHAT_PROVIDER,
    title: NEW_GPT_MODEL_NAME,
    type: 'chat',
  },
  {
    model: NEW_IMAGE_MODEL,
    title: NEW_IMAGE_MODEL_NAME,
    type: 'image',
  },
  {
    model: NEW_VIDEO_MODEL,
    title: NEW_VIDEO_MODEL_NAME,
    type: 'video',
  },
] satisfies HomeNewModelItem[];

export const OSS_HOME_NEW_MODELS = [
  {
    model: NEW_CLAUDE_MODEL,
    provider: OSS_CLAUDE_PROVIDER,
    title: NEW_CLAUDE_MODEL_NAME,
    type: 'chat',
  },
  {
    model: NEW_GPT_MODEL,
    provider: OSS_GPT_PROVIDER,
    title: NEW_GPT_MODEL_NAME,
    type: 'chat',
  },
  {
    model: NEW_IMAGE_MODEL,
    title: NEW_IMAGE_MODEL_NAME,
    type: 'image',
  },
  {
    model: NEW_VIDEO_MODEL,
    title: NEW_VIDEO_MODEL_NAME,
    type: 'video',
  },
] satisfies HomeNewModelItem[];
