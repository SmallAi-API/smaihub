import type { UpdateChannel } from '@lobechat/electron-client-ipc';

import { isDev } from '@/const/env';
import { getDesktopEnv } from '@/env';

const normalizeEnvValue = (value: string | undefined) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
};

const runtimeEnv = getDesktopEnv();

// Preserve the build identity separately from the stable-only update policy.
const rawChannel =
  normalizeEnvValue(runtimeEnv.UPDATE_CHANNEL) ||
  normalizeEnvValue(process.env.UPDATE_CHANNEL) ||
  'stable';
/** Raw build channel for display (stable, nightly, canary, beta) */
export const BUILD_CHANNEL: string = rawChannel;
export const UPDATE_CHANNEL: UpdateChannel = 'stable';
/** Legacy preferences and build overrides must not opt this app into prereleases. */
export const coerceStoredUpdateChannel = (_channel?: string | null): UpdateChannel =>
  UPDATE_CHANNEL;

// S3 base URL for all channels
// e.g., https://releases.lobehub.com
// Each channel resolves to {base}/{channel}/
export const UPDATE_SERVER_URL =
  normalizeEnvValue(runtimeEnv.UPDATE_SERVER_URL) ||
  normalizeEnvValue(process.env.UPDATE_SERVER_URL);

export const updaterConfig = {
  app: {
    autoCheckUpdate: true,
    autoDownloadUpdate: true,
    checkUpdateInterval: 60 * 60 * 1000, // 1 hour
  },
  enableAppUpdate: !isDev,
};

export const getSparkleFeedUrl = (baseUrl: string, channel: UpdateChannel) =>
  `${baseUrl.replace(/\/(stable|nightly|canary|beta)\/?$/, '').replace(/\/$/, '')}/${channel}/appcast-${process.arch}.xml`;
