import createDebug from 'debug';

import type { CreateVideoOptions } from '../../core/openaiCompatibleFactory';
import type {
  CreateVideoPayload,
  CreateVideoResponse,
  PollVideoStatusResult,
} from '../../types/video';

const log = createDebug('lobe-video:smai');

interface SMAIVideoTaskResponse {
  id?: string;
}

interface SMAIVideoStatusResponse {
  error?: {
    code?: string;
    message?: string;
  };
  id?: string;
  output?: {
    video_url?: string;
  };
  status?: string;
  usage?: {
    duration?: number;
  };
}

/**
 * Query the status of a video generation task
 */
export async function querySMAIVideoStatus(
  taskId: string,
  options: { apiKey: string; baseURL: string },
): Promise<SMAIVideoStatusResponse> {
  const statusUrl = `${options.baseURL}/video/${taskId}`;

  log('Querying video status for: %s', taskId);

  const response = await fetch(statusUrl, {
    headers: {
      'Authorization': `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SMAI video status API error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as SMAIVideoStatusResponse;
  log('Video status response: %O', data);

  return data;
}

/**
 * Poll video status and return standardized result
 */
export async function pollSMAIVideoStatus(
  taskId: string,
  options: { apiKey: string; baseURL: string },
): Promise<PollVideoStatusResult> {
  const response = await querySMAIVideoStatus(taskId, options);

  if (response.status === 'completed' || response.status === 'succeed') {
    const videoUrl = response.output?.video_url;
    if (!videoUrl) {
      return { error: 'Task succeeded but no video URL found', status: 'failed' };
    }
    return { status: 'success', videoUrl };
  }

  if (response.status === 'failed') {
    return {
      error: response.error?.message || 'Video generation failed',
      status: 'failed',
    };
  }

  // processing, pending, or any other status means still in progress
  return { status: 'pending' };
}

/**
 * SMAI video generation implementation
 *
 * Uses the Volcengine-style content format through SMAI's OpenAI-compatible proxy.
 * Endpoint: POST /v1/video
 *
 * Creates a video generation task and returns immediately with inferenceId.
 * The backend polls the task status using background polling mechanism.
 */
export async function createSMAIVideo(
  payload: CreateVideoPayload,
  options: CreateVideoOptions,
): Promise<CreateVideoResponse> {
  const { model, params } = payload;
  const {
    prompt,
    imageUrl,
    endImageUrl,
    aspectRatio,
    duration,
    generateAudio,
    seed,
    resolution,
    cameraFixed,
  } = params;

  log('Creating video with SMAI API - model: %s, params: %O', model, params);

  const baseURL = options.baseURL || 'https://api.smai.ai/v1';

  // Build content array (Volcengine-style format)
  const content: Record<string, unknown>[] = [{ text: prompt, type: 'text' }];

  if (imageUrl) {
    content.push({ image_url: { url: imageUrl }, role: 'first_frame', type: 'image_url' });
  }

  if (endImageUrl) {
    content.push({ image_url: { url: endImageUrl }, role: 'last_frame', type: 'image_url' });
  }

  // Build request body
  const body: Record<string, unknown> = {
    content,
    model,
  };

  if (aspectRatio !== undefined) body.ratio = aspectRatio;
  if (duration !== undefined) body.duration = duration;
  if (generateAudio !== undefined) body.generate_audio = generateAudio;
  if (seed !== undefined && seed !== null) body.seed = seed;
  if (resolution !== undefined) body.resolution = resolution;
  if (cameraFixed !== undefined) body.camera_fixed = cameraFixed;

  log('SMAI video API request body: %O', body);

  const response = await fetch(`${baseURL}/video`, {
    body: JSON.stringify(body),
    headers: {
      'Authorization': `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    const errorText = await response.text();
    log('SMAI video API error: %s %s', response.status, errorText);
    throw new Error(`SMAI video API error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as SMAIVideoTaskResponse;
  log('SMAI video API response: %O', data);

  if (!data?.id) {
    throw new Error('Invalid response: missing task id');
  }

  const inferenceId = data.id;
  log('Video task created with id: %s, returning immediately for background polling', inferenceId);

  // Return immediately with inferenceId only
  // Backend will poll the task status using the background polling mechanism
  return { inferenceId };
}
