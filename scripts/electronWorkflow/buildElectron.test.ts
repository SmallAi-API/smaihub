import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

interface PackageJson {
  scripts: Record<string, string>;
}

describe('buildElectron', () => {
  it('should only invoke package scripts defined by the desktop app', async () => {
    const [buildElectronSource, desktopPackageSource] = await Promise.all([
      readFile(path.resolve('scripts/electronWorkflow/buildElectron.ts'), 'utf8'),
      readFile(path.resolve('apps/desktop/package.json'), 'utf8'),
    ]);
    const desktopPackage = JSON.parse(desktopPackageSource) as PackageJson;
    const referencedScripts = [
      ...buildElectronSource.matchAll(/npm run ([\w:-]+) --prefix=\.\/apps\/desktop/g),
    ].map((match) => match[1]);

    expect(referencedScripts).toEqual(['package:mac', 'package:win', 'package:linux']);

    for (const script of referencedScripts) {
      expect(desktopPackage.scripts, `missing desktop script: ${script}`).toHaveProperty(script);
    }
  });
});
