import { isDev } from '@/const/env';
import { getDesktopEnv } from '@/env';

const env = getDesktopEnv();

// Update channel (stable, beta, alpha, etc.)
export const UPDATE_CHANNEL = env.UPDATE_CHANNEL || 'stable';

// Determine if stable channel
export const isStableChannel = UPDATE_CHANNEL === 'stable' || !UPDATE_CHANNEL;

// Custom update server URL (for stable channel)
// e.g., https://releases.lobehub.com/stable
export const UPDATE_SERVER_URL = env.UPDATE_SERVER_URL;

// GitHub configuration (for beta/nightly channels, or as fallback)
export const githubConfig = {
  owner: 'SmallAi-API',
  repo: 'smaihub',
};

export const updaterConfig = {
  // Application update configuration
  app: {
    // Whether to auto-check for updates
    autoCheckUpdate: env.AUTO_CHECK_UPDATE ?? true,
    // Whether to auto-download updates
    autoDownloadUpdate: env.AUTO_DOWNLOAD_UPDATE ?? false,
    // Update check interval (milliseconds)
    checkUpdateInterval: env.UPDATE_CHECK_INTERVAL_MS ?? 60 * 60 * 1000, // 1 hour
  },
  // Whether to enable application updates
  enableAppUpdate: env.ENABLE_APP_UPDATE ?? !isDev,
};
