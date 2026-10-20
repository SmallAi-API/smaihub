import debug from 'debug';

import { getDevDockAccess } from '@/business/server/devDockAccess';
import { businessConfigEndpoints } from '@/business/server/lambda-routers/config';
import { publicProcedure, router } from '@/libs/trpc/lambda';
import { getServerFeatureFlagsStateFromRuntimeConfig } from '@/server/featureFlags';
import { getServerDefaultAgentConfig, getServerGlobalConfig } from '@/server/globalConfig';
import { getBillboard, getInitialBillboard } from '@/server/services/billboard';
import { type GlobalRuntimeConfig } from '@/types/serverConfig';

const log = debug('config-router');

export const configRouter = router({
  getBillboard: publicProcedure.query(() => getBillboard()),
  getDefaultAgentConfig: publicProcedure.query(async () => {
    return getServerDefaultAgentConfig();
  }),

  getGlobalConfig: publicProcedure.query(async ({ ctx }): Promise<GlobalRuntimeConfig> => {
    log('[GlobalConfig] Starting global config retrieval for user:', ctx.userId || 'anonymous');

    const [serverConfig, serverFeatureFlags, billboard, businessDevDockAccess] = await Promise.all([
      getServerGlobalConfig(),
      getServerFeatureFlagsStateFromRuntimeConfig(ctx.userId || undefined),
      getInitialBillboard(),
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
