import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { parse } from 'yaml';

const loadSteps = async () =>
  parse(
    await readFile(new URL('../actions/desktop-publish-s3/action.yml', import.meta.url), 'utf8'),
  ).runs.steps;

/** Fail complete uploads at the AWS boundary without contacting a bucket. */
const FAKE_AWS = `
const fs = require('fs');
const args = process.argv.slice(2);
fs.appendFileSync(process.env.AWS_CALLS, JSON.stringify(args) + '\\n');
if (args[0] === 's3' && args[1] === 'cp') {
  const count = Number(fs.readFileSync(process.env.AWS_COUNT, 'utf8')) + 1;
  fs.writeFileSync(process.env.AWS_COUNT, String(count));
  if (count <= Number(process.env.FAIL_TIMES || 0)) {
    console.error('An error occurred (InvalidPart) when calling the CompleteMultipartUpload operation');
    process.exit(1);
  }
}
`;

const runStep = async (
  root,
  script,
  { failTimes = 0, channel = 'canary', bucket = 'fixture' } = {},
) => {
  const calls = path.join(root, 'calls.jsonl');
  const count = path.join(root, 'count');
  const output = path.join(root, 'output');
  await writeFile(calls, '');
  await writeFile(count, '0');
  await writeFile(output, '');
  await writeFile(path.join(root, 'fake-aws.cjs'), FAKE_AWS);
  // Bash functions keep the fixture portable across Linux runners and Windows Git Bash.
  const prelude = 'aws() { node ./fake-aws.cjs "$@"; }; sleep() { :; };\n';
  const shell =
    process.env.BASH ||
    (process.platform === 'win32' && existsSync('C:/Program Files/Git/bin/bash.exe')
      ? 'C:/Program Files/Git/bin/bash.exe'
      : 'bash');
  const result = spawnSync(shell, ['-e', '-o', 'pipefail', '-c', prelude + script], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      AWS_CALLS: calls,
      AWS_COUNT: count,
      CHANNEL: channel,
      FAIL_TIMES: String(failTimes),
      GITHUB_OUTPUT: output,
      S3_BUCKET: bucket,
      S3_ENDPOINT: 'https://cos.example',
      VERSION: '2.3.2-canary.2',
    },
  });
  assert.ifError(result.error);
  const invocations = (await readFile(calls, 'utf8'))
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(JSON.parse);
  return {
    result,
    invocations,
    uploads: invocations.filter(([service, command]) => service === 's3' && command === 'cp'),
    output: await readFile(output, 'utf8'),
  };
};

const withRelease = async (run) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'desktop-publish-s3-'));
  try {
    await mkdir(path.join(root, 'release'));
    await run(root);
  } finally {
    await rm(root, { force: true, recursive: true, maxRetries: 8, retryDelay: 50 });
  }
};

const assertCosConfigured = (invocations) => {
  const firstUpload = invocations.findIndex(
    ([service, command]) => service === 's3' && command === 'cp',
  );
  assert.notEqual(firstUpload, -1);
  for (const [key, value] of [
    ['default.s3.addressing_style', 'virtual'],
    ['default.s3.multipart_threshold', '512MB'],
    ['default.s3.payload_signing_enabled', 'true'],
  ]) {
    assert.ok(
      invocations
        .slice(0, firstUpload)
        .some((args) => JSON.stringify(args) === JSON.stringify(['configure', 'set', key, value])),
      `${key} must be configured before the first upload`,
    );
  }
};

test('installers upload before the core and shell.json, manifests only after them', async () => {
  const ids = (await loadSteps()).map((step) => step.id);
  const at = (id) => ids.indexOf(id);
  assert.ok(at('installers') !== -1 && at('base') !== -1 && at('manifests') !== -1);
  assert.ok(at('installers') < at('base'), 'installers must precede the core publish');
  assert.ok(at('base') < at('manifests'), 'manifests must follow the core publish');
});

test('an installer upload is COS configured and retried as a whole file, up to three attempts', async () => {
  await withRelease(async (root) => {
    await writeFile(path.join(root, 'release/LobeHub-2.3.2-canary.2-arm64.dmg'), 'dmg');
    const { run } = (await loadSteps()).find((step) => step.id === 'installers');
    const target = 's3://fixture/canary/2.3.2-canary.2/LobeHub-2.3.2-canary.2-arm64.dmg';

    const recovered = await runStep(root, run, { failTimes: 2 });
    assert.equal(recovered.result.status, 0, recovered.result.stderr);
    assertCosConfigured(recovered.invocations);
    assert.equal(recovered.uploads.length, 3);
    for (const args of recovered.uploads)
      assert.deepEqual(args, [
        's3',
        'cp',
        'release/LobeHub-2.3.2-canary.2-arm64.dmg',
        target,
        '--endpoint-url',
        'https://cos.example',
      ]);

    const exhausted = await runStep(root, run, { failTimes: 3 });
    assert.notEqual(exhausted.result.status, 0);
    assert.equal(exhausted.uploads.length, 3);
    assert.match(exhausted.result.stdout, /failed after 3 attempts/);
  });
});

for (const channel of ['stable', 'canary', 'nightly']) {
  test(`${channel} manifests retain both macOS architectures and point to the versioned installers`, async () => {
    await withRelease(async (root) => {
      const source = `${channel === 'stable' ? 'latest' : channel}-mac.yml`;
      const version = '2.3.2-canary.2';
      await writeFile(
        path.join(root, 'release', source),
        `version: ${version}\nfiles:\n  - url: app-arm64.dmg\n  - url: app-x64.dmg\n`,
      );
      await writeFile(path.join(root, 'release/app-arm64.dmg'), 'installer');
      const { run } = (await loadSteps()).find((step) => step.id === 'manifests');
      const published = await runStep(root, run, { channel, failTimes: 2 });
      assert.equal(published.result.status, 0, published.result.stderr);
      assertCosConfigured(published.invocations);
      assert.match(published.output, /published=true/);
      const names = channel === 'stable' ? ['stable-mac.yml', 'latest-mac.yml'] : [source];
      for (const name of names) {
        const content = parse(await readFile(path.join(root, 'release', name), 'utf8'));
        assert.deepEqual(
          content.files.map((file) => file.url),
          ['2.3.2-canary.2/app-arm64.dmg', '2.3.2-canary.2/app-x64.dmg'],
        );
        for (const key of [`${channel}/${name}`, `${channel}/2.3.2-canary.2/${name}`])
          assert.ok(published.uploads.some((args) => args[3] === `s3://fixture/${key}`));
      }
      assert.ok(published.uploads.length >= names.length * 2);
      for (const args of published.uploads) {
        assert.ok(args[2].endsWith('.yml'), 'the manifest step must not upload installers again');
        assert.deepEqual(args.slice(-2), ['--endpoint-url', 'https://cos.example']);
      }
    });
  });
}

test('a failed manifest upload never reports installer publication', async () => {
  await withRelease(async (root) => {
    await writeFile(path.join(root, 'release/canary.yml'), 'files:\n  - url: app.exe\n');
    const { run } = (await loadSteps()).find((step) => step.id === 'manifests');
    const exhausted = await runStep(root, run, { failTimes: 3 });
    assert.notEqual(exhausted.result.status, 0);
    assert.equal(exhausted.uploads.length, 3);
    assert.doesNotMatch(exhausted.output, /published=true/);
    assert.match(exhausted.output, /published=false/);
  });
});

test('an unconfigured bucket skips manifests without reporting publication', async () => {
  await withRelease(async (root) => {
    const { run } = (await loadSteps()).find((step) => step.id === 'manifests');
    const skipped = await runStep(root, run, { bucket: '' });
    assert.equal(skipped.result.status, 0, skipped.result.stderr);
    assert.deepEqual(skipped.invocations, []);
    assert.match(skipped.output, /published=false/);
  });
});
