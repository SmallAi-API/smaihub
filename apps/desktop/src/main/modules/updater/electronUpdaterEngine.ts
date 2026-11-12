import log from 'electron-log';
import { autoUpdater } from 'electron-updater';

import { isDev, isWindows } from '@/const/env';
import { getDesktopEnv } from '@/env';
import type { LogLevel } from '@/utils/structuredLog';
import { writeStructuredLog } from '@/utils/structuredLog';

import { UPDATE_SERVER_URL } from './configs';
import type { UpdateEngine } from './engine';

autoUpdater.autoInstallOnAppQuit = false;

/**
 * electron-updater's own lines keep going to `main.log` (the update-test docs
 * grep it) and also reach `main.jsonl` with the rest of the main process.
 */
const toUpdaterLogger = (level: LogLevel) => (message?: unknown) => {
  log[level](message);
  writeStructuredLog({ level, message, ns: 'electron-updater', process: 'main' });
};
const updaterLogger = {
  debug: toUpdaterLogger('debug'),
  error: toUpdaterLogger('error'),
  info: toUpdaterLogger('info'),
  warn: toUpdaterLogger('warn'),
};

export const electronUpdaterEngine: UpdateEngine = {
  checkForUpdates: () =>
    feedConfigured
      ? autoUpdater.checkForUpdates()
      : Promise.reject(new Error(UPDATE_SERVER_NOT_CONFIGURED)),
  configure: (channel) => {
    log.transports.file.level = 'info';
    autoUpdater.logger = updaterLogger;
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
  isActive: () => autoUpdater.isUpdaterActive(),
  kind: 'electron-updater',
  on: (event, listener) => {
    autoUpdater.on(event, listener as (...args: any[]) => void);
  },
  quitAndInstall: () => autoUpdater.quitAndInstall(true, true),
};
