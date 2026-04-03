import type { LobeChatDatabase } from '@lobechat/database';
import { Cron } from 'croner';
import debug from 'debug';

import { AgentCronJobModel } from '@/database/models/agentCronJob';
import { type AgentCronJob } from '@/database/schemas/agentCronJob';
import { appEnv } from '@/envs/app';
import { qstashClient } from '@/libs/qstash';

const log = debug('lobe-server:cron-dispatcher');

/**
 * Check if a cron job is due for execution based on its pattern, timezone, and last execution time.
 *
 * Uses croner to compute the most recent scheduled tick before `now`.
 * A job is due if it has never run, or its last execution predates that tick.
 */
export function isJobDue(job: AgentCronJob, now: Date): boolean {
  try {
    const cron = new Cron(job.cronPattern, { timezone: job.timezone || 'UTC' });
    const [prev] = cron.previousRuns(1, now);
    if (!prev) return false;

    // Never executed → due
    if (!job.lastExecutedAt) return true;

    // Due if last execution is before the most recent scheduled tick
    return job.lastExecutedAt < prev;
  } catch (error) {
    log('Invalid cron pattern for job %s: %s — %O', job.id, job.cronPattern, error);
    return false;
  }
}

/**
 * Resolve the base URL used to call internal API routes.
 * Prefers INTERNAL_APP_URL (server-to-server, bypasses CDN) over APP_URL.
 */
function resolveBaseUrl(): string {
  const url = appEnv.INTERNAL_APP_URL || appEnv.APP_URL;
  if (!url) throw new Error('APP_URL is required for cron dispatcher');
  return url;
}

/**
 * Query all enabled cron jobs and filter to those due for execution right now.
 */
export async function getJobsDueNow(db: LobeChatDatabase): Promise<AgentCronJob[]> {
  const enabledJobs = await AgentCronJobModel.getEnabledJobs(db);
  const now = new Date();

  const dueJobs = enabledJobs.filter((job) => isJobDue(job, now));

  log('Scanned %d enabled jobs, %d due now', enabledJobs.length, dueJobs.length);
  return dueJobs;
}

/**
 * Dispatch a single cron job execution via QStash → /api/agent.
 *
 * QStash signs the request so /api/agent can verify it via `verifyQStashSignature`.
 */
export async function dispatchJob(job: AgentCronJob): Promise<string> {
  const baseUrl = resolveBaseUrl();
  const endpoint = new URL('/api/agent', baseUrl).toString();

  log('Dispatching job %s (%s) to %s', job.id, job.name, endpoint);

  const response = await qstashClient.publishJSON({
    body: {
      agentId: job.agentId,
      autoStart: true,
      cronJobId: job.id,
      prompt: job.content,
      trigger: 'cron',
      userId: job.userId,
    },
    retries: 2,
    url: endpoint,
  });

  const messageId = 'messageId' in response ? response.messageId : `cron-${job.id}-${Date.now()}`;
  log('Dispatched job %s, QStash messageId: %s', job.id, messageId);
  return messageId;
}

/**
 * Main dispatcher entry point.
 *
 * 1. Scans for due jobs
 * 2. Dispatches each via QStash
 * 3. Updates execution statistics in DB
 *
 * Returns a summary of what was dispatched.
 */
export async function executeDispatch(
  db: LobeChatDatabase,
): Promise<{ dispatched: number; errors: number; scanned: number }> {
  const dueJobs = await getJobsDueNow(db);

  if (dueJobs.length === 0) {
    log('No jobs due — skipping');
    return { dispatched: 0, errors: 0, scanned: 0 };
  }

  let dispatched = 0;
  let errors = 0;

  for (const job of dueJobs) {
    try {
      await dispatchJob(job);
      await AgentCronJobModel.updateExecutionStats(db, job.id);
      dispatched++;
    } catch (error) {
      errors++;
      log('Failed to dispatch job %s: %O', job.id, error);
    }
  }

  log(
    'Dispatch complete: %d dispatched, %d errors out of %d due',
    dispatched,
    errors,
    dueJobs.length,
  );
  return { dispatched, errors, scanned: dueJobs.length };
}
