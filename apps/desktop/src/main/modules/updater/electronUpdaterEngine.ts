import log from 'electron-log';
import { autoUpdater } from 'electron-updater';

import { isDev, isWindows } from '@/const/env';
import { getDesktopEnv } from '@/env';

import { UPDATE_SERVER_URL } from './configs';
import type { UpdateEngine } from './engine';

autoUpdater.autoInstallOnAppQuit = false;

const UPDATE_SERVER_NOT_CONFIGURED =
  'Update server is not configured. Set UPDATE_SERVER_URL to enable updates.';

/** False when there is no feed to check; the GitHub fallback is disabled on purpose. */
let feedConfigured = true;

export const electronUpdaterEngine: UpdateEngine = {
  checkForUpdates: () =>
    feedConfigured
      ? autoUpdater.checkForUpdates()
      : Promise.reject(new Error(UPDATE_SERVER_NOT_CONFIGURED)),
  configure: (channel) => {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;
    autoUpdater.forceDevUpdateConfig = isDev || getDesktopEnv().FORCE_DEV_UPDATE_CONFIG;
    autoUpdater.allowPrerelease = channel !== 'stable';
    if (isWindows) {
      // Use full NSIS package updates to avoid stale blockmap lookups from previous providers.
      const windowsUpdater = autoUpdater as typeof autoUpdater & {
        disableDifferentialDownload?: boolean;
        disableWebInstaller?: boolean;
      };
      windowsUpdater.disableDifferentialDownload = true;
      windowsUpdater.disableWebInstaller = true;
    }
    feedConfigured = true;
    if (!autoUpdater.forceDevUpdateConfig) {
      const baseUrl = UPDATE_SERVER_URL?.replace(/\/(stable|nightly|canary|beta)\/?$/, '').replace(
        /\/$/,
        '',
      );
      autoUpdater.channel = channel;
      if (baseUrl) {
        autoUpdater.setFeedURL({ provider: 'generic', url: `${baseUrl}/${channel}` });
      } else {
        // Never fall back to the upstream GitHub releases: this fork ships its own builds.
        feedConfigured = false;
      }
    }
    // The channel setter mutates this flag. Windows/Linux retain rollback support.
    autoUpdater.allowDowngrade = true;
  },
  downloadUpdate: () => autoUpdater.downloadUpdate(),
  installOnQuit: () => {
    autoUpdater.autoInstallOnAppQuit = true;
  },
  kind: 'electron-updater',
  on: (event, listener) => {
    autoUpdater.on(event, listener as (...args: any[]) => void);
  },
  quitAndInstall: () => autoUpdater.quitAndInstall(true, true),
};
