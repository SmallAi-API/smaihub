import { isDesktop } from '@lobechat/const';
import { useMemo } from 'react';

import { useElectronStore } from '@/store/electron';
import { electronSyncSelectors } from '@/store/electron/selectors';

/**
 * Resolve an avatar value for the current runtime.
 *
 * Root-relative avatars (e.g. the default `/logo.png`) resolve against the
 * document origin. On web that's the cloud origin, so the file loads fine; in
 * the desktop app the origin is `app://renderer`, where the file isn't served —
 * the image breaks. Mirror the user-avatar fix ({@link useUserAvatar}): on
 * desktop, prefix a `/`-rooted avatar with the remote server URL so it loads
 * from the cloud instead.
 *
 * Non-string / emoji / already-absolute (`http(s)://`, `data:`) avatars are
 * returned unchanged.
 */
export const useAvatarUrl = (avatar?: string): string | undefined => {
  const remoteServerUrl = useElectronStore(electronSyncSelectors.remoteServerUrl);

  return useMemo(() => {
    if (!isDesktop || !remoteServerUrl || !avatar || !avatar.startsWith('/')) return avatar;

    return remoteServerUrl + avatar;
  }, [avatar, remoteServerUrl]);
};
