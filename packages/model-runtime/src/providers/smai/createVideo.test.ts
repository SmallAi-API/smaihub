// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CreateVideoOptions } from '../../core/openaiCompatibleFactory';
import type { CreateVideoPayload } from '../../types/video';
import { createSMAIVideo, pollSMAIVideoStatus, querySMAIVideoStatus } from './createVideo';

vi.mock('debug', () => ({
  default: vi.fn(() => vi.fn()),
}));

describe('createSMAIVideo', () => {
  const mockOptions: CreateVideoOptions = {
    apiKey: 'test-api-key',
    baseURL: 'https://api.smai.ai/v1',
    provider: 'smai',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create video with basic prompt', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'smai-task-123' }),
    });

    const payload: CreateVideoPayload = {
      model: 'doubao-seedance-2-0-260128',
      params: {
        prompt: 'A beautiful sunset over the ocean',
      },
    };

    const result = await createSMAIVideo(payload, mockOptions);

    expect(fetch).toHaveBeenCalledWith(
      'https://api.smai.ai/v1/video',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
      }),
    );
    expect(result).toEqual({ inferenceId: 'smai-task-123' });
  });

  it('should include content array with text', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'smai-task-text' }),
    });

    const payload: CreateVideoPayload = {
      model: 'doubao-seedance-2-0-260128',
      params: {
        prompt: 'Dancing robot',
      },
    };

    await createSMAIVideo(payload, mockOptions);

    const body = JSON.parse((global.fetch as any).mock.calls[0][1].body);
    expect(body.content).toEqual([{ text: 'Dancing robot', type: 'text' }]);
    expect(body.model).toBe('doubao-seedance-2-0-260128');
  });

  it('should include imageUrl as first_frame in content', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'smai-task-img' }),
    });

    const payload: CreateVideoPayload = {
      model: 'doubao-seedance-2-0-260128',
      params: {
        prompt: 'Animate this image',
        imageUrl: 'https://example.com/image.jpg',
      },
    };

    await createSMAIVideo(payload, mockOptions);

    const body = JSON.parse((global.fetch as any).mock.calls[0][1].body);
    expect(body.content).toEqual([
      { text: 'Animate this image', type: 'text' },
      {
        image_url: { url: 'https://example.com/image.jpg' },
        role: 'first_frame',
        type: 'image_url',
      },
    ]);
  });

  it('should include endImageUrl as last_frame in content', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'smai-task-end' }),
    });

    const payload: CreateVideoPayload = {
      model: 'doubao-seedance-2-0-260128',
      params: {
        prompt: 'Transition video',
        imageUrl: 'https://example.com/start.jpg',
        endImageUrl: 'https://example.com/end.jpg',
      },
    };

    await createSMAIVideo(payload, mockOptions);

    const body = JSON.parse((global.fetch as any).mock.calls[0][1].body);
    expect(body.content).toHaveLength(3);
    expect(body.content[1]).toEqual({
      image_url: { url: 'https://example.com/start.jpg' },
      role: 'first_frame',
      type: 'image_url',
    });
    expect(body.content[2]).toEqual({
      image_url: { url: 'https://example.com/end.jpg' },
      role: 'last_frame',
      type: 'image_url',
    });
  });

  it('should include all optional parameters', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'smai-task-full' }),
    });

    const payload: CreateVideoPayload = {
      model: 'doubao-seedance-2-0-260128',
      params: {
        prompt: 'Full params video',
        aspectRatio: '16:9',
        duration: 8,
        generateAudio: true,
        seed: 42,
        resolution: '720p',
        cameraFixed: true,
      },
    };

    await createSMAIVideo(payload, mockOptions);

    const body = JSON.parse((global.fetch as any).mock.calls[0][1].body);
    expect(body.ratio).toBe('16:9');
    expect(body.duration).toBe(8);
    expect(body.generate_audio).toBe(true);
    expect(body.seed).toBe(42);
    expect(body.resolution).toBe('720p');
    expect(body.camera_fixed).toBe(true);
  });

  it('should not include undefined optional parameters', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'smai-task-minimal' }),
    });

    const payload: CreateVideoPayload = {
      model: 'doubao-seedance-2-0-260128',
      params: {
        prompt: 'Minimal params',
      },
    };

    await createSMAIVideo(payload, mockOptions);

    const body = JSON.parse((global.fetch as any).mock.calls[0][1].body);
    expect(body.ratio).toBeUndefined();
    expect(body.duration).toBeUndefined();
    expect(body.generate_audio).toBeUndefined();
    expect(body.seed).toBeUndefined();
    expect(body.resolution).toBeUndefined();
    expect(body.camera_fixed).toBeUndefined();
  });

  it('should throw on HTTP error', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'Invalid request',
    });

    const payload: CreateVideoPayload = {
      model: 'doubao-seedance-2-0-260128',
      params: { prompt: 'Test' },
    };

    await expect(createSMAIVideo(payload, mockOptions)).rejects.toThrow(
      'SMAI video API error: 400 Invalid request',
    );
  });

  it('should throw when response missing id', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const payload: CreateVideoPayload = {
      model: 'doubao-seedance-2-0-260128',
      params: { prompt: 'Test' },
    };

    await expect(createSMAIVideo(payload, mockOptions)).rejects.toThrow(
      'Invalid response: missing task id',
    );
  });

  it('should use default baseURL when not provided', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'smai-default-url' }),
    });

    const payload: CreateVideoPayload = {
      model: 'doubao-seedance-2-0-260128',
      params: { prompt: 'Test' },
    };

    await createSMAIVideo(payload, { ...mockOptions, baseURL: '' });

    expect(fetch).toHaveBeenCalledWith('https://api.smai.ai/v1/video', expect.any(Object));
  });
});

describe('pollSMAIVideoStatus', () => {
  const options = {
    apiKey: 'test-key',
    baseURL: 'https://api.smai.ai/v1',
  };

  it('should return success when status is completed', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'completed',
        output: { video_url: 'https://cdn.smai.ai/video.mp4' },
      }),
    });

    const result = await pollSMAIVideoStatus('task-123', options);

    expect(result).toEqual({
      status: 'success',
      videoUrl: 'https://cdn.smai.ai/video.mp4',
    });
  });

  it('should return success when status is succeed', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'succeed',
        output: { video_url: 'https://cdn.smai.ai/video2.mp4' },
      }),
    });

    const result = await pollSMAIVideoStatus('task-456', options);

    expect(result).toEqual({
      status: 'success',
      videoUrl: 'https://cdn.smai.ai/video2.mp4',
    });
  });

  it('should return failed when status is failed', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'failed',
        error: { message: 'Content policy violation' },
      }),
    });

    const result = await pollSMAIVideoStatus('task-123', options);

    expect(result).toEqual({
      status: 'failed',
      error: 'Content policy violation',
    });
  });

  it('should return pending when status is processing', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'processing' }),
    });

    const result = await pollSMAIVideoStatus('task-123', options);

    expect(result).toEqual({ status: 'pending' });
  });

  it('should return failed when completed but no video URL', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'completed',
        output: {},
      }),
    });

    const result = await pollSMAIVideoStatus('task-123', options);

    expect(result).toEqual({
      status: 'failed',
      error: 'Task succeeded but no video URL found',
    });
  });

  it('should return pending for unknown status', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'queued' }),
    });

    const result = await pollSMAIVideoStatus('task-123', options);

    expect(result).toEqual({ status: 'pending' });
  });
});

describe('querySMAIVideoStatus', () => {
  it('should query status endpoint', async () => {
    const mockResponse = {
      status: 'processing',
      id: 'task-123',
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await querySMAIVideoStatus('task-123', {
      apiKey: 'test-key',
      baseURL: 'https://api.smai.ai/v1',
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://api.smai.ai/v1/video/task-123',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        },
      }),
    );
    expect(result).toEqual(mockResponse);
  });

  it('should throw on HTTP error', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => 'Task not found',
    });

    await expect(
      querySMAIVideoStatus('invalid-task', {
        apiKey: 'test-key',
        baseURL: 'https://api.smai.ai/v1',
      }),
    ).rejects.toThrow('SMAI video status API error: 404 Task not found');
  });
});
