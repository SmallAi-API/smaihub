import type { BuiltinToolContext, BuiltinToolResult, DeviceListItem } from '@lobechat/types';
import { BaseExecutor } from '@lobechat/types';

import { deviceService } from '@/services/device';

import {
  RemoteDeviceExecutionRuntime,
  type RemoteDeviceRuntimeService,
} from '../../ExecutionRuntime';
import { type DeviceAttachment } from '../../ExecutionRuntime/types';
import {
  type ActivateDeviceParams,
  RemoteDeviceApiName,
  RemoteDeviceIdentifier,
} from '../../types';

/**
 * Map a client `device.listDevices` row to the `DeviceAttachment` shape the
 * runtime + renderers expect. `hostname` / `platform` are nullable on the
 * client list item but required by `DeviceAttachment`, so fall back to a
 * stable value (friendly name, then the id) rather than emitting `null`.
 */
const toDeviceAttachment = (d: DeviceListItem): DeviceAttachment => ({
  deviceId: d.deviceId,
  hostname: d.hostname ?? d.friendlyName ?? d.deviceId,
  lastSeen: d.lastSeen,
  online: d.online,
  platform: d.platform ?? 'unknown',
});

/**
 * Client-side device service. Mirrors the server runtime's `queryDeviceList`,
 * but sources devices from the `device.listDevices` tRPC query (the same
 * chokepoint the device store uses) instead of the server-only `deviceGateway`.
 * The runtime filters `online` itself, so returning the full list is fine.
 */
class ClientRemoteDeviceService implements RemoteDeviceRuntimeService {
  async queryDeviceList(): Promise<DeviceAttachment[]> {
    const devices = await deviceService.listDevices();
    return devices.map(toDeviceAttachment);
  }
}

/**
 * Remote Device Client Executor
 *
 * Handles `lobe-remote-device` tool calls on the client side (desktop's local
 * agent runtime). Reuses `RemoteDeviceExecutionRuntime` so the output matches
 * the server runtime exactly; only the device source differs (tRPC vs gateway).
 */
class RemoteDeviceExecutor extends BaseExecutor<typeof RemoteDeviceApiName> {
  readonly identifier = RemoteDeviceIdentifier;
  protected readonly apiEnum = RemoteDeviceApiName;

  private runtime = new RemoteDeviceExecutionRuntime(new ClientRemoteDeviceService());

  listOnlineDevices = async (
    _params: unknown,
    _ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    const result = await this.runtime.listOnlineDevices();
    return this.toResult(result);
  };

  activateDevice = async (
    params: ActivateDeviceParams,
    _ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    const result = await this.runtime.activateDevice(params);
    return this.toResult(result);
  };

  /**
   * Convert BuiltinServerRuntimeOutput to BuiltinToolResult. Preserve `state`
   * regardless of `success` so renderers can keep showing partial output, and
   * never propagate an undefined `content`.
   */
  private toResult(output: {
    content: string;
    error?: any;
    state?: any;
    success: boolean;
  }): BuiltinToolResult {
    if (!output.success) {
      return {
        content: output.content,
        error: {
          body: output.error,
          message: output.content || 'Unknown error',
          type: 'PluginServerError',
        },
        state: output.state,
        success: false,
      };
    }

    return { content: output.content, state: output.state, success: true };
  }
}

// Export the executor instance for registration
export const remoteDeviceExecutor = new RemoteDeviceExecutor();
