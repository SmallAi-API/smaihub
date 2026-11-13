// @vitest-environment node
import { mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { createServer, normalizePath } from 'vite';
import { expect, it } from 'vitest';

import { sharedOptimizeDeps } from './sharedRendererConfig';

it('preserves the CJK serializer dependency when the app imports an older serializer', async () => {
  const require = createRequire(import.meta.url);
  const cjkRequire = createRequire(require.resolve('remark-cjk-friendly'));
  const extensionEntry = cjkRequire.resolve('mdast-util-to-markdown-cjk-friendly');
  const extensionRequire = createRequire(extensionEntry);
  const expectedSerializer = extensionRequire.resolve('mdast-util-to-markdown');
  const root = await mkdtemp(path.join(tmpdir(), 'markdown-serializer-'));

  try {
    await symlink(path.resolve('node_modules'), path.join(root, 'node_modules'), 'junction');
    await writeFile(
      path.join(root, 'entry.js'),
      "export { toMarkdown } from 'mdast-util-to-markdown';",
    );

    const server = await createServer({
      cacheDir: path.join(root, '.vite'),
      configFile: false,
      envFile: false,
      logLevel: 'silent',
      optimizeDeps: { entries: ['entry.js'], exclude: sharedOptimizeDeps.exclude },
      root,
      server: { hmr: false, middlewareMode: true, watch: null },
    });

    try {
      const client = server.environments.client;
      await client.depsOptimizer!.init();
      await client.depsOptimizer!.scanProcessing;

      const resolved = await client.pluginContainer.resolveId(
        'mdast-util-to-markdown',
        extensionEntry,
      );

      expect(resolved?.id.split('?')[0]).toBe(normalizePath(expectedSerializer));

      const appSerializer = await client.pluginContainer.resolveId(
        'mdast-util-to-markdown',
        path.join(root, 'entry.js'),
      );

      expect(appSerializer?.id.split('?')[0]).toBe(
        normalizePath(require.resolve('mdast-util-to-markdown')),
      );
      expect(expectedSerializer).not.toBe(require.resolve('mdast-util-to-markdown'));
    } finally {
      await server.close();
    }
  } finally {
    await rm(root, { force: true, recursive: true });
  }
}, 30_000);
