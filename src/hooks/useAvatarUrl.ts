import { isDesktop } from '@lobechat/const';
import { useMemo } from 'react';

import { useElectronStore } from '@/store/electron';
import { electronSyncSelectors } from '@/store/electron/selectors';

/**
 * Root-relative paths that must stay root-relative on desktop.
 *
 * Two different reasons, same outcome:
 *
 * - `/avatars/*`, `/icons/*`, `/logo.png` ship inside the renderer bundle (Vite
 *   copies `public/` into the desktop output) and are served off disk by the
 *   `app://` handler. Rewriting them to the cloud turns a local file read into a
 *   network request that breaks whenever the connection does.
 * - `/f/*` is the uploaded-file proxy. It is auth-guarded, so it has to stay
 *   root-relative for the desktop backend proxy to intercept it and inject
 *   `Oidc-Auth` (see `BACKEND_PATH_PREFIXES`). An absolute cross-origin URL
 *   would bypass the proxy and 404 for lack of credentials.
 */
const LOCALLY_RESOLVED_PREFIXES = ['/avatars/', '/icons/', '/logo.png', '/f/'];

const isLocallyResolved = (avatar: string) =>
  LOCALLY_RESOLVED_PREFIXES.some((prefix) => avatar.startsWith(prefix));

/**
 * Resolve an avatar value for the current runtime.
 *
 * Root-relative avatars resolve against the document origin. On web that's the
 * cloud origin, so everything loads fine. In the desktop app the origin is
 * `app://renderer`, which splits `/`-rooted avatars into two kinds:
 *
 * - Paths the desktop runtime already resolves itself — bundled assets and
 *   proxied backend routes. Left untouched (see {@link LOCALLY_RESOLVED_PREFIXES}).
 * - Anything else that only exists on the remote server, which gets prefixed
 *   with the remote server URL.
 *
 * Non-string / emoji / already-absolute (`http(s)://`, `data:`) avatars are
 * returned unchanged.
 *
 * `undefined` is only ever returned for an `undefined` input, so callers that
 * pass a resolved avatar (e.g. one already defaulted to `DEFAULT_USER_AVATAR`)
 * keep a plain `string` — hence the overloads.
 */
export function useAvatarUrl(avatar: string): string;
export function useAvatarUrl(avatar?: string): string | undefined;
export function useAvatarUrl(avatar?: string): string | undefined {
  const remoteServerUrl = useElectronStore(electronSyncSelectors.remoteServerUrl);

  return useMemo(() => {
    if (!isDesktop || !remoteServerUrl || !avatar || !avatar.startsWith('/')) return avatar;
    if (isLocallyResolved(avatar)) return avatar;

    return remoteServerUrl + avatar;
  }, [avatar, remoteServerUrl]);
}
