// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LambdaContext } from '@/libs/trpc/lambda/context';

import { configRouter } from './index';

const mocks = vi.hoisted(() => ({
  getBillboard: vi.fn(),
  getInitialBillboard: vi.fn(),
  getServerGlobalConfig: vi.fn(),
}));
vi.mock('@/libs/trpc/lambda', async () => {
  const { trpc } = await import('@/libs/trpc/lambda/init');
  return { publicProcedure: trpc.procedure, router: trpc.router };
});
vi.mock('@/business/server/devDockAccess', () => ({ getDevDockAccess: async () => false }));
vi.mock('@/business/server/lambda-routers/config', () => ({ businessConfigEndpoints: {} }));
vi.mock('@/server/featureFlags', () => ({
  getServerFeatureFlagsStateFromRuntimeConfig: async () => ({ enableDevDock: false }),
}));
vi.mock('@/server/globalConfig', () => ({
  getServerDefaultAgentConfig: vi.fn(),
  getServerGlobalConfig: mocks.getServerGlobalConfig,
}));
vi.mock('@/server/services/billboard', () => mocks);

const caller = () => configRouter.createCaller({ userId: undefined } as LambdaContext);
beforeEach(() => {
  vi.resetAllMocks();
  mocks.getServerGlobalConfig.mockResolvedValue({ telemetry: {} });
});

describe('billboard config procedures', () => {
  it('serves an anonymous independent feed without loading unrelated global config', async () => {
    mocks.getBillboard.mockResolvedValue({ slug: 'news' });
    expect(await caller().getBillboard()).toEqual({ slug: 'news' });
    expect(mocks.getServerGlobalConfig).not.toHaveBeenCalled();
  });

  it('preserves null withdrawals and exposes feed failures as errors for client retry', async () => {
    mocks.getBillboard.mockResolvedValue(null);
    expect(await caller().getBillboard()).toBeNull();
    mocks.getBillboard.mockRejectedValue(new Error('Billboard is temporarily unavailable'));
    await expect(caller().getBillboard()).rejects.toThrow('Billboard is temporarily unavailable');
  });

  it('hydrates the initial announcement alongside the rest of the config', async () => {
    mocks.getInitialBillboard.mockResolvedValue({ slug: 'news' });
    expect(await caller().getGlobalConfig()).toMatchObject({
      billboard: { slug: 'news' },
      serverConfig: { telemetry: {} },
    });
  });

  it('still loads global settings when initial announcement retrieval failed', async () => {
    mocks.getInitialBillboard.mockResolvedValue(null);
    expect(await caller().getGlobalConfig()).toMatchObject({
      billboard: null,
      serverConfig: { telemetry: {} },
    });
  });
});
