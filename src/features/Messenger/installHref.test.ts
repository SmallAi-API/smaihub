import { describe, expect, it, vi } from 'vitest';

import { resolveMessengerInstallHref } from './installHref';

vi.mock('@lobechat/const', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  OFFICIAL_CLOUD_URL: 'https://lobehub.com',
  OFFICIAL_URL: 'https://app.lobehub.com',
}));

describe('resolveMessengerInstallHref', () => {
  it('keeps official cloud installs on the app login origin', () => {
    expect(resolveMessengerInstallHref('discord', 'https://lobehub.com')).toBe(
      'https://app.lobehub.com/api/agent/messenger/discord/install',
    );
    expect(resolveMessengerInstallHref('slack', 'https://lobehub.com/')).toBe(
      'https://app.lobehub.com/api/agent/messenger/slack/install',
    );
  });

  it('preserves the configured self-hosted install origin and path prefix', () => {
    expect(resolveMessengerInstallHref('slack', 'https://chat.example.com/lobe/')).toBe(
      'https://chat.example.com/lobe/api/agent/messenger/slack/install',
    );
  });

  it('builds against the desktop remote server URL and tolerates trailing slashes', () => {
    expect(resolveMessengerInstallHref('slack', 'https://app.lobehub.com/')).toBe(
      'https://app.lobehub.com/api/agent/messenger/slack/install',
    );
  });

  it('returns undefined while the origin is not resolved yet', () => {
    expect(resolveMessengerInstallHref('discord', undefined)).toBeUndefined();
    expect(resolveMessengerInstallHref('discord', '')).toBeUndefined();
  });
});
