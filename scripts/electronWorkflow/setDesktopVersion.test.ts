import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('fs-extra', () => ({
  default: {
    copyFileSync: vi.fn(),
    existsSync: vi.fn(() => true),
    readJSONSync: vi.fn(() => ({ name: 'old', productName: 'old', version: '0.0.0' })),
    writeJsonSync: vi.fn(),
  },
}));

const originalArgv = process.argv;

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv('DESKTOP_PRODUCT_NAME', undefined);
  vi.stubEnv('DESKTOP_PACKAGE_NAME', undefined);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(process, 'exit').mockImplementation((code) => {
    throw new Error(`Exit ${code}`);
  });
});

afterEach(() => {
  process.argv = originalArgv;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('desktop release identity', () => {
  it.each([
    ['stable', 'smai.ai', 'smai.ai-desktop'],
    ['beta', 'smai.ai-Beta', 'smai.ai-desktop-beta'],
    ['nightly', 'smai.ai-Nightly', 'smai.ai-desktop-nightly'],
    ['canary', 'smai.ai', 'smai.ai-desktop-canary'],
  ])('writes the smai identity for %s', async (channel, productName, name) => {
    process.argv = ['node', 'setDesktopVersion.ts', '1.6.9', channel];

    await import('./setDesktopVersion');

    expect(fs.writeJsonSync).toHaveBeenCalledWith(
      expect.stringContaining('package.json'),
      { name, productName, version: '1.6.9' },
      { spaces: 2 },
    );
  });

  it('preserves the existing package name for an explicit smai.ai product name', async () => {
    vi.stubEnv('DESKTOP_PRODUCT_NAME', 'smai.ai');
    process.argv = ['node', 'setDesktopVersion.ts', '1.6.9', 'stable'];

    await import('./setDesktopVersion');

    expect(fs.writeJsonSync).toHaveBeenCalledWith(
      expect.any(String),
      { name: 'smai.ai-desktop', productName: 'smai.ai', version: '1.6.9' },
      { spaces: 2 },
    );
  });

  it('honors explicit distribution overrides', async () => {
    vi.stubEnv('DESKTOP_PRODUCT_NAME', 'Acme');
    vi.stubEnv('DESKTOP_PACKAGE_NAME', 'acme-client');
    process.argv = ['node', 'setDesktopVersion.ts', '1.6.9', 'beta'];

    await import('./setDesktopVersion');

    expect(fs.writeJsonSync).toHaveBeenCalledWith(
      expect.any(String),
      { name: 'acme-client-beta', productName: 'Acme-Beta', version: '1.6.9' },
      { spaces: 2 },
    );
  });

  it('rejects unknown channels before writing the manifest', async () => {
    process.argv = ['node', 'setDesktopVersion.ts', '1.6.9', 'unknown'];

    await expect(import('./setDesktopVersion')).rejects.toThrow('Exit 1');
    expect(fs.writeJsonSync).not.toHaveBeenCalled();
  });
});
