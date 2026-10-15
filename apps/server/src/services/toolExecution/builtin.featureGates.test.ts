import { ImageGenerationIdentifier } from '@lobechat/builtin-tool-image-generation';
import { VideoGenerationIdentifier } from '@lobechat/builtin-tool-video-generation';
import type { ChatToolPayload } from '@lobechat/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getServerFeatureFlagsStateFromRuntimeConfig } from '@/server/featureFlags';

import { BuiltinToolsExecutor } from './builtin';
import type { ToolExecutionContext } from './types';

const mocks = vi.hoisted(() => ({ handler: vi.fn(), flags: vi.fn() }));
vi.mock('@/server/featureFlags', () => ({
  getServerFeatureFlagsStateFromRuntimeConfig: mocks.flags,
}));
vi.mock('@/server/services/composio', () => ({ ComposioService: vi.fn() }));
vi.mock('@/server/services/market', () => ({ MarketService: vi.fn() }));
vi.mock('./serverRuntimes', () => ({
  hasServerRuntime: () => true,
  getServerRuntime: async () => ({ generateVideo: mocks.handler, generateImage: mocks.handler }),
}));

const context: ToolExecutionContext = { userId: 'user-1', toolManifestMap: {} };
const payload: ChatToolPayload = {
  apiName: 'generateVideo',
  arguments: '{"prompt":"A sunrise"}',
  id: 'restored-tool-call',
  identifier: VideoGenerationIdentifier,
  type: 'builtin',
};

describe('builtin rollout dispatch gate', () => {
  const executor = new BuiltinToolsExecutor({} as never, 'user-1');
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.flags.mockResolvedValue({ enableVideoGenerationSkill: false });
    mocks.handler.mockResolvedValue({ content: 'created', success: true });
  });

  it.each([undefined, {}, { enableVideoGenerationSkill: false }])(
    'blocks an old call regardless of its retained manifest: %j',
    async (flags) => {
      mocks.flags.mockResolvedValue(flags);
      const result = await executor.execute(payload, {
        ...context,
        toolManifestMap: {
          [VideoGenerationIdentifier]: { api: [], identifier: VideoGenerationIdentifier, meta: {} },
        },
      });
      expect(result).toMatchObject({
        success: false,
        error: { code: 'TOOL_FEATURE_DISABLED', kind: 'stop' },
      });
      expect(result.content).toContain('temporarily unavailable');
      expect(mocks.handler).not.toHaveBeenCalled();
    },
  );

  it('fails closed when the server cannot read flags', async () => {
    mocks.flags.mockRejectedValue(new Error('runtime config unavailable'));
    expect(await executor.execute(payload, context)).toMatchObject({
      success: false,
      error: { code: 'TOOL_FEATURE_DISABLED' },
    });
    expect(mocks.handler).not.toHaveBeenCalled();
  });

  it('rechecks flags on every dispatch, including after closing a rollout', async () => {
    mocks.flags.mockResolvedValueOnce({ enableVideoGenerationSkill: true });
    expect(await executor.execute(payload, context)).toMatchObject({ success: true });
    expect(await executor.execute(payload, context)).toMatchObject({
      success: false,
      error: { code: 'TOOL_FEATURE_DISABLED' },
    });
    expect(mocks.handler).toHaveBeenCalledTimes(1);
    expect(getServerFeatureFlagsStateFromRuntimeConfig).toHaveBeenCalledWith('user-1');
  });

  it('leaves image generation available without reading video flags', async () => {
    const result = await executor.execute(
      { ...payload, identifier: ImageGenerationIdentifier, apiName: 'generateImage' },
      context,
    );
    expect(result.success).toBe(true);
    expect(mocks.flags).not.toHaveBeenCalled();
    expect(mocks.handler).toHaveBeenCalledTimes(1);
  });
});
