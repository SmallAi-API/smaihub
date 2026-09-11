import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const workflowPath = new URL('../workflows/release-desktop-renderer-ota.yml', import.meta.url);

test('retries transient COS timeouts while loading the renderer OTA base', async () => {
  const source = await readFile(workflowPath, 'utf8');
  const fetchBlockStart = source.indexOf('HTTP_STATUS=$(curl');
  const fetchBlockEnd = source.indexOf('echo "Renderer base HTTP status:', fetchBlockStart);
  const fetchBlock = source.slice(fetchBlockStart, fetchBlockEnd);

  assert.notEqual(fetchBlockStart, -1, 'renderer base fetch must remain explicit');
  assert.ok(fetchBlockEnd > fetchBlockStart, 'renderer base fetch block must have a status check');
  assert.match(fetchBlock, /--retry 4/);
  assert.match(fetchBlock, /--retry-delay 5/);
  assert.match(fetchBlock, /--retry-max-time 120/);
  assert.match(fetchBlock, /--retry-connrefused/);
  assert.match(fetchBlock, /--connect-timeout 20/);
  assert.match(fetchBlock, /--max-time 60/);
  assert.match(fetchBlock, /base is unreachable after retries/);
  assert.match(fetchBlock, /reason=base-unreachable/);
});

test('runs the main hash gate from the locked Desktop root', async () => {
  const source = await readFile(workflowPath, 'utf8');
  assert.match(source, /pushd "\$DESKTOP_BUILD_ROOT"/);
  assert.match(source, /MAIN_HASH=\$\(node scripts\/mainHash\.mjs\)/);
});
