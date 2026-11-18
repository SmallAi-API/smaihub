// @vitest-environment node
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { Window } from 'happy-dom';
import { build, createServer, optimizeDeps, resolveConfig } from 'vite';
import { expect, it, vi } from 'vitest';

import { sharedOptimizeDeps } from './sharedRendererConfig';

it('initializes CJK markdown from an unbundled UI dependency in the dev server', async () => {
  const root = path.resolve(import.meta.dirname, '../..');
  const cacheDir = await mkdtemp(path.join(root, 'node_modules/.vite-markdown-dev-test-'));
  const server = await createServer({
    cacheDir,
    configFile: false,
    logLevel: 'silent',
    optimizeDeps: {
      ...sharedOptimizeDeps,
      entries: [],
      // The root serializer is discovered elsewhere in the app. UI leaf modules
      // are served as ESM, so their CJK dependency is not discovered by the scan.
      include: [
        'mdast-util-to-markdown',
        ...sharedOptimizeDeps.include.filter((id) => id === 'remark-cjk-friendly'),
      ],
      noDiscovery: true,
    },
    root,
    server: { middlewareMode: true, watch: null, ws: false },
  });

  try {
    await server.environments.client.depsOptimizer!.init();
    // Bundle the dev server's transformed module graph, rather than resolving
    // dependencies again with Node (which would hide the browser-only failure).
    const result = await build({
      build: {
        lib: { entry: 'virtual:markdown-entry', formats: ['es'] },
        minify: false,
        write: false,
      },
      configFile: false,
      logLevel: 'silent',
      plugins: [
        {
          enforce: 'pre',
          name: 'markdown-dev-graph',
          async load(id) {
            if (id.startsWith('\0')) id = id.slice(1);
            if (id.endsWith('virtual:markdown-entry')) {
              const entry = await server.environments.client.pluginContainer.resolveId(
                'remark-cjk-friendly',
                path.join(root, 'node_modules/markdown-ui-fixture/index.js'),
              );
              return `export { default } from ${JSON.stringify(`/@fs/${entry!.id}`)};`;
            }
            return (await server.transformRequest(id))!.code;
          },
          resolveId(source, importer) {
            const url = source.startsWith('.')
              ? new URL(source, `http://localhost${importer!.slice(1)}`).pathname
              : source;
            return `\0${url}`;
          },
        },
      ],
      root,
    });
    const output = Array.isArray(result) ? result[0] : result;
    if (!('output' in output)) throw new Error('Expected a build output');
    const chunk = output.output.find((item) => item.type === 'chunk')!;
    const entry = path.join(cacheDir, 'markdown-dev.mjs');
    await writeFile(entry, chunk.code);
    vi.stubGlobal('document', new Window().document);
    const { default: remarkCjkFriendly } = await import(
      /* @vite-ignore */ pathToFileURL(entry).href
    );
    const { unified } = await import('unified');
    const { default: remarkParse } = await import('remark-parse');
    const tree = unified().use(remarkParse).use(remarkCjkFriendly).parse('中文**加粗**测试');
    expect(tree.children[0]).toMatchObject({
      children: [
        { type: 'text', value: '中文' },
        { children: [{ type: 'text', value: '加粗' }], type: 'strong' },
        { type: 'text', value: '测试' },
      ],
    });
  } finally {
    vi.unstubAllGlobals();
    await server.close();
    await rm(cacheDir, { force: true, recursive: true });
  }
});

it('initializes CJK markdown after pre-bundling with its own mdast version', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'markdown-prebundle-'));
  try {
    const modules = path.join(root, 'node_modules');
    const fixture = path.join(modules, 'markdown-fixture');
    await mkdir(fixture, { recursive: true });
    for (const name of ['unified', 'remark-cjk-friendly', 'mdast-util-to-markdown']) {
      await symlink(
        path.resolve(import.meta.dirname, '../../node_modules', name),
        path.join(modules, name),
        process.platform === 'win32' ? 'junction' : 'dir',
      );
    }
    await writeFile(
      path.join(fixture, 'package.json'),
      JSON.stringify({ name: 'markdown-fixture', type: 'module', exports: './index.js' }),
    );
    await writeFile(
      path.join(fixture, 'index.js'),
      `import { unified } from 'unified';
import remarkCjkFriendly from 'remark-cjk-friendly';
export const createProcessor = () => unified().use(remarkCjkFriendly).freeze();`,
    );
    const config = await resolveConfig(
      {
        cacheDir: path.join(root, '.vite'),
        configFile: false,
        logLevel: 'silent',
        optimizeDeps: {
          exclude: sharedOptimizeDeps.exclude,
          include: ['markdown-fixture'],
          noDiscovery: true,
        },
        root,
      },
      'serve',
    );
    const metadata = await optimizeDeps(config, true);
    const { createProcessor } = await import(
      /* @vite-ignore */ pathToFileURL(metadata.optimized['markdown-fixture'].file).href
    );
    expect(createProcessor().data()).toMatchObject({
      toMarkdownExtensions: [
        {
          handlers: { emphasis: expect.any(Function), strong: expect.any(Function) },
        },
      ],
    });
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});
