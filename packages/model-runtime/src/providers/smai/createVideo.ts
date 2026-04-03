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
  task_id?: string;
}

interface SMAIVideoStatusResponse {
  error?: {
    code?: string;
    message?: string;
  };
  id?: string;
  metadata?: {
    url?: string;
  };
  progress?: number;
  status?: string;
  task_id?: string;
}

/**
 * Query the status of a video generation task
 * Endpoint: GET /v1/videos/{id}
 */
export async function querySMAIVideoStatus(
  taskId: string,
  options: { apiKey: string; baseURL: string },
): Promise<SMAIVideoStatusResponse> {
  const statusUrl = `${options.baseURL}/videos/${taskId}`;

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

  if (response.status === 'completed') {
    // Video URL is in metadata.url (TOS signed URL, no auth needed)
    const videoUrl = response.metadata?.url;
    if (!videoUrl) {
      return { error: 'Task completed but no video URL found in metadata', status: 'failed' };
    }
    return { status: 'success', videoUrl };
  }

  if (response.status === 'failed') {
    return {
      error: response.error?.message || 'Video generation failed',
      status: 'failed',
    };
  }

  // queued, in_progress, or any other status means still pending
  return { status: 'pending' };
}

/**
 * SMAI video generation implementation
 *
 * Uses OpenAI Sora-compatible API format.
 * Endpoint: POST /v1/videos
 *
 * Creates a video generation task and returns immediately with inferenceId.
 * The backend polls the task status using background polling mechanism.
 */
export async function createSMAIVideo(
  payload: CreateVideoPayload,
  options: CreateVideoOptions,
): Promise<CreateVideoResponse> {
  const { model, params } = payload;
  const { prompt, imageUrl, aspectRatio, duration, generateAudio, seed, resolution, size } = params;

  log('Creating video with SMAI API - model: %s, params: %O', model, params);

  const baseURL = options.baseURL || 'https://api.smai.ai/v1';

  // Build request body (OpenAI Sora-compatible format)
  const body: Record<string, unknown> = {
    model,
    prompt,
  };

  // Duration as string "seconds" for Sora compatibility
  if (duration !== undefined && duration !== null) {
    body['seconds'] = duration.toString();
  }

  if (size) {
    body['size'] = size;
  }

  if (aspectRatio !== undefined) body['aspect_ratio'] = aspectRatio;
  if (generateAudio !== undefined) body['generate_audio'] = generateAudio;
  if (seed !== undefined && seed !== null) body['seed'] = seed;
  if (resolution !== undefined) body['resolution'] = resolution;

  // Image-to-video support
  if (imageUrl) {
    body['input_reference'] = imageUrl;
  }

  log('SMAI video API request body: %O', body);

  const response = await fetch(`${baseURL}/videos`, {
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

  return { inferenceId };
}
