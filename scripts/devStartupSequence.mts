/**
 * Development startup sequence:
 * 1) env checks + summary
 * 2) start Next.js dev server (3010)
 * 3) start Vite SPA dev server (9876)
 */
import { type ChildProcess, spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

import * as dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

const require = createRequire(import.meta.url);
const { checkDeprecatedAuth } = require('./_shared/checkDeprecatedAuth.js');

dotenvExpand.expand(dotenv.config());

const isDesktop = process.env.NEXT_PUBLIC_IS_DESKTOP_APP === '1';
const isServerDB = !!process.env.DATABASE_URL;

const AUTH_SECRET_DOC_URL =
  'https://lobehub.com/docs/self-hosting/environment-variables/auth#auth-secret';
const KEY_VAULTS_SECRET_DOC_URL =
  'https://lobehub.com/docs/self-hosting/environment-variables/basic#key-vaults-secret';

function checkRequiredEnvVars(): void {
  if (isDesktop || !isServerDB) return;

  const missingVars: { docUrl: string; name: string }[] = [];

  if (!process.env.AUTH_SECRET) {
    missingVars.push({ docUrl: AUTH_SECRET_DOC_URL, name: 'AUTH_SECRET' });
  }

  if (!process.env.KEY_VAULTS_SECRET) {
    missingVars.push({ docUrl: KEY_VAULTS_SECRET_DOC_URL, name: 'KEY_VAULTS_SECRET' });
  }

  if (missingVars.length > 0) {
    console.error('\n' + '═'.repeat(70));
    console.error('❌ ERROR: Missing required environment variables!');
    console.error('═'.repeat(70));
    console.error('\nThe following environment variables are required for server database mode:\n');
    for (const { name, docUrl } of missingVars) {
      console.error(`  • ${name}`);
      console.error(`    📖 Documentation: ${docUrl}\n`);
    }
    console.error('Please configure these environment variables and redeploy.');
    console.error(
      '\n💡 TIP: If you previously used NEXT_AUTH_SECRET, simply rename it to AUTH_SECRET.',
    );
    console.error('═'.repeat(70) + '\n');
    process.exit(1);
  }
}

function getCommandVersion(command: string): string | null {
  try {
    return spawnSyncOutput(command, ['--version'])?.split('\n')[0] ?? null;
  } catch {
    return null;
  }
}

function spawnSyncOutput(command: string, args: string[]): string | null {
  try {
    // Keep this local helper simple and cross-platform.
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    child.stdout?.on('data', (d) => {
      stdout += d.toString();
    });
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

function printEnvInfo(): void {
  console.log('\n📋 Dev Environment Info:');
  console.log('─'.repeat(50));
  console.log(`  Node.js: ${process.version}`);
  console.log(`  npm: ${getCommandVersion('npm') ?? 'not installed'}`);

  const bunVersion = getCommandVersion('bun');
  if (bunVersion) console.log(`  bun: ${bunVersion}`);

  const pnpmVersion = getCommandVersion('pnpm');
  if (pnpmVersion) console.log(`  pnpm: ${pnpmVersion}`);

  console.log('\n  Auth Environment Variables:');
  console.log(`    APP_URL: ${process.env.APP_URL ?? '(not set)'}`);
  console.log(`    AUTH_EMAIL_VERIFICATION: ${process.env.AUTH_EMAIL_VERIFICATION ?? '(not set)'}`);
  console.log(`    AUTH_ENABLE_MAGIC_LINK: ${process.env.AUTH_ENABLE_MAGIC_LINK ?? '(not set)'}`);
  console.log(`    AUTH_SSO_PROVIDERS: ${process.env.AUTH_SSO_PROVIDERS ?? '(not set)'}`);
  console.log('─'.repeat(50));
}

function runNodeBin(binPath: string, args: string[]): ChildProcess {
  return spawn(process.execPath, [binPath, ...args], {
    env: process.env,
    stdio: 'inherit',
  });
}

function startDevServers() {
  const nextBin = path.resolve(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
  const viteBin = path.resolve(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js');

  const nextProc = runNodeBin(nextBin, ['dev', '-p', '3010']);
  const viteProc = runNodeBin(viteBin, ['--port', '9876']);

  let shuttingDown = false;

  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    nextProc.kill('SIGTERM');
    viteProc.kill('SIGTERM');
  };

  const onChildExit = (name: string, code: number | null, signal: NodeJS.Signals | null) => {
    if (!shuttingDown) {
      console.error(
        `\n[dev] ${name} exited unexpectedly (code=${code ?? 'null'}, signal=${signal ?? 'null'})`,
      );
      shutdown();
      process.exitCode = code ?? 1;
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  nextProc.on('exit', (code, signal) => onChildExit('next', code, signal));
  viteProc.on('exit', (code, signal) => onChildExit('vite', code, signal));
}

checkDeprecatedAuth();
checkRequiredEnvVars();
printEnvInfo();
startDevServers();
