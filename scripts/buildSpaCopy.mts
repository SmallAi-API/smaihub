import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const publicSpaDir = resolve(root, 'public/spa');
const outputAssetsDir = resolve(publicSpaDir, 'assets');
const desktopAssetsDir = resolve(root, 'dist/desktop/assets');
const mobileAssetsDir = resolve(root, 'dist/mobile/assets');

const copyAssetsIntoOutput = (sourceDir: string) => {
  if (!existsSync(sourceDir)) return;

  for (const entryName of readdirSync(sourceDir)) {
    cpSync(resolve(sourceDir, entryName), resolve(outputAssetsDir, entryName), {
      force: true,
      recursive: true,
    });
  }
};

if (!existsSync(desktopAssetsDir)) {
  throw new Error(`Desktop assets not found: ${desktopAssetsDir}`);
}

mkdirSync(publicSpaDir, { recursive: true });
rmSync(outputAssetsDir, { force: true, recursive: true });
mkdirSync(outputAssetsDir, { recursive: true });

copyAssetsIntoOutput(desktopAssetsDir);
copyAssetsIntoOutput(mobileAssetsDir);

execSync('tsx scripts/generateSpaTemplates.mts', { cwd: root, stdio: 'inherit' });
