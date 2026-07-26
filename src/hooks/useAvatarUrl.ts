import { isDesktop } from '@lobechat/const';
import { useMemo } from 'react';

import { useElectronStore } from '@/store/electron';
import { electronSyncSelectors } from '@/store/electron/selectors';

/**
 * Root-relative paths that ship inside the renderer bundle (Vite copies
 * `public/` into the desktop renderer output). These resolve against
 * `app://renderer` and are served straight off disk, so they must NOT be
 * rewritten to the cloud — doing so turns a local file read into a network
 * request that fails on a flaky connection and falls back to initials.
 */
const BUNDLED_ASSET_PREFIXES = ['/avatars/', '/icons/', '/logo.png'];

const isBundledAsset = (avatar: string) =>
  BUNDLED_ASSET_PREFIXES.some((prefix) => avatar.startsWith(prefix));

/**
 * Resolve an avatar value for the current runtime.
 *
 * Root-relative avatars resolve against the document origin. On web that's the
 * cloud origin, so everything loads fine. In the desktop app the origin is
 * `app://renderer`, which splits `/`-rooted avatars into two kinds:
 *
 * - **Bundled assets** (`/logo.png`, `/avatars/*`) ship with the app and are
 *   served from disk. Leave them alone.
 * - **Server-backed paths** (e.g. an uploaded `/api/avatar.png`) only exist on
 *   the remote server, so they get prefixed with the remote server URL.
 *
 * Non-string / emoji / already-absolute (`http(s)://`, `data:`) avatars are
 * returned unchanged.
 */
export const useAvatarUrl = (avatar?: string): string | undefined => {
  const remoteServerUrl = useElectronStore(electronSyncSelectors.remoteServerUrl);

  return useMemo(() => {
    if (!isDesktop || !remoteServerUrl || !avatar || !avatar.startsWith('/')) return avatar;
    if (isBundledAsset(avatar)) return avatar;

    return remoteServerUrl + avatar;
  }, [avatar, remoteServerUrl]);
};
