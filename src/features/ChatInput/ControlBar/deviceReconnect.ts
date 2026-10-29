export const getDeviceReconnectUrl = (deviceId: string): string =>
  `smai://device/reconnect?deviceId=${encodeURIComponent(deviceId)}`;
