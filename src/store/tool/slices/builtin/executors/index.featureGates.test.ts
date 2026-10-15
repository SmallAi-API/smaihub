import { VideoGenerationIdentifier } from '@lobechat/builtin-tool-video-generation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { invokeExecutor } from './index';

const mocks = vi.hoisted(() => ({
  flags: {} as { enableVideoGenerationSkill?: boolean },
  invoke: vi.fn(),
}));
vi.mock('@/store/serverConfig', () => ({
  getServerConfigStoreState: () => ({ featureFlags: mocks.flags }),
}));
vi.mock('./workRegistration', () => ({ stashBuiltinToolWorkIntent: vi.fn() }));
vi.mock('./catalog', () => ({
  builtinToolExecutors: [VideoGenerationIdentifier, 'lobe-image-generation'].map((identifier) => ({
    identifier,
    hasApi: () => true,
    invoke: mocks.invoke,
  })),
}));

describe('client builtin dispatch rollout gate', () => {
  beforeEach(() => {
    mocks.flags = {};
    mocks.invoke.mockReset().mockResolvedValue({ content: 'created', success: true });
  });

  it.each([{}, { enableVideoGenerationSkill: false }])(
    'blocks resumed video calls: %j',
    async (flags) => {
      mocks.flags = flags;
      expect(
        await invokeExecutor(
          VideoGenerationIdentifier,
          'generateVideo',
          { prompt: 'sunrise' },
          { messageId: 'old-call' },
        ),
      ).toMatchObject({
        success: false,
        error: { type: 'ToolFeatureDisabled' },
      });
      expect(mocks.invoke).not.toHaveBeenCalled();
    },
  );

  it('restores calls when enabled and blocks them again after closure', async () => {
    mocks.flags = { enableVideoGenerationSkill: true };
    expect(
      await invokeExecutor(VideoGenerationIdentifier, 'generateVideo', {}, { messageId: '1' }),
    ).toMatchObject({ success: true });
    mocks.flags = { enableVideoGenerationSkill: false };
    expect(
      await invokeExecutor(VideoGenerationIdentifier, 'generateVideo', {}, { messageId: '2' }),
    ).toMatchObject({ success: false });
    expect(mocks.invoke).toHaveBeenCalledTimes(1);
  });

  it('keeps image generation executable', async () => {
    expect(
      await invokeExecutor('lobe-image-generation', 'generateImage', {}, { messageId: 'image' }),
    ).toMatchObject({ success: true });
    expect(mocks.invoke).toHaveBeenCalledTimes(1);
  });
});
