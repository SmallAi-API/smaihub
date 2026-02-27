import { isDev } from '@/const/env';
import { getDesktopEnv } from '@/env';

const normalizeEnvValue = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const runtimeUpdateChannel = normalizeEnvValue(getDesktopEnv().UPDATE_CHANNEL);
const buildTimeUpdateChannel = normalizeEnvValue(process.env.UPDATE_CHANNEL);

const runtimeUpdateServerUrl = normalizeEnvValue(getDesktopEnv().UPDATE_SERVER_URL);
const buildTimeUpdateServerUrl = normalizeEnvValue(process.env.UPDATE_SERVER_URL);

// Update channel (stable, beta, alpha, etc.)
export const UPDATE_CHANNEL = runtimeUpdateChannel || buildTimeUpdateChannel || 'stable';

// Determine if stable channel
export const isStableChannel = UPDATE_CHANNEL === 'stable' || !UPDATE_CHANNEL;

// Custom update server URL (for stable channel)
// e.g., https://releases.lobehub.com/stable
export const UPDATE_SERVER_URL = runtimeUpdateServerUrl || buildTimeUpdateServerUrl;

// GitHub configuration (for beta/nightly channels, or as fallback)
export const githubConfig = {
  owner: 'SmallAi-API',
  repo: 'smaihub',
};

export const updaterConfig = {
  // Application update configuration
  app: {
    // Whether to auto-check for updates
    autoCheckUpdate: true,
    // Whether to auto-download updates
    autoDownloadUpdate: false,
    // Update check interval (milliseconds)
    checkUpdateInterval: 60 * 60 * 1000, // 1 hour
  },
  // Whether to enable application updates
  enableAppUpdate: !isDev,
};
