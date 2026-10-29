import { describe, expect, it } from 'vitest';

import { getDeviceReconnectUrl } from './deviceReconnect';

describe('getDeviceReconnectUrl', () => {
  it.each(['device-1', '设备 & #1/desktop?other=value'])(
    'targets the smai desktop for %s',
    (deviceId) => {
      const url = new URL(getDeviceReconnectUrl(deviceId));

      expect(url.protocol).toBe('smai:');
      expect(url.hostname).toBe('device');
      expect(url.pathname).toBe('/reconnect');
      expect([...url.searchParams.entries()]).toEqual([['deviceId', deviceId]]);
      expect(url.hash).toBe('');
    },
  );
});
