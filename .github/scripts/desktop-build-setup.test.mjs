import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const actionPath = new URL('../actions/desktop-build-setup/action.yml', import.meta.url);

test('cleans hoisted workspace links before the isolated Desktop install', async () => {
  const source = await readFile(actionPath, 'utf8');
  const cleanup = source.indexOf('find "$packages_root"');
  const install = source.indexOf('pnpm install --frozen-lockfile');

  assert.notEqual(cleanup, -1, 'workspace node_modules cleanup must remain in the action');
  assert.notEqual(install, -1, 'Desktop install must remain frozen');
  assert.ok(cleanup < install, 'cleanup must run before the Desktop install');
  assert.match(source, /packages\/utils\/node_modules\/es-toolkit/);
  assert.match(source, /DESKTOP_BUILD_ROOT=\$desktop_root/);
  assert.match(source, /utilsRequire\.resolve\('es-toolkit'\)/);
  assert.match(source, /resolved outside Desktop installation/);
});
