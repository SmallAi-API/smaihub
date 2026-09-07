import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { App } from '@/core/App';
import { runWithIpcContext } from '@/utils/ipc';

import DevtoolsCtr from '../DevtoolsCtr';

const { getAppMetricsMock, getGPUFeatureStatusMock, getGPUInfoMock, ipcMainHandleMock } =
  vi.hoisted(() => ({
    getAppMetricsMock: vi.fn(),
    getGPUFeatureStatusMock: vi.fn(),
    getGPUInfoMock: vi.fn(),
    ipcMainHandleMock: vi.fn(),
  }));

vi.mock('electron', () => ({
  app: {
    getAppMetrics: getAppMetricsMock,
    getGPUFeatureStatus: getGPUFeatureStatusMock,
    getGPUInfo: getGPUInfoMock,
  },
  ipcMain: {
    handle: ipcMainHandleMock,
  },
}));

// 模拟 App 及其依赖项
const mockShow = vi.fn();
const mockRetrieveByIdentifier = vi.fn(() => ({
  show: mockShow,
}));

// 创建一个足够模拟 App 行为的对象，以满足 DevtoolsCtr 的需求
const mockApp = {
  browserManager: {
    retrieveByIdentifier: mockRetrieveByIdentifier,
  },
  // 如果 DevtoolsCtr 或其基类在构造或方法调用中使用了 app 的其他属性/方法，
  // 也需要在这里添加相应的模拟
} as unknown as App; // 使用类型断言，因为我们只模拟了部分 App 结构

describe('DevtoolsCtr', () => {
  let devtoolsCtr: DevtoolsCtr;

  beforeEach(() => {
    vi.clearAllMocks(); // 只清除 vi.fn() 创建的模拟函数的记录，不影响 IoCContainer 状态
    ipcMainHandleMock.mockClear();

    // 实例化 DevtoolsCtr。其 @IpcMethod 装饰器会执行并与真实的 IoCContainer 交互。
    devtoolsCtr = new DevtoolsCtr(mockApp);
  });

  describe('openDevtools', () => {
    it('should retrieve the devtools browser window using app.browserManager and show it', async () => {
      await devtoolsCtr.openDevtools();

      // 验证 browserManager.retrieveByIdentifier 是否以 'devtools' 参数被调用
      expect(mockRetrieveByIdentifier).toHaveBeenCalledWith('devtools');
      // 验证返回对象的 show 方法是否被调用
      expect(mockShow).toHaveBeenCalled();
    });
  });

  describe('getAppProcessMetrics', () => {
    it('should sum percentCPUUsage across all app processes', async () => {
      getAppMetricsMock.mockReturnValue([
        { cpu: { percentCPUUsage: 1.5 }, memory: { workingSetSize: 100 }, type: 'Browser' },
        { cpu: { percentCPUUsage: 2.25 }, memory: { workingSetSize: 200 }, type: 'Tab' },
        { cpu: { percentCPUUsage: 0 }, memory: { workingSetSize: 300 }, type: 'Utility' },
      ]);

      await expect(devtoolsCtr.getAppProcessMetrics()).resolves.toEqual({
        cpuPercent: 3.75,
        gpu: null,
        processes: [
          {
            cpuPercent: 1.5,
            name: null,
            pid: undefined,
            type: 'Browser',
            workingSetMB: 100 / 1024,
          },
          { cpuPercent: 2.25, name: null, pid: undefined, type: 'Tab', workingSetMB: 200 / 1024 },
          { cpuPercent: 0, name: null, pid: undefined, type: 'Utility', workingSetMB: 300 / 1024 },
        ],
        rendererResidentMB: null,
      });
    });

    it('should report the gpu process usage separately in megabytes', async () => {
      getAppMetricsMock.mockReturnValue([
        {
          cpu: { percentCPUUsage: 1.5 },
          memory: { workingSetSize: 1024 },
          pid: 1,
          type: 'Browser',
        },
        {
          cpu: { percentCPUUsage: 2.5 },
          memory: { workingSetSize: 65_536 },
          name: 'GPU Process',
          pid: 2,
          type: 'GPU',
        },
      ]);

      await expect(devtoolsCtr.getAppProcessMetrics()).resolves.toEqual({
        cpuPercent: 4,
        gpu: { cpuPercent: 2.5, memoryMB: 64 },
        processes: [
          { cpuPercent: 1.5, name: null, pid: 1, type: 'Browser', workingSetMB: 1 },
          { cpuPercent: 2.5, name: 'GPU Process', pid: 2, type: 'GPU', workingSetMB: 64 },
        ],
        rendererResidentMB: null,
      });
    });

    it('should aggregate multiple gpu processes', async () => {
      getAppMetricsMock.mockReturnValue([
        { cpu: { percentCPUUsage: 1 }, memory: { workingSetSize: 1024 }, type: 'GPU' },
        { cpu: { percentCPUUsage: 3 }, memory: { workingSetSize: 3072 }, type: 'GPU' },
      ]);

      await expect(devtoolsCtr.getAppProcessMetrics()).resolves.toMatchObject({
        cpuPercent: 4,
        gpu: { cpuPercent: 4, memoryMB: 4 },
        rendererResidentMB: null,
      });
    });

    it('should return zero when there are no process metrics', async () => {
      getAppMetricsMock.mockReturnValue([]);

      await expect(devtoolsCtr.getAppProcessMetrics()).resolves.toEqual({
        cpuPercent: 0,
        gpu: null,
        processes: [],
        rendererResidentMB: null,
      });
    });

    it('should report the resident set of the renderer that asked', async () => {
      getAppMetricsMock.mockReturnValue([
        { cpu: { percentCPUUsage: 1 }, memory: { workingSetSize: 1024 }, pid: 10, type: 'Browser' },
        { cpu: { percentCPUUsage: 2 }, memory: { workingSetSize: 8192 }, pid: 42, type: 'Tab' },
      ]);
      const sender = { getOSProcessId: () => 42 } as any;

      await expect(
        runWithIpcContext({ event: { sender } as any, sender }, () =>
          devtoolsCtr.getAppProcessMetrics(),
        ),
      ).resolves.toMatchObject({ cpuPercent: 3, gpu: null, rendererResidentMB: 8 });
    });
  });

  describe('captureMemoryDump', () => {
    it('should drive the memory-infra tracing dance over the sender debugger', async () => {
      const handlers = new Set<(event: unknown, method: string, params: unknown) => void>();
      const emit = (method: string, params?: unknown) => {
        for (const handler of handlers) handler({}, method, params);
      };
      const sendCommand = vi.fn(async (method: string) => {
        if (method === 'Tracing.end') {
          emit('Tracing.dataCollected', {
            value: [
              {
                args: { dumps: { allocators: { v8: { attrs: { size: { value: '100000' } } } } } },
                ph: 'v',
                pid: 42,
              },
            ],
          });
          emit('Tracing.tracingComplete');
        }
        return {};
      });
      const dbg = {
        attach: vi.fn(),
        detach: vi.fn(),
        isAttached: () => false,
        off: vi.fn((_: string, handler: any) => handlers.delete(handler)),
        on: vi.fn((_: string, handler: any) => handlers.add(handler)),
        sendCommand,
      };
      const sender = { debugger: dbg, getOSProcessId: () => 42 } as any;

      const dump = await runWithIpcContext({ event: { sender } as any, sender }, () =>
        devtoolsCtr.captureMemoryDump(),
      );

      expect(sendCommand.mock.calls.map(([method]) => method)).toEqual([
        'Tracing.start',
        'Tracing.requestMemoryDump',
        'Tracing.end',
      ]);
      expect(dump.processes).toHaveLength(1);
      expect(dump.processes[0]).toMatchObject({ isCaller: true, pid: 42 });
      expect(dump.processes[0].allocators[0]).toEqual({
        children: [],
        name: 'v8',
        sizeBytes: 0x10_00_00,
      });
      expect(dbg.attach).toHaveBeenCalledWith('1.3');
      expect(dbg.detach).toHaveBeenCalledOnce();
      expect(handlers.size).toBe(0);
    });
  });

  describe('getGpuStatus', () => {
    it('should expose the raw feature status record and the gl device attributes', async () => {
      getGPUFeatureStatusMock.mockReturnValue({
        gpu_compositing: 'enabled_on',
        webgpu: 'disabled_off',
      });
      getGPUInfoMock.mockResolvedValue({
        auxAttributes: {
          displayType: 'ANGLE_METAL',
          glRenderer: 'ANGLE (Apple, ANGLE Metal Renderer: Apple M4 Max)',
          glVendor: 'Google Inc. (Apple)',
          glVersion: 'OpenGL ES 3.0 (ANGLE 2.1)',
          skiaBackendType: 'GraphiteDawnMetal',
        },
        machineModelName: 'Mac',
        machineModelVersion: '16.9',
      });

      await expect(devtoolsCtr.getGpuStatus()).resolves.toEqual({
        displayType: 'ANGLE_METAL',
        featureStatus: { gpu_compositing: 'enabled_on', webgpu: 'disabled_off' },
        machineModel: 'Mac 16.9',
        renderer: 'ANGLE (Apple, ANGLE Metal Renderer: Apple M4 Max)',
        skiaBackend: 'GraphiteDawnMetal',
        vendor: 'Google Inc. (Apple)',
        version: 'OpenGL ES 3.0 (ANGLE 2.1)',
      });
      expect(getGPUInfoMock).toHaveBeenCalledWith('complete');
    });

    it('should null out attributes missing from the platform payload', async () => {
      getGPUFeatureStatusMock.mockReturnValue({});
      getGPUInfoMock.mockResolvedValue({});

      await expect(devtoolsCtr.getGpuStatus()).resolves.toEqual({
        displayType: null,
        featureStatus: {},
        machineModel: null,
        renderer: null,
        skiaBackend: null,
        vendor: null,
        version: null,
      });
    });
  });
});
