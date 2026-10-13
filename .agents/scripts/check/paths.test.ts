import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { exists, existsInRepo, getConfig, mountDir, rootDir, setConfig } from './paths';

describe('check paths', () => {
  it('requires configuration before resolving the root', () => {
    expect(() => getConfig()).toThrow('Check configuration has not been initialized');
  });

  it('resolves host and mounted paths using the current configuration', () => {
    const root = path.resolve('test-host');
    const host = { dir: '', pipelines: [] };
    const mounted = { dir: 'vendor/sub', pipelines: [] };
    const config = { repos: [host, mounted], rootDir: root };
    setConfig(config);
    expect(getConfig()).toBe(config);
    expect(rootDir()).toBe(root);
    expect(mountDir(host)).toBe(root);
    expect(mountDir(mounted)).toBe(path.join(root, 'vendor/sub'));

    const nextRoot = path.resolve('another-host');
    setConfig({ ...config, rootDir: nextRoot });
    expect(mountDir(mounted)).toBe(path.join(nextRoot, 'vendor/sub'));
  });

  it('checks existing and missing files relative to the configured repository', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'check-paths-'));
    try {
      setConfig({ repos: [{ dir: '', pipelines: [] }], rootDir: root });
      const file = path.join(root, 'present.txt');
      await writeFile(file, 'present');
      expect(await exists(file)).toBe(true);
      expect(await existsInRepo('present.txt')).toBe(true);
      expect(await exists(path.join(root, 'missing.txt'))).toBe(false);
      expect(await existsInRepo('missing.txt')).toBe(false);
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });
});
