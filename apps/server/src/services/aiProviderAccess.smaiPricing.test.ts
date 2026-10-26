import { ssrfSafeFetch } from '@lobechat/ssrf-safe-fetch';
import type { AiProviderRuntimeState } from 'model-bank';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getUserScopedAiProviderRuntimeState } from './aiProviderAccess';

const getHiddenModels = vi.hoisted(() =>
  vi.fn(async (): Promise<{ id: string; providerId: string }[] | undefined> => []),
);

vi.mock('@lobechat/ssrf-safe-fetch', () => ({ ssrfSafeFetch: vi.fn() }));
vi.mock('@/business/server/aiProvider', () => ({
  getHiddenBuiltinModelsForUser: getHiddenModels,
  getModelRedirects: vi.fn(async () => ({})),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('automatic SMAI prices in runtime state', () => {
  it('replaces saved legacy prices when loading models without fetching the model list', async () => {
    const oldPricing = {
      units: [
        {
          name: 'textInput' as const,
          rate: 75,
          strategy: 'fixed' as const,
          unit: 'millionTokens' as const,
        },
        {
          name: 'textOutput' as const,
          rate: 150,
          strategy: 'fixed' as const,
          unit: 'millionTokens' as const,
        },
      ],
    };
    const state: AiProviderRuntimeState = {
      enabledAiModels: [
        {
          abilities: {},
          enabled: true,
          id: 'gpt-6.1-sol',
          pricing: oldPricing,
          providerId: 'smai',
          type: 'chat',
        },
      ],
      enabledAiProviders: [{ id: 'smai', source: 'builtin' }],
      enabledChatAiProviders: [{ id: 'smai', source: 'builtin' }],
      enabledImageAiProviders: [],
      enabledVideoAiProviders: [],
      runtimeConfig: {
        smai: {
          config: {},
          keyVaults: { baseURL: 'https://auto-pricing.smai.test/v1' },
          settings: {},
        },
      },
    };
    vi.mocked(ssrfSafeFetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              billing_expr: 'tier("默认", p * 2 + c * 10)',
              billing_mode: 'tiered_expr',
              completion_ratio: 2,
              enable_groups: ['default'],
              model_name: 'gpt-6.1-sol',
              model_ratio: 37.5,
              quota_type: 0,
            },
          ],
          success: true,
        }),
      ),
    );

    const result = await getUserScopedAiProviderRuntimeState('test-user', async () => state);

    expect(result.enabledAiModels[0].pricing?.units).toContainEqual({
      name: 'textInput',
      rate: 2,
      strategy: 'fixed',
      unit: 'millionTokens',
    });
    expect(result.enabledAiModels[0].pricing?.units).toContainEqual({
      name: 'textOutput',
      rate: 10,
      strategy: 'fixed',
      unit: 'millionTokens',
    });
    expect(state.enabledAiModels[0].pricing).toBe(oldPricing);
    expect(result.enabledAiModels[0].enabled).toBe(true);
    expect(ssrfSafeFetch).toHaveBeenCalledTimes(1);
    expect(vi.mocked(ssrfSafeFetch).mock.calls[0][0]).toBe(
      'https://auto-pricing.smai.test/api/pricing',
    );
  });

  it.each(['disabled', 'hidden', 'unresolved'])(
    'does not request pricing for %s SMAI access',
    async (access) => {
      const state: AiProviderRuntimeState = {
        enabledAiModels: [{ abilities: {}, id: 'gpt-6.1-sol', providerId: 'smai', type: 'chat' }],
        enabledAiProviders: access === 'disabled' ? [] : [{ id: 'smai', source: 'builtin' }],
        enabledChatAiProviders: [],
        enabledImageAiProviders: [],
        enabledVideoAiProviders: [],
        runtimeConfig: {},
      };
      getHiddenModels.mockResolvedValueOnce(
        access === 'unresolved'
          ? undefined
          : access === 'hidden'
            ? [{ id: 'gpt-6.1-sol', providerId: 'smai' }]
            : [],
      );

      const result = await getUserScopedAiProviderRuntimeState('test-user', async () => state);

      expect(ssrfSafeFetch).not.toHaveBeenCalled();
      if (access !== 'disabled') expect(result.enabledAiModels).toEqual([]);
    },
  );
});
