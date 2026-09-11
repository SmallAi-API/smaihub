import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const repositoryRoot = path.resolve(import.meta.dirname, '../..');

const resolveDesktopRoot = () => {
  const configuredRoot = process.env.DESKTOP_BUILD_ROOT;
  const desktopRoot = configuredRoot
    ? path.resolve(configuredRoot)
    : path.join(repositoryRoot, 'apps/desktop');

  if (!existsSync(path.join(desktopRoot, 'package.json'))) {
    throw new Error(`Desktop package.json not found at ${desktopRoot}`);
  }

  return desktopRoot;
};

/**
 * Build desktop application based on current operating system platform
 */
const buildElectron = () => {
  const platform = os.platform();
  const startTime = Date.now();
  const desktopRoot = resolveDesktopRoot();

  console.log(`🔨 Starting to build desktop app for ${platform} platform...`);

  try {
    let buildCommand = '';

    // Determine build command based on platform
    switch (platform) {
      case 'darwin': {
        buildCommand = 'npm run package:mac';
        console.log('📦 Building macOS desktop application...');
        break;
      }
      case 'win32': {
        buildCommand = 'npm run package:win';
        console.log('📦 Building Windows desktop application...');
        break;
      }
      case 'linux': {
        buildCommand = 'npm run package:linux';
        console.log('📦 Building Linux desktop application...');
        break;
      }
      default: {
        throw new Error(`Unsupported platform: ${platform}`);
      }
    }

    // Execute build command
    execSync(buildCommand, { cwd: desktopRoot, stdio: 'inherit' });

    const endTime = Date.now();
    const buildTime = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`✅ Desktop application build completed! (${buildTime}s)`);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
};

// Execute build
buildElectron();
