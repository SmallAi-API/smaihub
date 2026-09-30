import { EdgeConfig } from '@lobechat/edge-config';
import debug from 'debug';

import { getDevDockAccess } from '@/business/server/devDockAccess';
import { businessConfigEndpoints } from '@/business/server/lambda-routers/config';
import { publicProcedure, router } from '@/libs/trpc/lambda';
import { getServerFeatureFlagsStateFromRuntimeConfig } from '@/server/featureFlags';
import { getServerDefaultAgentConfig, getServerGlobalConfig } from '@/server/globalConfig';
import {
  type GlobalBillboard,
  type GlobalBillboardItem,
  type GlobalRuntimeConfig,
} from '@/types/serverConfig';

const log = debug('config-router');

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeBillboardItem = (raw: unknown): GlobalBillboardItem | null => {
  if (!isObject(raw)) return null;
  if (typeof raw.title !== 'string') return null;
  if (typeof raw.description !== 'string') return null;
  return raw as unknown as GlobalBillboardItem;
};

const normalizeBillboard = (raw: unknown): GlobalBillboard | null => {
  if (!isObject(raw)) return null;
  if (typeof raw.slug !== 'string' || raw.slug.length === 0) return null;
  if (typeof raw.title !== 'string') return null;
  if (typeof raw.startAt !== 'string' || typeof raw.endAt !== 'string') return null;
  if (!Array.isArray(raw.items)) return null;

  const items = raw.items
    .map((item) => normalizeBillboardItem(item))
    .filter((item): item is GlobalBillboardItem => item !== null);

  return { ...(raw as unknown as GlobalBillboard), items };
};

const getActiveBillboard = async (): Promise<GlobalBillboard | null> => {
  // TEMP: local Billboard preview, remove before commit
  if (process.env.NODE_ENV === 'development') {
    return normalizeBillboard({
      endAt: '2099-12-31T00:00:00Z',
      i18n: { 'zh-CN': { title: '平台更新公告' } },
      id: 1,
      items: [
        {
          action: 'openFeedback',
          description: 'GPT-6.1 Sol is now available. Try it from the model switcher.',
          i18n: {
            'zh-CN': {
              description: 'GPT-6.1 Sol 现已上线，可在模型切换器中选择使用。',
              linkLabel: '反馈意见',
              title: '新模型上线：GPT-6.1 Sol',
            },
          },
          id: 1,
          title: 'New model: GPT-6.1 Sol',
        },
        {
          description: 'Recharge and plan management improvements.',
          i18n: {
            'zh-CN': {
              description: '充值与套餐管理体验优化，查看详情。',
              linkLabel: '去看看',
              title: '平台近期更新',
            },
          },
          id: 2,
          linkUrl: 'https://api.smai.ai/console/plan',
          title: 'Platform updates',
        },
      ],
      slug: 'preview-2026-09',
      startAt: '2020-01-01T00:00:00Z',
      title: 'Platform announcement',
    });
  }

  if (!EdgeConfig.isEnabled()) return null;
  try {
    const data = await new EdgeConfig().getBillboards();
    if (!data) return null;
    const normalized = normalizeBillboard(data);
    if (!normalized) {
      log('[Billboard] EdgeConfig payload failed validation, ignoring:', data);
      return null;
    }
    return normalized;
  } catch (err) {
    log('[Billboard] Failed to read from EdgeConfig:', err);
    return null;
  }
};

export const configRouter = router({
  getDefaultAgentConfig: publicProcedure.query(async () => {
    return getServerDefaultAgentConfig();
  }),

  getGlobalConfig: publicProcedure.query(async ({ ctx }): Promise<GlobalRuntimeConfig> => {
    log('[GlobalConfig] Starting global config retrieval for user:', ctx.userId || 'anonymous');

    const [serverConfig, serverFeatureFlags, billboard, businessDevDockAccess] = await Promise.all([
      getServerGlobalConfig(),
      getServerFeatureFlagsStateFromRuntimeConfig(ctx.userId || undefined),
      getActiveBillboard(),
      getDevDockAccess(ctx.userId || undefined),
    ]);

    log('[GlobalConfig] Server config retrieved');

    return {
      billboard,
      serverConfig,
      serverFeatureFlags: {
        ...serverFeatureFlags,
        enableDevDock: serverFeatureFlags.enableDevDock || businessDevDockAccess,
      },
    };
  }),

  ...businessConfigEndpoints,
});
