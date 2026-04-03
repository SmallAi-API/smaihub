export const RemoteDeviceIdentifier = 'remote-device';

export const RemoteDeviceApiName = {
  activateDevice: 'activateDevice',
  listOnlineDevices: 'listOnlineDevices',
} as const;

export type RemoteDeviceApiNameType =
  (typeof RemoteDeviceApiName)[keyof typeof RemoteDeviceApiName];
