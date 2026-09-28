import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const workflowPath = new URL('../workflows/release-desktop-core-ota.yml', import.meta.url);
const publishActionPath = new URL(
  '../actions/desktop-publish-core-ota/action.yml',
  import.meta.url,
);

test('retries transient COS timeouts while loading the shipped shell.json', async () => {
  const source = await readFile(workflowPath, 'utf8');
  const fetchBlockStart = source.indexOf('HTTP_STATUS=$(curl');
  const fetchBlockEnd = source.indexOf('echo "shell.json HTTP status:', fetchBlockStart);
  const fetchBlock = source.slice(fetchBlockStart, fetchBlockEnd);

  assert.notEqual(fetchBlockStart, -1, 'shell.json fetch must remain explicit');
  assert.ok(fetchBlockEnd > fetchBlockStart, 'shell.json fetch block must have a status check');
  assert.match(fetchBlock, /--retry 4/);
  assert.match(fetchBlock, /--retry-delay 5/);
  assert.match(fetchBlock, /--retry-max-time 120/);
  assert.match(fetchBlock, /--retry-connrefused/);
  assert.match(fetchBlock, /--connect-timeout 20/);
  assert.match(fetchBlock, /--max-time 60/);
  assert.match(fetchBlock, /shell\.json/);
});

test('falls back to the repo commit when no business overlay is configured', async () => {
  const source = await readFile(workflowPath, 'utf8');
  assert.doesNotMatch(source, /CLOUD_REPOSITORY:\?/);
  assert.match(source, /cloud_ref=\$GITHUB_SHA/);
});

test('builds cores only for platforms that ship a shell', async () => {
  const source = await readFile(workflowPath, 'utf8');
  assert.match(source, /platform: \[darwin, win32\]/);
});

test('configures COS compatibility before uploading the core release', async () => {
  const source = await readFile(publishActionPath, 'utf8');
  const configIndex = source.indexOf('aws configure set default.s3.addressing_style virtual');
  const firstUpload = source.indexOf('aws s3 ');

  assert.notEqual(configIndex, -1);
  assert.ok(configIndex < firstUpload, 'COS config must run before the first aws s3 call');
  assert.match(source, /default\.s3\.payload_signing_enabled true/);
});
