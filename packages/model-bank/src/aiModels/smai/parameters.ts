import type { ModelParamsSchema } from '../../standard-parameters';
import {
  PRESET_VIDEO_ASPECT_RATIOS,
  PRESET_VIDEO_RESOLUTIONS,
  type VideoModelParamsSchema,
} from '../../standard-parameters/video';

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

// https://ai.google.dev/gemini-api/docs/models/gemini-nano-banana-2.1
export const nanoBanana21Parameters: ModelParamsSchema = {
  aspectRatio: nanoBanana2Parameters.aspectRatio,
  imageUrls: { default: [], maxCount: 14 },
  prompt: { default: '' },
  resolution: {
    default: '1K',
    enum: ['1K', '2K', '4K'],
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
