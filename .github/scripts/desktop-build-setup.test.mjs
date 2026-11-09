import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

import YAML from 'yaml';

const actionPath = new URL('../actions/desktop-build-setup/action.yml', import.meta.url);
const desktopLockfilePath = new URL('../../apps/desktop/pnpm-lock.yaml', import.meta.url);
const repository = fileURLToPath(new URL('../..', import.meta.url));
const bash = process.platform === 'win32' ? 'C:/Program Files/Git/bin/bash.exe' : 'bash';

for (const failures of [0, 1, 2, 3]) {
  test(`Bun setup handles ${failures} failed download attempts without hiding exhaustion`, async () => {
    const action = YAML.parse(
      await readFile(new URL('../actions/setup-env/action.yml', import.meta.url), 'utf8'),
    );
    const steps = Object.fromEntries(
      action.runs.steps.filter((step) => step.id).map((step) => [step.id, { outcome: 'skipped' }]),
    );
    let attempts = 0;
    let failed = false;
    for (const step of action.runs.steps) {
      if (step.if && !runInNewContext(step.if.replaceAll(/^\$\{\{\s*|\s*\}\}$/g, ''), { steps }))
        continue;
      const isBun = step.uses === 'oven-sh/setup-bun@v2';
      if (isBun) {
        assert.equal(step.with['bun-version'], '${{ inputs.bun-version }}');
        attempts++;
      }
      const outcome = isBun && attempts <= failures ? 'failure' : 'success';
      if (step.id) steps[step.id] = { outcome };
      if (outcome === 'failure' && !step['continue-on-error']) {
        failed = true;
        break;
      }
    }
    assert.equal(attempts, Math.min(failures + 1, 3));
    assert.equal(failed, failures === 3);
  });
}

for (const failures of [0, 1, 2, 3]) {
  test(`Desktop dependency setup handles ${failures} failed installs and preserves arguments`, async (t) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'desktop-install-retry-'));
    t.after(() => rm(root, { recursive: true, force: true }));
    const action = YAML.parse(await readFile(actionPath, 'utf8'));
    const install = action.runs.steps.find((step) => step.name === 'Install dependencies');
    const countPath = path.join(root, 'attempts').replaceAll('\\', '/');
    const result = spawnSync(
      bash,
      [
        '-c',
        `
        pnpm() {
          [[ "$*" == 'install --node-linker=hoisted' ]] || return 99
          local attempts=0
          if [[ -f "$ATTEMPT_FILE" ]]; then read -r attempts < "$ATTEMPT_FILE"; fi
          attempts=$((attempts + 1))
          echo "$attempts" > "$ATTEMPT_FILE"
          if ((attempts <= FAILURES)); then return 42; fi
        }
        sleep() { echo "retry delay: $1"; }
        export -f pnpm sleep
        ${install.run}
        `,
      ],
      {
        cwd: repository,
        encoding: 'utf8',
        env: {
          ...process.env,
          ATTEMPT_FILE: countPath,
          FAILURES: String(failures),
          GITHUB_WORKSPACE: repository.replaceAll('\\', '/'),
        },
      },
    );
    assert.equal(result.status, failures === 3 ? 42 : 0, result.stdout + result.stderr);
    assert.equal(Number(await readFile(countPath, 'utf8')), Math.min(failures + 1, 3));
    const delays = [...result.stdout.matchAll(/retry delay: (\d+)/g)].map((match) =>
      Number(match[1]),
    );
    assert.deepEqual(delays, [15, 30].slice(0, Math.min(failures, 2)));
  });
}

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

test('Desktop lockfile snapshots have matching package metadata', async () => {
  const lockfile = YAML.parse(await readFile(desktopLockfilePath, 'utf8'));
  const packageKeys = Object.keys(lockfile.packages ?? {});
  const missingMetadata = Object.keys(lockfile.snapshots ?? {}).filter(
    (snapshotKey) =>
      !packageKeys.some(
        (packageKey) => snapshotKey === packageKey || snapshotKey.startsWith(`${packageKey}(`),
      ),
  );

  assert.deepEqual(missingMetadata, []);
});
