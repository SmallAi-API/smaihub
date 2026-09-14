import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REPO_ROOT = resolve(process.cwd());
const SCOPE = '@lobechat/';

const readPackageJson = (path: string) =>
  JSON.parse(readFileSync(path, 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    name: string;
  };

/**
 * The Desktop build installs with `--node-linker=hoisted`, and its CI setup wipes
 * every nested `node_modules` under `packages` before the isolated install. After
 * that wipe the only place a workspace package can be resolved from is the root
 * `node_modules`, which pnpm populates solely from the ROOT manifest's dependency
 * list. So a package that is only reachable transitively (declared by another
 * workspace package but never by the root) disappears at bundle time and Rolldown
 * fails with "failed to resolve import" — this is what broke
 * `@lobechat/agent-manager-runtime` in the desktop release build.
 *
 * Locally the gap is invisible because the nested links still exist, so this
 * closure has to be asserted rather than discovered by a release build.
 */
describe('workspace dependency closure', () => {
  const rootManifest = readPackageJson(join(REPO_ROOT, 'package.json'));
  const rootDeclared = new Set(
    [
      ...Object.keys(rootManifest.dependencies ?? {}),
      ...Object.keys(rootManifest.devDependencies ?? {}),
    ].filter((name) => name.startsWith(SCOPE)),
  );

  const workspacePackages = new Map<string, string>();
  for (const entry of readdirSync(join(REPO_ROOT, 'packages'))) {
    const manifestPath = join(REPO_ROOT, 'packages', entry, 'package.json');
    if (!existsSync(manifestPath)) continue;
    workspacePackages.set(readPackageJson(manifestPath).name, manifestPath);
  }

  it('declares every transitively reachable workspace package in the root manifest', () => {
    const missing = new Map<string, string[]>();
    const visited = new Set<string>();

    const walk = (name: string) => {
      if (visited.has(name)) return;
      visited.add(name);

      const manifestPath = workspacePackages.get(name);
      if (!manifestPath) return;

      for (const dependency of Object.keys(readPackageJson(manifestPath).dependencies ?? {})) {
        if (!dependency.startsWith(SCOPE)) continue;

        if (!rootDeclared.has(dependency)) {
          missing.set(dependency, [...(missing.get(dependency) ?? []), name]);
        }
        walk(dependency);
      }
    };

    for (const name of rootDeclared) walk(name);

    expect(Object.fromEntries(missing)).toEqual({});
  });
});
