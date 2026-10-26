import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type App } from '@/core/App';

import UpdaterCtr from '../UpdaterCtr';

vi.mock('@/modules/updater/configs', () => ({
  UPDATE_CHANNEL: 'stable',
}));

const { ipcMainHandleMock } = vi.hoisted(() => ({
  ipcMainHandleMock: vi.fn(),
}));

vi.mock('electron', () => ({
  ipcMain: {
    handle: ipcMainHandleMock,
  },
}));

// 模拟 App 及其依赖项
const mockCheckForUpdates = vi.fn();
const mockDownloadUpdate = vi.fn();
const mockInstallNow = vi.fn();
const mockInstallLater = vi.fn();
const mockGetUpdaterState = vi.fn();
const mockRendererSwitchChannel = vi.fn();
const mockSwitchChannel = vi.fn();
const mockStoreGet = vi.fn();
const mockStoreSet = vi.fn();

const mockApp = {
  coreUpdateManager: {
    switchChannel: mockRendererSwitchChannel,
  },
  storeManager: {
    get: mockStoreGet,
    set: mockStoreSet,
  },
  updaterManager: {
    checkForUpdates: mockCheckForUpdates,
    downloadUpdate: mockDownloadUpdate,
    getUpdaterState: mockGetUpdaterState,
    installNow: mockInstallNow,
    installLater: mockInstallLater,
    switchChannel: mockSwitchChannel,
  },
} as unknown as App;

describe('UpdaterCtr', () => {
  let updaterCtr: UpdaterCtr;

  beforeEach(() => {
    vi.clearAllMocks();
    ipcMainHandleMock.mockClear();
    mockStoreGet.mockReset();
    mockStoreSet.mockReset();
    updaterCtr = new UpdaterCtr(mockApp);
  });

  describe('checkForUpdates', () => {
    it('should call updaterManager.checkForUpdates', async () => {
      await updaterCtr.checkForUpdates();
      expect(mockCheckForUpdates).toHaveBeenCalled();
    });
  });

  describe('downloadUpdate', () => {
    it('should call updaterManager.downloadUpdate', async () => {
      await updaterCtr.downloadUpdate();
      expect(mockDownloadUpdate).toHaveBeenCalled();
    });
  });

  describe('quitAndInstallUpdate', () => {
    it('should call updaterManager.installNow', async () => {
      await updaterCtr.quitAndInstallUpdate();
      expect(mockInstallNow).toHaveBeenCalled();
    });
  });

  describe('installLater', () => {
    it('should call updaterManager.installLater', async () => {
      await updaterCtr.installLater();
      expect(mockInstallLater).toHaveBeenCalled();
    });
  });

  describe('update channel', () => {
    it('should report stable even when a legacy canary preference remains', async () => {
      mockStoreGet.mockReturnValueOnce('canary');

      await expect(updaterCtr.getUpdateChannel()).resolves.toBe('stable');
    });

    it('should return default update channel when store is empty', async () => {
      mockStoreGet.mockReturnValueOnce(undefined);

      await expect(updaterCtr.getUpdateChannel()).resolves.toBe('stable');
    });

    it('should allow stable updates', async () => {
      await updaterCtr.setUpdateChannel('stable');

      expect(mockStoreSet).toHaveBeenCalledWith('updateChannel', 'stable');
      expect(mockRendererSwitchChannel).toHaveBeenCalledWith('stable');
      expect(mockSwitchChannel).toHaveBeenCalledWith('stable');
    });

    it.each(['canary', 'nightly', 'beta'])('should reject the %s channel', async (channel) => {
      await updaterCtr.setUpdateChannel(channel as Parameters<UpdaterCtr['setUpdateChannel']>[0]);

      expect(mockStoreSet).not.toHaveBeenCalled();
      expect(mockRendererSwitchChannel).not.toHaveBeenCalled();
      expect(mockSwitchChannel).not.toHaveBeenCalled();
    });
  });

  // 测试错误处理
  describe('error handling', () => {
    it('should handle errors when checking for updates', async () => {
      const error = new Error('Network error');
      mockCheckForUpdates.mockRejectedValueOnce(error);

      // 由于控制器并未明确处理并返回错误，这里我们只验证调用发生且错误正确冒泡
      await expect(updaterCtr.checkForUpdates()).rejects.toThrow(error);
    });

    it('should handle errors when downloading updates', async () => {
      const error = new Error('Download failed');
      mockDownloadUpdate.mockRejectedValueOnce(error);

      await expect(updaterCtr.downloadUpdate()).rejects.toThrow(error);
    });
  });
});
