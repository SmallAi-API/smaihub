import { Client } from '@upstash/qstash';
import { serve } from '@upstash/workflow/nextjs';
import debug from 'debug';

import { getServerDB } from '@/database/core/db-adaptor';
import { executeDispatch } from '@/server/services/cronDispatcher';

const log = debug('api-route:cron-dispatcher');

const headers = {
  ...(process.env.VERCEL_AUTOMATION_BYPASS_SECRET && {
    'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
  }),
};

/**
 * Cron Dispatcher Workflow
 *
 * Triggered by QStash Cron Schedule (every minute).
 * Scans enabled cron jobs, identifies those due for execution,
 * and dispatches each via QStash → /api/agent.
 *
 * Setup in Upstash Console:
 *   Destination: {APP_URL}/api/workflows/cron-dispatcher
 *   Schedule:    * * * * *
 */
export const { POST } = serve(
  async (context) => {
    const result = await context.run('cron:dispatch', async () => {
      const db = await getServerDB();
      return executeDispatch(db);
    });

    log('Cron dispatch result: %O', result);

    return result;
  },
  {
    flowControl: {
      key: 'cron-dispatcher',
      parallelism: 1,
      ratePerSecond: 1,
    },
    qstashClient: new Client({
      headers,
      token: process.env.QSTASH_TOKEN!,
    }),
  },
);
