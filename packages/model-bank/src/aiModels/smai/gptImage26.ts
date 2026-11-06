import { gptImage26Schema } from '../../const/imageParameters';
import type { AIImageModelCard } from '../../types/aiModel';

export const gptImage26Models: AIImageModelCard[] = [
  {
    description:
      "OpenAI's fastest GPT Image 2.6 model, for high-quality everyday image generation.",
    displayName: 'GPT Image 2.6 Flare',
    enabled: true,
    id: 'gpt-image-2.6-flare',
    parameters: gptImage26Schema,
    releasedAt: '2026-11-05',
    type: 'image',
  },
  {
    description:
      'The GPT Image 2.6 model for workflows where editing precision matters most, generating and editing images from text and image inputs.',
    displayName: 'GPT Image 2.6 Sunburst',
    enabled: true,
    id: 'gpt-image-2.6-sunburst',
    parameters: gptImage26Schema,
    releasedAt: '2026-11-05',
    type: 'image',
  },
];
