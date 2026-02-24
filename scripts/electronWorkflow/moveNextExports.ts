import path from 'node:path';

import fs from 'fs-extra';

const rootDir = path.resolve(__dirname, '../..');

const exportSourceDir = path.join(rootDir, 'out');
const exportTargetDir = path.join(rootDir, 'apps/desktop/dist/next');

const assertWebpackRenderer = (rendererRoot: string) => {
  const indexHtmlPath = path.join(rendererRoot, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error(`Desktop renderer index not found: ${indexHtmlPath}`);
  }

  const html = fs.readFileSync(indexHtmlPath, 'utf8');
  if (/turbopack-[\w-]+\.js/.test(html)) {
    throw new Error('Desktop renderer still references Turbopack runtime in index.html');
  }

  if (!/webpack-[\w-]+\.js/.test(html)) {
    throw new Error('Desktop renderer does not reference webpack runtime in index.html');
  }

  const chunksDir = path.join(rendererRoot, '_next', 'static', 'chunks');
  if (fs.existsSync(chunksDir)) {
    const turbopackChunks = fs
      .readdirSync(chunksDir)
      .filter((file) => file.startsWith('turbopack-') && file.endsWith('.js'));

    if (turbopackChunks.length > 0) {
      throw new Error(
        `Desktop renderer contains Turbopack chunk files: ${turbopackChunks.join(', ')}`,
      );
    }
  }
};

if (!fs.existsSync(exportSourceDir)) {
  throw new Error(
    `No Next export output found at ${exportSourceDir}. Run desktop renderer build first.`,
  );
}

console.log(`Copying Next export assets from ${exportSourceDir} to ${exportTargetDir}...`);

if (fs.existsSync(exportTargetDir)) {
  fs.removeSync(exportTargetDir);
}

fs.ensureDirSync(exportTargetDir);
fs.copySync(exportSourceDir, exportTargetDir, { overwrite: true });

assertWebpackRenderer(exportTargetDir);

console.log('Export assets copied successfully.');
console.log('Export move completed.');
