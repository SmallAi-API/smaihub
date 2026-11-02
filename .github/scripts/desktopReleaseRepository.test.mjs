import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import YAML from 'yaml';

import { createGithubStore } from './desktopReleaseGithub.mjs';
import { fixtureNextOss, fixtureOss, startGithubFixture } from './desktopReleaseTestUtils.mjs';

const exec = promisify(execFile);
const cli = fileURLToPath(new URL('./desktopReleaseCli.mjs', import.meta.url));
const stable = YAML.parse(
  await readFile(new URL('../workflows/release-desktop-stable.yml', import.meta.url), 'utf8'),
);

async function fixture(t, bareTag = false) {
  const github = await startGithubFixture();
  const root = await mkdtemp(path.join(os.tmpdir(), 'desktop-repository-'));
  t.after(async () => {
    await github.close();
    await rm(root, { recursive: true, force: true });
  });
  if (bareTag) {
    github.releases.get('2.2.21').tag_name = '2.2.21';
    github.commits.set('2.2.21', fixtureOss);
  }
  const resolver = stable.jobs['check-stable'].steps.find((step) => step.id === 'cloud-ref');
  const env = {
    ...process.env,
    GITHUB_REPOSITORY: 'example/lobehub',
    GITHUB_API_URL: github.apiUrl,
    GH_TOKEN: 'oss-test-token',
    CLOUD_REPOSITORY: '',
    CLOUD_TOKEN: '',
    CLOUD_REF: '',
    RELEASE_VERSION: '2.2.21',
    RELEASE_TAG: '',
    RELEASE_MODE: resolver.env.RELEASE_MODE,
    SOURCE_REF: '',
    GITHUB_RUN_ID: '40841847688',
    GITHUB_RUN_ATTEMPT: '2',
    GITHUB_OUTPUT: path.join(root, 'outputs'),
    RUNNER_TEMP: root,
    WRITE_SOURCES: 'true',
  };
  const run = (overrides = {}) =>
    exec(process.execPath, [cli, 'resolve'], { env: { ...env, ...overrides }, cwd: root });
  return { github, root, env, run };
}

for (const bareTag of [false, true]) {
  test(`shipped Stable resolver pins repository sources without App or Cloud credentials (${bareTag ? 'bare' : 'prefixed'} tag)`, async (t) => {
    const { github, root, env, run } = await fixture(t, bareTag);
    const { stdout } = await run();
    const output = JSON.parse(stdout);
    assert.equal(output.oss_sha, fixtureOss);
    assert.equal(output.cloud_sha, fixtureOss);
    assert.equal(output.tag, bareTag ? '2.2.21' : 'v2.2.21');
    assert.equal(output.persisted, true);
    assert.equal(output.build_required, true);
    const sources = JSON.parse(
      await readFile(path.join(root, 'desktop-release-sources.json'), 'utf8'),
    );
    assert.equal(sources.selection, 'repository');
    assert.equal(sources.cloudSha, sources.ossSha);
    assert.equal(sources.evidence.runAttempt, 2);
    assert.equal(github.releases.get('2.2.21').assets.length, 1);
    await run({ WRITE_SOURCES: 'false', GITHUB_RUN_ATTEMPT: '3' });
    assert.equal(github.releases.get('2.2.21').assets.length, 1);
    assert.match(await readFile(env.GITHUB_OUTPUT, 'utf8'), /persisted=true/);
  });
}

test('repository resolution rejects a different product ref and a moved tag without rewriting its source record', async (t) => {
  const { github, run } = await fixture(t);
  await run();
  await assert.rejects(run({ SOURCE_REF: 'main' }), (error) => /target tag/.test(error.stderr));
  github.commits.set('v2.2.21', fixtureNextOss);
  await assert.rejects(run(), (error) => /source record|SHA mismatch/i.test(error.stderr));
  assert.equal(github.releases.get('2.2.21').assets.length, 1);
});

test('repository dry run resolves an existing bare tag without publishing source metadata', async (t) => {
  const { github, run } = await fixture(t, true);
  const { stdout } = await run({ WRITE_SOURCES: 'false' });
  assert.equal(JSON.parse(stdout).persisted, false);
  assert.equal(github.releases.get('2.2.21').assets.length, 0);
});

test('repository source resolution rejects an unrelated Cloud SHA', async (t) => {
  const { github, run } = await fixture(t);
  await assert.rejects(run({ CLOUD_REF: fixtureNextOss }), (error) =>
    /repository|Cloud SHA/i.test(error.stderr),
  );
  assert.equal(github.releases.get('2.2.21').assets.length, 0);
});

test('bare release lookup falls back only on 404 and keeps its real tag when writing assets', async (t) => {
  const { github } = await fixture(t, true);
  const store = createGithubStore(github.options);
  assert.equal((await store.release('2.2.21')).tag_name, '2.2.21');
  assert.equal(await store.createSources('2.2.21', { test: true }), true);
  assert.deepEqual(await store.readSources('2.2.21'), { test: true });
  github.state.error = 403;
  await assert.rejects(createGithubStore(github.options).release('2.2.21'), /403/);
});

test('a published bare Release resolves its own tag even when a prefixed release also exists', async (t) => {
  const { github, run } = await fixture(t);
  const bare = { ...github.releases.get('2.2.21'), tag_name: '2.2.21', id: 900, assets: [] };
  github.releases.set('bare-release', bare);
  github.commits.set('2.2.21', fixtureNextOss);
  const { stdout } = await run({ RELEASE_TAG: '2.2.21', WRITE_SOURCES: 'false' });
  assert.equal(JSON.parse(stdout).oss_sha, fixtureNextOss);
  assert.equal(JSON.parse(stdout).tag, '2.2.21');
});

test('Desktop workflows use the repository token and never require an overlay', async () => {
  for (const name of ['stable', 'canary', 'core-ota']) {
    const source = await readFile(
      new URL(`../workflows/release-desktop-${name}.yml`, import.meta.url),
      'utf8',
    );
    const workflow = YAML.parse(source);
    assert.doesNotMatch(
      source,
      /create-github-app-token|LOBEHUB_BOT_APP|LOBEHUB_CLOUD_TOKEN|OVERLAY_REPOSITORY/,
    );
    for (const job of Object.values(workflow.jobs)) {
      for (const step of job.steps || []) {
        if (step.uses?.startsWith('softprops/action-gh-release@')) {
          assert.equal(step.uses, 'softprops/action-gh-release@v3');
          assert.equal(step.with.token, '${{ github.token }}');
        }
        if (step.uses === './.github/actions/desktop-build-setup') {
          assert.deepEqual(Object.keys(step.with), ['node-version']);
        }
      }
    }
  }
  const action = YAML.parse(
    await readFile(new URL('../actions/desktop-build-setup/action.yml', import.meta.url), 'utf8'),
  );
  assert.deepEqual(Object.keys(action.inputs), ['node-version']);
  assert.equal(stable.jobs['publish-github'].permissions.contents, 'write');
  for (const step of stable.jobs['publish-github'].steps.filter((step) =>
    step.uses?.startsWith('softprops/action-gh-release@'),
  )) {
    assert.equal(step.with.token, '${{ github.token }}');
    assert.equal(step.with.tag_name, '${{ needs.check-stable.outputs.tag }}');
  }
});
