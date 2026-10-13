import { access } from 'node:fs/promises';
import path from 'node:path';

import type { CheckConfig, RepoMount } from './types';

let config: CheckConfig | undefined;

export const setConfig = (next: CheckConfig) => {
  config = next;
};

export const getConfig = (): CheckConfig => {
  if (!config) throw new Error('Check configuration has not been initialized');
  return config;
};

export const rootDir = () => getConfig().rootDir;

export const mountDir = (mount: RepoMount) => path.resolve(rootDir(), mount.dir);

export const exists = async (file: string): Promise<boolean> => {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
};

export const existsInRepo = (file: string) => exists(path.resolve(rootDir(), file));
