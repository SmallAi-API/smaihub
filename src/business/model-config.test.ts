import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockIsProviderModelAvailable = vi.fn();
const mockLoadModelBankModels = vi.fn();

vi.mock('model-bank', () => ({
  isProviderModelAvailable: mockIsProviderModelAvailable,
  loadModels: mockLoadModelBankModels,
  ModelProvider: { LobeHub: 'lobehub', SMAI: 'smai' },
}));

const { isLobeHubModelAvailable } = await import('@lobechat/business-model-bank/model-config');

describe('business model config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should report a model as available when it exists in the branding provider model bank', async () => {
    const models = [{ enabled: true, id: 'gpt-image-2', providerId: 'smai', type: 'image' }];
    mockLoadModelBankModels.mockResolvedValue(models);
    mockIsProviderModelAvailable.mockReturnValue(true);

    await expect(isLobeHubModelAvailable('gpt-image-2', 'image')).resolves.toBe(true);

    expect(mockLoadModelBankModels).toHaveBeenCalledOnce();
    expect(mockIsProviderModelAvailable).toHaveBeenCalledWith(
      models,
      'smai',
      'gpt-image-2',
      'image',
    );
  });

  it('should report a model as unavailable when it is missing from the model bank', async () => {
    mockLoadModelBankModels.mockResolvedValue([]);
    mockIsProviderModelAvailable.mockReturnValue(false);

    await expect(isLobeHubModelAvailable('removed-model', 'image')).resolves.toBe(false);
  });
});
